# Review: DB を migrations(真実)+snapshot(生成物) 体制へ移行

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-24 11:46 JST |
| レビュアー | Claude Code（code-reviewer + security-reviewer 並列） |
| 対象 Plan | [`plans/2026-07-24-0210-db-migrations-snapshot.md`](../plans/2026-07-24-0210-db-migrations-snapshot.md) |
| ブランチ | `feature/db-migrations-snapshot` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | BLOCKER なし。NICE-TO-HAVE のみ |
| Plan 判定 | N/A | 本 Review では計画妥当性は見ない |
| 実装判定 | APPROVE | 4 経路（dev/CI/stg/prod）で破綻せず、データ破壊・二重適用・CD 破壊の経路が塞がれている |
| 記録整理 | OK | Plan と実装は整合 |

security-reviewer / code-reviewer とも独立に **APPROVE**。CRITICAL/HIGH は 0 件。

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 推奨修正 |
|---|---|---|---|
| ~~LOW [NICE]~~ **対応済** | `scripts/db-snapshot.mjs` | pgvector/pg_cron/pgtap の apt 版が未ピンで、版がズレると snapshot の `COMMENT ON EXTENSION` 版文字列が変わり drift 検査が spurious に落ちうる | **対応**: normalize で `COMMENT ON EXTENSION` 行を除去（拡張の有無は本文で担保）。決定性・fresh init 再検証済み |
| LOW [NICE] | `scripts/db-snapshot.mjs:76,139-140,149` | version/queue 名補間が `db-migrate.mjs:58` の `sqlStr` を共有せず生補間。値は dev 管理下（ファイル名・キュー名）で外部入力でないため実害なしだが非対称 | `sqlStr` を共通 util に切り出して両スクリプトで使う |
| LOW [NICE] | `scripts/db-snapshot.mjs:63` | `execFileSync("sleep", ["1"])` は native Windows で ENOENT。保守コマンド `db:snapshot` のみ影響（日常 `db:migrate` は非依存） | `await new Promise(r => setTimeout(r, 1000))` へ置換（スクリプト async 化） |
| LOW [NICE] | `scripts/db-migrate.mjs:116` | fast-path が非トランザクション。途中失敗で中途半端な状態が残り再実行は増分経路の `CREATE TABLE` 衝突で停止 → `down -v` が必要。空 DB 専用・失敗＝snapshot 破損（CI 検知）で影響限定的 | README トラブルシュートに「fast-path 失敗時は `down -v` でやり直す」を追記 |
| LOW [NICE] | `scripts/db-snapshot.mjs:120,123` | `^CREATE SCHEMA`/`^CREATE FUNCTION`（行頭 /m）は将来 `EXECUTE 'CREATE SCHEMA …'` 等の関数本体内行頭リテラルを誤爆し得る。現行 migrations では発生せず drift 検査が担保 | コメントに「行頭 DDL 前提」の制約を明記 |
| LOW [NICE] | `packages/db/snapshot/schema.sql:58` | pgtap（テスト用拡張）と内省ビューへの app_user GRANT が snapshot に含まれ fast-path 経由で prod にも入りうる。無害なビューだが既存スタック由来で本 PR は移動のみ | 別課題（スコープ外）。将来 prod init から pgtap を外す検討 |

## 実装レビュー

- **自動分岐（db-migrate.mjs:98-137）**: `to_regclass('public.schema_migrations')` → `to_regclass('public.users')` の二段判定で、旧構築 DB を確実に baseline 採用へ流し既存 prod を再構築しない。fast-path は `hasAppTables === false` 限定で `CREATE TABLE`（IF NOT EXISTS 無し）衝突経路なし。
- **トランザクション境界**: `0001_initial.sql` はトップレベル COMMIT/BEGIN・CONCURRENTLY を含まず（`BEGIN` は plpgsql 本体のみ）、`BEGIN;…;COMMIT;` で安全に包める。`-- migrate:no-transaction` マーカーも将来用に用意。
- **後始末**: db-snapshot の使い捨てコンテナは先頭 + finally で二重 rm、起動待ち 60 回上限。ポート非公開。
- **injection**: 全 docker 呼び出しが `execFileSync` + 配列引数（no shell）。migration 名は stdin 分離で psql へ。version は sqlStr でリテラル化。
- **CD**: `db:migrate` が空→snapshot/既存→増分を自動分岐するため cd.yml 変更不要。稼働中 prod（tracker あり）は増分のみ。

## 運用 / インフラ影響

- **既存データ**: baseline 採用により旧 `schema/*.sql` 構築 DB は再構築されない。稼働中 stg/prod は現状 deploy skip 運用で存在しないため移行不要。
- **compose/volume**: 変更なし（`00_bootstrap.sql` の initdb.d マウントは据え置き）。
- **env**: 追加なし。
- **権限分離**: app_user への GRANT は app/public 限定。auth スキーマ・supabase_auth_admin・`GRANT ... TO PUBLIC`・superuser 系は snapshot に 0 件（CLAUDE.md 準拠）。

## 検証

- [x] `pnpm -r typecheck` green
- [x] `pnpm --filter @wanonwan/web build` green
- [x] dev fresh init（snapshot fast path 1.1s / seed OK / pgTAP 9 通過）
- [x] 増分適用（ダミー 0002・`down -v` なし）
- [x] baseline 採用（tracker なし + 既存テーブル）
- [x] snapshot 決定性（2 回生成 byte 一致）
- [ ] CI drift 検査の実走（PR で確認）
- [ ] stg 実証（snapshot 初回 → 増分。マージ後検証）

## フォローアップ

- [x] **[対応済]** drift 検査の安定化 → normalize で `COMMENT ON EXTENSION` を除去（版差の誤検知を解消）
- [ ] `sqlStr` を共通 util 化して db-migrate/db-snapshot で共有
- [ ] db-snapshot の `sleep` を setTimeout 化（クロスプラットフォーム）
- [ ] README トラブルシュートに fast-path 失敗時の `down -v` 手順
- [ ] （別課題）prod init から pgtap を外す検討
