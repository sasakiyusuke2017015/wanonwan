# 非同期/定期ジョブ基盤（pg_cron + pgmq）

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

### Phase 2（後続）— pgmq + アプリ worker（外部到達が要る仕事）

- MinIO **オブジェクト本体**の掃除（Phase 1 はメタ行のみ削除。本体は孤児として残る）。
- 形: pg_cron が「掃除対象の object_key」を **pgmq キューに積む** → アプリ side の
  worker が `pgmq.read` → MinIO `DeleteObject` → `pgmq.delete`。
- **worker をどう常駐させるか**が論点（compose に Node worker サービス追加 / もしくは
  pg_net で内部 API を叩く）。決定は Phase 2 の Plan で。

### 将来（このPRのスコープ外）

- 通知（イベント → pgmq → worker → 送信）。**通知チャネル（メール=SMTP / アプリ内通知表）**の
  決定が前提。
- AI 埋め込みの一括 backfill（pgmq + embeddings worker）。

## 4. 検証の切り分け

- pgTAP（CI / app_user）: `is_stale_attachment` の判定ロジック。
- **runtime（Docker・笹木さん）**: migrate 適用後に `cron.job` に `gc-stale-attachments` が
  登録されること、`SELECT app.gc_stale_attachments()` が古い `status=100` のみ削除すること
  （確定 200・直近 100 は残る）。

## 5. ステータス

- [x] Plan ドラフト（本ファイル）
- [ ] 計画レビュー / 笹木さん承認
- [x] Phase 1 実装（85_jobs.sql: 純関数 + DEFINER 削除 + cron 登録 / pgTAP 純関数検証）
- [ ] Phase 1 runtime 検証（Docker・笹木さん: cron 登録 + 実削除）
- [ ] Phase 2（pgmq + worker で MinIO 本体掃除）
