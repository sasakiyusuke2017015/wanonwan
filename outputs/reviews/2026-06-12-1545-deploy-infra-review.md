# Review: デプロイ基盤（stg/prod compose + nginx + CD + prod provisioning）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-12 15:45 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-06-12-1530-deploy-infra.md`](../plans/2026-06-12-1530-deploy-infra.md) |
| 親 Plan | [`plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md`](../plans/2026-06-11-1730-pleasanter-exit-1on1-rebuild.md) |
| レビュー種別 | 計画レビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **NEEDS WORK** | デプロイ基盤の方向性は妥当。ただし CD 内の migration 実行環境が未確定で、このまま実装着手すると stg/prod では dev compose 固定の `db:migrate` に当たりやすい |
| Plan 判定 | **NEEDS WORK** | B-1〜B-6 は独立 Plan に回収できているが、B-5 の migration runner を 1 段具体化してから進めたい |
| 実装判定 | N/A | 本 Review は計画のみ |
| 記録整理 | OK | Review link / Dashboard は同期済み |

## 指摘事項

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [BLOCKER] B-1 | Plan Step 5: [`deploy-infra.md` lines 102-106](../plans/2026-06-12-1530-deploy-infra.md#L102-L106) / 現行 script: [`scripts/db-migrate.mjs` lines 9-11](../../scripts/db-migrate.mjs#L9-L11), [`lines 27-35`](../../scripts/db-migrate.mjs#L27-L35) | CD の migration 実行環境がまだ曖昧。Plan は `compose pull → db:migrate → web up` と書いているが、現行 `db:migrate` は `infra/docker-compose.yml` を固定参照するため、stg/prod compose に対して走らない。D-2 の「host は compose pull + up のみ」とも少しズレる | Step 5 に「migration runner」を明記する。例: `db-migrate.mjs` を `COMPOSE_FILE` / service 名対応にする、または `docker compose -f infra/docker-compose.prod.yml run --rm migrate` の専用 service を置く。CD 手順は `postgres/gotrue 起動 → healthcheck → migration runner → web/nginx 起動` まで固定する |
| [NICE-TO-HAVE] N-1 | Plan Step 1: [`deploy-infra.md` lines 80-84](../plans/2026-06-12-1530-deploy-infra.md#L80-L84) / 現行 ignore: [`.gitignore` lines 10-13](../../.gitignore#L10-L13) | `.env.stg.example` / `.env.prod.example` は現行 `.gitignore` の `.env.*` に引っかかる。Plan には「.gitignore 確認」とあるが、実装者が見落とすと env テンプレートがコミットされない | Step 1 の作業項目に `!.env.*.example` か `!infra/.env.stg.example` / `!infra/.env.prod.example` の ignore 例外を明記する |

## 妥当性レビュー

- 過去レビューの B-1〜B-6 は、Plan のゴール・要決定・実装ステップへほぼ回収済み。特に secrets 遮断、nginx/XFF、GoTrue prod、prod provisioning、backup は章として分離されている。
- 優先順位も妥当。Plan は B-2（dev secret の prod 混入）と B-6（prod 初期 admin が作れずログイン不能）を最優先に置いており、運用事故の大きい箇所から潰す流れになっている。
- ただし migration は「前進のみ / fix-forward」だけでは足りない。stg/prod でどの compose file / container / image が SQL を持ち、どの権限で `psql` を叩くかが CD の中核なので、ここだけ Plan に追記してから実装へ進めるのが安全。

## 次に進む道

1. `deploy-infra` Plan を小さく修正する: Step 5 に migration runner の実行方式を追記し、Step 1 に env example の `.gitignore` 例外を追記する。
2. その修正後は、D-1〜D-6 の暫定推奨を笹木さん承認扱いにしてよい。特に D-2 は push 型 GHCR、D-3 は certbot、D-4 は nginx + API の多層、D-5 は SMTP なし、D-6 は host cron `pg_dump` で進める。
3. 実装は stg first で進める。順序は `secrets 遮断 → web image + stg compose → migration runner → nginx → CD → prod provisioning/backup`。prod は stg が green になってから、domain / secrets / backup 退避先を確定して通す。

## 検証（この Review 自体の）

- [x] `outputs/plans/` の 2 Plan を確認
- [x] `outputs/README.md` のステータスと次セッション起点を確認
- [x] Phase 6 焦点レビュー（2026-06-12 15:00）を確認
- [x] `infra/docker-compose.yml` / `.gitignore` / `scripts/db-migrate.mjs` / `outputs/infra-data/seed/10_users.sql` / `apps/web/lib/auth/rate-limit.ts` を確認

## フォローアップ

- [ ] Plan Step 5 に migration runner 方式を追記
- [ ] Plan Step 1 に env example の ignore 例外を追記
- [ ] 修正後、短い再レビューで `APPROVE` に進める
