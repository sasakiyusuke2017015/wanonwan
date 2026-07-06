# 非同期/定期ジョブ基盤（pg_cron + pgmq）

| 項目 | 値 |
|---|---|
| 概要 | 拡張だけ入っていた pgmq/pg_cron に実働基盤。Phase1=**添付の孤児掃除**（status 100 の古い行を pg_cron 純 SQL で定期削除。`app.is_stale_attachment`純関数+`app.gc_stale_attachments` SECURITY DEFINER・30分毎）。Phase2a=pgmq キュー + DELETE enqueue トリガ + 専用 Node worker(`apps/worker`)で MinIO 本体削除（parseGcMessage unit 8・superuser 接続・at-least-once）。Phase2b=Dockerfile.worker（pnpm deploy→type-stripping・docker build 実機確認）+ CD の worker image build/push + stg/prod compose の worker サービス |

> ステータス: 🟡 実装中（Phase 1 実装・pg_cron 土台 + 添付孤児掃除）

## 1. 背景・目的

技術選定メモの「通知は非同期（pgmq / pg_cron）」と、これまでの実装で溜まった
**周期/非同期で処理したい仕事**の共通土台を作る。拡張（pgmq / pg_cron）は
`00_bootstrap.sql` / `10_pg_cron.sql` で**入っているだけ**で、ジョブもキューもゼロ。

最初の実ジョブは **添付の孤児掃除**（笹木さん決定）。presigned URL を発行したが
upload が完了しなかった `attachments`（`status=100` のまま）を定期削除する。

## 2. 重要な制約（土台の形を決める）

- **pg_cron は Postgres 内で SQL を回すだけ**。MinIO 削除・メール送信・埋め込み生成のような
  **外部到達はできない**。外部が要る仕事は「pgmq に積む → アプリ側 worker が処理」が要る。
- **pgTAP harness は app_user 接続専用**（`scripts/db-test.mjs`）。グローバルな掃除は
  特権（RLS 跨ぎ）が要るため app_user からは呼ばせない。よって
  **「純関数（判定ロジック）を pgTAP で検証 + 特権アクション（削除）は runtime 検証」**に切り分ける
  （既存の pure helper + thin wrapper パターンと一致）。

## 3. 設計

### Phase 1（本 PR）— pg_cron 土台 + 添付孤児掃除（純 SQL・外部到達なし）

`outputs/infra-data/schema/85_jobs.sql`:

- `app.is_stale_attachment(status, created_at, older_than default 1day) → bool`
  孤児判定の**純関数**（`STABLE`、副作用なし）。`status=100` かつ `created_at < now()-older_than`。
  app_user に EXECUTE 付与（無害・pgTAP 用）。
- `app.gc_stale_attachments(older_than default 1day) → int`
  孤児を DELETE し件数を返す。**SECURITY DEFINER**（owner=postgres → RLS を跨ぐ）、
  `search_path=''` で全識別子修飾。PUBLIC から REVOKE（pg_cron=postgres のみ実行）。
- `cron.schedule('gc-stale-attachments', '*/30 * * * *', 'SELECT app.gc_stale_attachments()')`
  同名 jobname で**冪等更新**。migrate 再実行で重複しない。

pgTAP `outputs/infra-data/tests/jobs_gc.test.sql`: `is_stale_attachment` の真偽を
境界含めて検証（app_user）。

### Phase 2 — pgmq + 専用 Node worker（外部到達が要る仕事）

MinIO **オブジェクト本体**の掃除（Phase 1 はメタ行のみ削除＝本体は孤児として残る）。
worker 方式は **専用 Node worker（compose サービス）** に決定（pg_net は拡張追加 + 内部
エンドポイント認証が要るため見送り）。

**enqueue は DELETE トリガに一本化**: pg_cron GC だけでなくユーザー削除・avatar 置換も含め、
`attachments` の行削除すべてを `AFTER DELETE` トリガで捕捉して object_key をキューへ積む。

#### Phase 2a（本 PR）— DB enqueue + worker 本体（dev 実行）

- `86_attachment_gc_queue.sql`: `pgmq.create('attachment_gc')`（冪等）+ `app.enqueue_attachment_gc()`
  （SECURITY DEFINER で pgmq へ enqueue）+ `attachments` の AFTER DELETE トリガ。
- `apps/worker`（`@waoon/worker`）: `pgmq.read → DeleteObject → pgmq.delete` ループ。
  - `parseGcMessage`（純関数）に unit test 8 件。壊れたメッセージは `pgmq.archive` で無限再配信回避。
  - 失敗は ack せず visibility timeout で再配信（at-least-once）。
  - worker は **superuser 接続**（pgmq read/delete に特権が要るため。保守デーモン）。
  - dev は web 同様ホスト実行（`pnpm worker:start`、既定値で compose の pg/minio に接続）。
- pgTAP `attachment_gc_queue.test.sql`: DELETE トリガ存在の回帰ガード（enqueue 実値は runtime）。
- CI: worker の typecheck（`-r`）+ test を追加。

#### Phase 2b — prod デプロイ配線

- `infra/Dockerfile.worker`（plain Node。`pnpm deploy --legacy` で自己完結化 → Node 22 の
  type-stripping で TS を直接実行。**docker build + 起動を実機確認済み**）。
- `cd.yml` に worker image の build/push（GHCR `waoon-worker`・gha cache scope 分離）+ deploy の
  `dc up -d web worker nginx`（migration 後＝pgmq キュー作成済みで起動）。
- stg/prod compose に `worker` サービス（`DATABASE_URL`=superuser / `STORAGE_ENDPOINT`=内部
  `http://minio:9000` / 公開ポートなし）。`compose config` で stg/prod とも検証済み。
- env 例に `WORKER_IMAGE` / `WORKER_IMAGE_TAG`。

### 将来（このPRのスコープ外）

- 通知（イベント → pgmq → worker → 送信）。**通知チャネル（メール=SMTP / アプリ内通知表）**の
  決定が前提。
- AI 埋め込みの一括 backfill（pgmq + embeddings worker）。

## 4. 検証の切り分け

- pgTAP（CI / app_user）: `is_stale_attachment` の判定ロジック / DELETE トリガ存在 /
  worker の `parseGcMessage`（vitest 8 件）。
- **runtime（Docker・笹木さん）**: migrate 適用後に `cron.job` に `gc-stale-attachments` が
  登録されること、`SELECT app.gc_stale_attachments()` が古い `status=100` のみ削除すること
  （確定 200・直近 100 は残る）。添付を削除→`pgmq` に積まれ→`pnpm worker:start` がドレインして
  MinIO 本体が消えること（dev: pg/minio が要るため 5432/9000 を空ける or waoon stack 起動）。

## 5. ステータス

- [x] Plan ドラフト（本ファイル）
- [ ] 計画レビュー / 笹木さん承認
- [x] Phase 1 実装（85_jobs.sql: 純関数 + DEFINER 削除 + cron 登録 / pgTAP 純関数検証）
- [ ] Phase 1 runtime 検証（Docker・笹木さん: cron 登録 + 実削除）
- [x] Phase 2a 実装（86: pgmq キュー + DELETE enqueue トリガ / `apps/worker` drain ループ + parseGcMessage unit 8 / pgTAP トリガ存在 / CI worker test）。typecheck(`-r`)・test green
- [ ] Phase 2a runtime 検証（Docker・笹木さん: 削除→enqueue→worker が MinIO 本体削除）
- [x] Phase 2b 実装（Dockerfile.worker + CD の worker image build/push + deploy / stg/prod compose の worker サービス + env 例）。**docker build + 起動 + compose config を実機確認**
- [ ] Phase 2b runtime 検証（笹木さん stg: CD で waoon-worker push → worker 起動 → 添付削除で本体掃除）
