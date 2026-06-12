# Review: デプロイ基盤（再計画レビュー v2）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-12 16:00 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-06-12-1530-deploy-infra.md`](../plans/2026-06-12-1530-deploy-infra.md) |
| 前回 Review | [`2026-06-12-1545-deploy-infra-review.md`](2026-06-12-1545-deploy-infra-review.md) |
| レビュー種別 | 計画レビュー（再レビュー） |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | 前回 BLOCKER / NICE-TO-HAVE は Plan に反映済み。実装着手できる粒度に到達 |
| Plan 判定 | **APPROVE** | secrets / env example / web image / nginx / GoTrue prod / migration runner / CD / provisioning / backup の実装順と検証観点が揃った |
| 実装判定 | N/A | 本 Review は計画のみ |
| 記録整理 | OK | 判断ログ・ステータス・Dashboard 同期対象が明確 |

## 指摘事項

なし。前回 Review の指摘は解消済み。

| 前回指摘 | 判定 | 確認内容 |
|---|---|---|
| [BLOCKER] B-1: migration runner 未確定 | 解消 | Plan Step 5 で `db-migrate.mjs` の `COMPOSE_FILE` / `PG_SERVICE` 対応、代替の migrate service、CD 順序（postgres/gotrue → healthcheck → migration → web/nginx）が明記された |
| [NICE-TO-HAVE] N-1: env example が `.env.*` ignore に巻き込まれる | 解消 | Plan Step 1 で `!.env.*.example` 例外と `git check-ignore` 検証が明記された |

## 妥当性レビュー

- B-2（secrets 遮断）を最初に置く順序は妥当。prod compose の `${VAR:?required}` と `dev-only-change-me` grep guard で、dev secret の混入事故を先に潰せる。
- B-5（migration 運用）は、現行 dev 固定 script から stg/prod 対応へ進める道が明確になった。web 起動前に migration を止められる順序も明記されている。
- B-6（prod provisioning）は、既存アプリの GoTrue provisioning ロジックを CLI 化する方針でよい。手書き UUID seed を prod に流さない前提も維持されている。
- D-1〜D-6 の暫定推奨は MVP の stg/prod 構築として妥当。笹木さん承認後は stg first で実装へ進めてよい。

## 次に進む道

1. 笹木さん承認を取る。
2. Claude Code が `deploy-infra` Plan の Step 1 から実装する。
3. 実装順は Plan どおり、`secrets 遮断 → web image/stg-prod compose → nginx → GoTrue prod → CD/migration runner → provisioning/backup`。
4. コードレビューでは security-reviewer 必須。特に secrets、nginx/XFF、provisioning、CD migration runner を重点確認する。

## 検証（この Review 自体の）

- [x] 対象 Plan を再読
- [x] 前回 Review の B-1 / N-1 が Plan に反映済みであることを確認
- [x] `outputs/README.md` のステータス同期対象を確認

