# Review: デプロイ基盤（コードレビュー v2）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-12 17:15 JST |
| レビュアー | レビュアー Agent オーケストレーション（security-reviewer / code-reviewer / architect）※Codex はトークン切れのため代替 |
| 対象 Plan | [`plans/2026-06-12-1530-deploy-infra.md`](../plans/2026-06-12-1530-deploy-infra.md) |
| 前回 Review | [`2026-06-12-1648-deploy-infra-code-review.md`](2026-06-12-1648-deploy-infra-code-review.md)（BLOCKED） |
| レビュー種別 | コードレビュー（再） |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | 前回 BLOCKER（B-1/B-2）と N-1 はいずれも妥当に修正済み。3 レビュアーとも BLOCKER 0 |
| Plan 判定 | N/A | 本レビューはコードレビュー |
| 実装判定 | **APPROVE** | secrets 遮断・ロール rotate・nginx・provision・CD の実装が Plan を満たす |
| 記録整理 | **FOLLOW-UP** | 残った NICE-TO-HAVE を Plan「残課題」へ記録（実装安全性には影響しない） |

3 視点（読み取り専用）を並列起動し統合。いずれも **APPROVE / BLOCKER 0**。

## 前回 BLOCKER の解消確認

| 前回指摘 | 判定 | 確認内容 |
|---|---|---|
| [BLOCKER] B-1: 内部 DB ロール（`supabase_auth_admin`/`app_user`）の dev 固定 PW が本番に残る | 解消 | stg/prod の initdb で [`05_rotate_roles.sh`](../../infra/data/05_rotate_roles.sh) が `ALTER ROLE ... PASSWORD :'var'`（psql 安全 quote）を適用。`00`→`05` の実行順、healthcheck（initdb 完了後に通る）→ gotrue/web 接続のタイミングも整合。`DATABASE_URL` は compose が `APP_DB_PASSWORD` から組立。[`check-secrets.mjs`](../../scripts/check-secrets.mjs) が 4 secret 全部（未設定/dev値/placeholder/最小バイト）を検査。`.env.*.example` は固定 secret なし |
| [BLOCKER] B-2: CD `dc pull` が buildable な postgres で `set -e` 停止 | 解消 | [`cd.yml`](../../.github/workflows/cd.yml) を `dc pull --ignore-buildable` + `dc build postgres` に |
| [NICE-TO-HAVE] N-1: db-migrate が env-file の DB 名/superuser を無視 | 解消 | [`scripts/lib/env.mjs`](../../scripts/lib/env.mjs) 共通パーサで `PG_DATABASE`/`PG_SUPERUSER` を `process.env > env-file > 既定` の順で解決 |

## NICE-TO-HAVE（差し戻し理由にしない）

本レビュー中に**安価なものは即修正**。残りは Plan「残課題」へ。

### 反映済み（このレビューで対応）
- env パーサが値中の `#`/クオートを取りこぼす懸念 → `.env.*.example` に「secret に `#`/クオートを使わない」注記（sec N1 / code）。
- `provision.mjs` は migration 適用済みが前提 → 使い方コメントに「先に migrate を流す」を追記（code）。
- CD の `git checkout` がローカル変更で詰まり得る → `git checkout -f` + 「実値 env は host 事前配置」コメント（code / arch）。
- 初回 initdb の待ち時間 → CD の healthcheck 待ちループを 60s に延長（arch）。
- `PG_DATABASE` は pg_cron が `wanonwan` 前提 → example に「変更不可」注記（code）。
- 既存 volume で PW を変えても rotate されない運用上の落とし穴 → `05_rotate_roles.sh` に手動 `ALTER ROLE` 手順をコメント追記（arch）。

### 残課題へ（後続）
- **nginx セキュリティヘッダ**（HSTS / X-Content-Type-Options 等）が未設定（sec N3）。
- nginx 一次レートリミットが `/api/v1/auth/` のみ。将来 `/api/` 全体に緩い zone（sec N4）。
- `provision.mjs` の service_role JWT を argv ではなく stdin 経由に、`aud` を admin 用途に絞る（既存 [`provisioning.ts`](../../apps/web/lib/auth/provisioning.ts) と併せて）（sec N5/N6）。
- `infra/backup/README.md` のリストア例の DB 名/ユーザを env 由来に（code）。
- stg/prod の同型 2 compose は現状維持で妥当。環境が 3 つ以上になったら `include` 化を再検討（arch）。

## 妥当性レビュー（要点）

- secrets 遮断は多層 fail-closed: `${VAR:?}`（compose 起動失敗）+ `check-secrets`（dev値/placeholder/最小バイト拒否）+ `05_rotate_roles.sh` の env 必須化。postgres/gotrue 非公開で攻撃面を絞った上で gate を寄せる構成は妥当。
- nginx の XFF 上書き（`$remote_addr`、append でない）が [`rate-limit.ts`](../../apps/web/lib/auth/rate-limit.ts) の `getClientIp`（XFF 先頭信頼）と整合し、レートリミット回避を封じている。
- CD 順序（pull→build postgres→up postgres/gotrue→healthcheck→migration→web/nginx）が「web 起動前に migration」要件を満たす。`sha-<commit>` タグでロールバック可。
- provision の orphan cleanup・既存 admin 検出・curl コンテナ経由の到達は MVP として合理的。

## 検証

- [x] 3 レビュアー Agent（security/code/architect）を並列起動し統合
- [x] 前回 B-1/B-2/N-1 の修正を相互参照で確認
- [x] `pnpm typecheck` PASS / 両 compose `docker compose config` PASS / `check-secrets` が template・dev-leak を reject・実値を pass
- [ ] Docker build / image / CD 実行・stg 実起動は未実施（Plan 末尾「マージ後検証」へ委譲）

## フォローアップ

- [ ] 上記「残課題へ」5 項目を Plan の残課題に記録（このレビューで実施）
- [ ] commit → PR（develop 向け）→ 笹木さんマージ承認
