# Plan: packages/db に migrations/ + snapshot/ を導入

| 項目 | 値 |
|---|---|
| 概要 | DDL を「migrations が真実・snapshot は生成物」体制へ。本番を止めずに更新でき、空 DB は snapshot で高速初期化 |
| ステータス | 🟣 マージ承認待ち |
| 前提 Plan | [storage/db-seed 再編](2026-07-24-0110-storage-package-db-seed-restructure.md)（スコープ外に切り出した migrations 方式の本体） |
| PR | [#109](https://github.com/sasakiyusuke2017015/waoon/pull/109) |
| Review | [2026-07-24-1146-...-review.md](../reviews/2026-07-24-1146-db-migrations-snapshot-review.md)（APPROVE） |

## 目的

現状の「`schema/*.sql` を毎回全再適用」方式は、稼働中 DB の `ALTER`（列追加・型変更）を表現できない。
本番を止めずに更新するには増分 migration が要る。あわせて、空 DB の初期化は snapshot 1 本で高速化する。

方式は **案 B（migrations = source of truth / snapshot = 生成物）**。両者の一致は CI が機械検証する。
初回構築は **案 (a)（snapshot 適用が `schema_migrations` を自動で埋める）** を採用し、二重適用を防ぐ。

## スコープ

### やること

1. `packages/db/migrations/` を新設し、現行 `schema/10_*.sql` 〜 `99_rls.sql` を `0001_initial.sql` に統合
2. `packages/db/snapshot/schema.sql` を新設（`pg_dump` 生成物。`schema_migrations` の全 version INSERT を同梱）
3. `public.schema_migrations`（適用済み version 記録）を導入
4. `scripts/db-migrate.mjs` を「空 DB → snapshot 高速パス／既存 DB → 未適用 migration 適用」の自動分岐に書き換え
5. `scripts/db-snapshot.mjs` を新設（migration 適用済みの scratch DB から snapshot を再生成する保守コマンド）
6. CI に **drift 検査ジョブ**を追加（migrations を空 DB へ順次適用した結果 == リポジトリの snapshot を検証）
7. ドキュメント: `packages/db/README.md`（または seed と別に migrations の運用手順）を追加

### やらないこと（スコープ外）

- **`00_bootstrap.sql` の移動・migration 化**。ロール／スキーマ／拡張の作成は initdb.d の前提処理として現状維持
  （compose の `../packages/db/schema/00_bootstrap.sql` マウントも据え置き）
- **既存 stg/prod データの移行**。稼働中 DB は存在しない（CD deploy は `DEPLOY_HOST` 未設定で skip 運用）
- **down migration（ロールバック SQL）**。FailFast 方針（CLAUDE.md）に沿い前進のみ。切り戻しは別途判断
- seed / storage の変更（別 PR）

## 現状コンテキスト（2026-07-24 時点）

| 要素 | 現状 |
|---|---|
| DDL | [packages/db/schema/](../../packages/db/schema/) に `00_bootstrap` + `10`〜`99` の 15 本。[db-migrate.mjs](../../scripts/db-migrate.mjs) が昇順に全再適用（idempotent 前提） |
| bootstrap | `00_bootstrap.sql` を compose が initdb.d にマウント（[docker-compose.yml:20](../../infra/docker-compose.yml)）。ロール（supabase_auth_admin / app_user）、スキーマ（auth / app）、拡張（vector / pgtap / pgmq）、grant を作る。コンテナ初回起動時に 1 度だけ走る |
| 拡張の分担 | vector / pgtap / pgmq は bootstrap、pg_cron は [10_pg_cron.sql](../../packages/db/schema/10_pg_cron.sql)。**snapshot 生成時に bootstrap 済みオブジェクトと重複する**のが技術的な要注意点（下記リスク） |
| 適用時間（実測） | `schema/*.sql` 15 本の順次適用 = **約 2.5 秒**（大半は `docker compose exec` を 15 回起動するオーバーヘッド）。snapshot 1 本なら exec 1 回で **約 0.5 秒** |
| バージョン記録 | `schema_migrations` 相当なし（毎回全適用のため不要だった） |
| CD | web 起動前に [cd.yml:132](../../.github/workflows/cd.yml) が `db-migrate.mjs` を実行。稼働中 prod は無し |

## 実装計画

### 1. migrations の初期化

- `packages/db/migrations/0001_initial.sql` = 現行 `schema/{10_pg_cron,20_org,…,99_rls}.sql` を順に連結した 1 本
  （`00_bootstrap.sql` は含めない）。トランザクション境界は付けず、db-migrate 側が 1 migration = 1 txn で包む
- `packages/db/schema/` からは `10`〜`99` を削除し、`00_bootstrap.sql` のみ残す（compose のマウント経路を維持）

### 2. schema_migrations と db-migrate の自動分岐

`scripts/db-migrate.mjs` を以下のロジックへ:

```
1. public.schema_migrations (version text primary key, applied_at timestamptz default now()) を CREATE IF NOT EXISTS
2. applied = SELECT version FROM schema_migrations
3. if applied が空:
     - app テーブルが未作成であること（真に空）を確認
     - snapshot/schema.sql があれば → それを 1 本適用（内部で schema_migrations を埋める）… 高速パス
     - 無ければ → migrations/*.sql を 0001 から順に適用（各 txn で version を記録）
   else:
     - migrations のうち applied に無い version だけを昇順に適用（各 txn で version を記録）
```

- dev / CI / prod すべて `pnpm db:migrate` の 1 コマンド。空なら snapshot 高速パス（案 a を満たす）、既存なら増分
- 「applied 空だが app テーブルが存在」= 不整合として停止（partial state を snapshot で上書きしない安全ガード）

### 3. snapshot 生成コマンド

`scripts/db-snapshot.mjs`（保守用・手動実行）:

```
1. scratch DB を作成（bootstrap 相当は initdb で用意 or 明示適用）
2. migrations/*.sql を 0001 から順に適用し schema_migrations を埋める
3. pg_dump --schema-only --no-owner --no-privileges で構造を書き出す
4. bootstrap が作る拡張 / スキーマ（vector/pgtap/pgmq/auth/app）との二重宣言を回避する正規化
   （CREATE EXTENSION / CREATE SCHEMA に IF NOT EXISTS を付す決定的変換、または --exclude で除外）
5. 末尾に INSERT INTO public.schema_migrations(version) VALUES (…全 version…) を付与
6. packages/db/snapshot/schema.sql へ書き出し
```

### 4. CI drift 検査

`.github/workflows/ci.yml` に独立ジョブを追加:

```
- 空 DB を立てて migrations/*.sql を順次適用 → pg_dump（正規化）
- リポジトリの snapshot/schema.sql（正規化・schema_migrations の data 行は除外して比較）
- diff。差分あり = 「migration を足したが snapshot 再生成を忘れた」→ FAIL
```

### 5. 呼び出し側・ドキュメント

- `compose:dev:up` は `db:migrate` のまま（fresh は snapshot 高速パスに自動で乗る）
- CI の pgTAP 用 DB セットアップも `db:migrate` 経由（snapshot パスを実運用で通す）
- `packages/db/README.md` に「migration の足し方 → `pnpm db:snapshot` で再生成 → CI が一致検証」を明記

## 検証

```bash
# 1) fresh init が snapshot 高速パスで通る
pnpm compose:dev:down -v && pnpm compose:dev:up
pnpm db:seed && pnpm test:db

# 2) 増分 migration: ダミー 0002 を足して既存 DB に適用（down -v しない）
#    → 0002 だけ適用され schema_migrations に記録されることを確認

# 3) snapshot 再生成が冪等（生成物に差分が出ない）
pnpm db:snapshot && git diff --exit-code packages/db/snapshot/schema.sql

# 4) drift 検査: migration を編集して snapshot 未再生成なら CI が落ちることをローカル再現
```

## リスク

| リスク | 緩和策 |
|---|---|
| **snapshot と bootstrap のオブジェクト重複**（pg_dump が CREATE EXTENSION / SCHEMA を含み、initdb 済み DB へ再適用で衝突） | snapshot 生成時に該当行へ `IF NOT EXISTS` を付す決定的正規化、または `--exclude-schema` で除外。CI drift 検査が「snapshot 適用結果 == migration 適用結果」を保証するので、正規化の破綻は必ず検出される |
| pg_dump 出力の非決定性（列順・空白）で drift 検査が誤検知 | 生成・比較の両方で同一の正規化（`--no-owner --no-privileges`、`SET`/コメント除去、安定ソート）を通す。差分は正規化後で比較 |
| `0001_initial` 統合時に現行 `schema/*.sql` の適用順依存を壊す | 連結順を現行の昇順どおりに固定。fresh init + pgTAP 全通過で担保 |
| 「applied 空だが実は構築済み」の partial state を snapshot で上書き | app テーブル存在チェックで停止するガードを db-migrate に入れる |
| CD が prod 初回に snapshot 高速パスへ乗ってよいか | 空 DB 前提なので初回は snapshot、以降は増分で正しい。ただし本番挙動は稼働開始前に stg で 1 度実証する（検証項目に stg を追加） |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-24 | 案 B（migrations 真実・snapshot 生成物） | 同一変更を 2 箇所手書きする案 A は drift が機械検出できず、fresh init した dev と migrate した本番で構造が食い違う。evergreen.md の二重持ち禁止とも整合 |
| 2026-07-24 | 初回構築は案 (a)（snapshot が schema_migrations を自動記入） | 初回 migration の二重適用を防ぐ。dev/CI/prod を単一 `db:migrate` の自動分岐に統一でき、本番も止めずに増分適用できる |
| 2026-07-24 | `00_bootstrap.sql` は migration 化せず現状維持 | ロール/スキーマ/拡張は initdb.d で app_user 生成前に superuser 実行が要る「空環境の前提」。migration（app 層 DDL）とは責務が別。compose マウント経路も壊さない |
| 2026-07-24 | down migration は作らない | FailFast 方針。切り戻しは snapshot 復元 or 前進 migration で対応 |
| 2026-07-24 | migration 番号は 4 桁連番（`0001_`）で衝突禁止 | 参照元 ai-education は `002/004/007/033` が重複し適用順が壊れていた。単調増加を規約化する |
| 2026-07-24 | snapshot 生成は使い捨てコンテナで行う | pg_cron は `cron.database_name='waoon'`（Dockerfile.db で固定）の DB でしか CREATE できず、0001 が `cron.schedule()` を呼ぶ。scratch DB 名では失敗するため、`waoon` 名の使い捨てコンテナで生成する（dev の DB を壊さない） |
| 2026-07-24 | pg_dump は `--no-privileges` を付けない | app_user への GRANT（テーブル権限）が落ち、pgTAP が permission denied で全滅した。privileges を含める |
| 2026-07-24 | pgmq キューは dump から除外し `pgmq.create()` で再現 | pgmq は queue 実体を `pg_extension_config_dump` 登録するため、pg_dump が data/ACL は出すが structure を出さず replay で壊れる。`--exclude-schema=pgmq` + 残留 ACL 行を正規化で除去し、実在キューを読んで冪等 `pgmq.create()` を末尾に付与 |
| 2026-07-24 | 正規化で `\restrict` 行と版情報行を除去 | pg_dump は `\restrict <ランダムトークン>` を出力し毎回変わる。除去しないと「再生成して diff」の drift 検査が常に落ちる。`CREATE SCHEMA`→IF NOT EXISTS、関数→OR REPLACE も付与し bootstrap 済み DB へ再適用可能にする |
| 2026-07-24 | CI drift 検査は「再生成して `git diff --exit-code`」方式 | 別途の比較ロジックを持たず、生成器を CI で再実行して差分ゼロを確認する。正規化が決定的なので byte 一致を実測で確認済み |
| 2026-07-24 | CD（cd.yml）は変更不要 | `db:migrate` が空→snapshot/既存→増分を自動分岐するため、CD の呼び出しはそのままで初回・以降とも正しく動く |

## 未確定事項（任意・未決のみ）

- prod CD を単一 `db:migrate` に委ねるか、初回だけ明示ステップを分けるか（自動分岐で足りる見込みだが stg 実証で確定）

## ステータス

- [x] 計画確定
- [x] 実装完了
- [ ] レビュー完了 … → Review リンク
- [ ] PR 作成 … → PR リンク
- [ ] マージ後検証
  - [x] dev: fresh init が snapshot 高速パスで通る（1.1s / seed OK / pgTAP 9 通過）
  - [x] dev: ダミー 0002 の増分適用（down -v なし）
  - [x] dev: baseline 採用（tracker なし + 既存テーブル → 0001 を適用済み記録）
  - [x] snapshot 再生成が冪等（2 回生成が byte 一致）
  - [ ] CI drift 検査が期待どおり落ちる／通る（PR で実走確認）
  - [ ] stg: snapshot 初回 → 増分 migration の本番相当フロー実証
