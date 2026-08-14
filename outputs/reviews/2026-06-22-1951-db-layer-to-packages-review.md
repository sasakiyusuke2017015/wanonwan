# Review: DB レイヤを packages/db へ移動

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-22 19:51 JST |
| レビュアー | Claude Code（+ code-reviewer agent） |
| 対象 Plan | [`plans/2026-06-22-1940-db-layer-to-packages.md`](../plans/2026-06-22-1940-db-layer-to-packages.md) |
| ブランチ | `feature/db-to-packages` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER なし。SQL は中身不変 rename、参照更新漏れなし、initdb/migrate/seed/pgTAP 実機 green |
| Plan 判定 | N/A | — |
| 実装判定 | **APPROVE** | パス更新・Dockerfile 整合・evergreen 準拠 |
| 記録整理 | OK | README/CLAUDE は現在形に更新、過去 Plan/Review は履歴として保持 |

## 検証

- [x] `pnpm install` で `@wanonwan/db` が workspace に認識（lockfile に `packages/db: {}`）
- [x] `compose:dev:down -v` → `up` で initdb（bootstrap 新パス）が効き **gotrue まで Healthy**（最重要）
- [x] `db:migrate`(14) / `db:seed`(3) / `test:db`(pgTAP 5) すべて新パスで green
- [x] turbo verify 10 タスク green（@wanonwan/db 追加の影響なし）
- [x] 現役ファイルに `infra-data` 残存なし（残りは技術選定メモ=履歴）
- [ ] CD: web/worker image に SQL 非混入（`.dockerignore` 追加済み。bootstrap は volume で image 非依存＝breakage でなく bloat 確認。CI/笹木さん）
- [ ] CI green（PR 後）

## 指摘事項

| 重大度 | ファイル | 指摘 | 対応 |
|---|---|---|---|
| LOW [NICE-TO-HAVE] | `scripts/provision.mjs:100` | seed を `readdirSync` 走査ではなく `00_org.sql` 単一ファイル直読み。将来 seed 増減時に provision 側の固定参照が漏れやすい | スコープ外。後続で seed 適用ロジック共通化の余地（残課題） |
| LOW [NICE-TO-HAVE] | `.dockerignore` | SQL のみ除外し package.json を残す設計。web/worker 両 image の build context に効く | 妥当（情報補足） |

## 実装レビュー

- **git mv で 100% rename**（履歴保持）。SQL 22 件は中身不変、適用順（ファイル名昇順）・内部配置を維持。SQL 間の `\i` 相互参照なしで副作用なし。
- **パス更新**: スクリプト 4 本（先頭コメント含む）+ compose 3 本の bootstrap マウントを `packages/db` に統一。漏れなし。
- **.dockerignore**: `packages/db/{schema,seed,tests}` を除外、`package.json` は残す → `infra/Dockerfile.web` の `COPY packages/ packages/` + `pnpm install --frozen-lockfile` が `@wanonwan/db` を解決でき、SQL は image に入らない。WHY コメント付きで evergreen 準拠。
- **`@wanonwan/db`**: scripts なし private。turbo タスク未定義でスキップ、依存元なし → workspace/turbo に無影響。
- **provision.mjs はホスト Node 実行**で SQL を読むため、.dockerignore（image build context 用）と矛盾しない。

## 運用 / インフラ影響

- **CD breakage リスクは bootstrap マウントパス**だったが、`compose:dev:down -v` からの作り直しで gotrue Healthy まで確認済み（auth role/schema が新パスから作られた）。stg/prod も同一の修正。
- postgres image（`infra/data/Dockerfile.db`）は schema を COPY しないため無変更。

## フォローアップ

- [ ] CD で web/worker image に SQL 非混入を確認（笹木さん / 次回 deploy）
- [ ] 任意: provision.mjs の seed 適用を db-seed.mjs と共通化（LOW）
