# Review: デプロイ基盤（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-12 16:48 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-06-12-1530-deploy-infra.md`](../plans/2026-06-12-1530-deploy-infra.md) |
| 関連 Review | [`2026-06-12-1600-deploy-infra-review-v2.md`](2026-06-12-1600-deploy-infra-review-v2.md) |
| レビュー種別 | コードレビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **BLOCKED** | prod/stg の credential 運用と CD pull 手順に blocking issue あり。このまま本番反映は不可 |
| Plan 判定 | APPROVE | 計画は承認済み |
| 実装判定 | **BLOCKED** | secrets 遮断の実装が `AUTH_ADMIN_PASSWORD` / `app_user` password を取りこぼし、CD が buildable service の pull で止まり得る |
| 記録整理 | OK | 本レビュー保存後、Plan / Dashboard をコード差し戻しへ同期する |

## 指摘事項

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [BLOCKER] B-1 | [`outputs/infra-data/schema/00_bootstrap.sql` lines 11-15](../../outputs/infra-data/schema/00_bootstrap.sql#L11-L15), [`infra/.env.prod.example` lines 28-29](../../infra/.env.prod.example#L28-L29), [`scripts/check-secrets.mjs` lines 38-55](../../scripts/check-secrets.mjs#L38-L55) | prod/stg で `supabase_auth_admin` と `app_user` の password が dev 固定値のまま残る。`00_bootstrap.sql` は `authadmin` / `app` で role を作成し、prod env example もその値を使うよう案内している。さらに `check-secrets.mjs` は `DEV_FALLBACKS` に `app` / `authadmin` を列挙しているのに実際は検査していない。この状態では「dev secret が prod に出ない」保証を満たせず、Plan の B-2 が未達 | stg/prod bootstrap 時に `supabase_auth_admin` / `app_user` password を env 由来へ rotate する仕組みを入れる。例: initdb 用 shell/template、または migration 前の `ALTER ROLE ... PASSWORD ...` 専用 script。`AUTH_ADMIN_PASSWORD` と `DATABASE_URL` の app_user password も必須 secret として `check-secrets.mjs` で空・dev 値・placeholder を拒否する。`.env.*.example` は値を空にし、固定値を入れない |
| [BLOCKER] B-2 | [`.github/workflows/cd.yml` line 95](../../.github/workflows/cd.yml#L95), [`infra/docker-compose.prod.yml` lines 9-13](../../infra/docker-compose.prod.yml#L9-L13) | CD の `dc pull` が全 service を対象にするため、`build:` + local image の `postgres` まで pull しようとして失敗し得る。`wanonwan-postgres:15` は GHCR に push されておらず、host local build 前提なので、`set -e` 配下ではここで deploy が止まる可能性が高い | `dc pull web gotrue nginx certbot` のように pull 対象を remote image に限定するか、`docker compose pull --ignore-buildable` を使う。postgres は `dc build postgres` または `dc up -d --build postgres gotrue` で明示的に build する |
| [NICE-TO-HAVE] N-1 | [`scripts/db-migrate.mjs` lines 29-31](../../scripts/db-migrate.mjs#L29-L31) | `--env-file` を渡しても `PG_DATABASE` / `PG_SUPERUSER` を env file から読まないため、env file 側で DB 名や superuser を変えた場合に migration が既定値 `wanonwan` / `postgres` へ向く。現テンプレートでは一致しているので即 blocker ではないが、`--env-file` 対応としては片手落ち | `check-secrets.mjs` と同等の env parser を共通化するか、`db-migrate.mjs` 内で env file を読み、CLI/env/process の優先順位を明示する |

## 検証

- [x] `pnpm typecheck` PASS
- [x] `node scripts/check-secrets.mjs infra/.env.prod.example` が expected failure（JWT / PG password / example domain）になることを確認
- [x] 主要差分を読了: compose stg/prod、Dockerfile、CD、nginx、backup、provision、migration、env templates、bootstrap
- [ ] Docker build / compose 実起動は未実施
- [ ] stg/prod 実ホスト deploy は未実施

## フォローアップ

- [ ] DB 内部ロール password を env 由来へ切り替え、`check-secrets.mjs` の検査対象を拡張する
- [ ] CD の `dc pull` を remote image 限定または `--ignore-buildable` に修正し、postgres build 手順を明示する
- [ ] 修正後に再コードレビューを依頼する
