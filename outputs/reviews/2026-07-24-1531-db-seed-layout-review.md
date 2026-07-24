# Review: packages/db/seed 再編（db-seed-layout）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-24 15:31 JST |
| レビュアー | Claude Code（code-reviewer） |
| 対象 Plan | [`plans/2026-07-24-0110-...-restructure.md`](../plans/2026-07-24-0110-storage-package-db-seed-restructure.md) |
| ブランチ | `refactor/db-seed-layout` |
| 関連 PR | TBD |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | 初回判定 NEEDS WORK の BLOCKER を修正済み |
| Plan 判定 | N/A | |
| 実装判定 | APPROVE（対応後） | パス追随網羅・FK 順維持・README 整合 |
| 記録整理 | OK | |

> 初回コードレビュー判定は **NEEDS WORK**（下記 BLOCKER）。修正コミットで解消し **APPROVE**。

## 指摘事項

| 重大度 | ファイル:行 | 指摘 | 対応 |
|---|---|---|---|
| ~~BLOCKER~~ **修正済** | `scripts/seed-gotrue-dev.mjs:53` | 実コードパス `usersCsvPath` が旧 `seed/csv/users.csv` のまま（コメントの 5 行目だけ更新され 53 行目の実パスが漏れていた）。CSV は `seed/users/users.csv` へ移動済みのため `pnpm seed:gotrue:dev` が ENOENT で即死し、dev ユーザーがログインできなくなる。CI は `db:seed` のみ叩き `seed:gotrue:dev` を実行しないため検知されない | `seed/users/users.csv` へ修正。パス解決 + CSV パース（5 行）と実 GoTrue での回帰を確認 |

## 実装レビュー（確認済みの正しい点）

- **パス追随網羅（seed-from-csv.mjs）**: `masterDir`(28)→MASTER_TABLES ループ(352)、`demoDir`(29)→`seedDemoTable`(255)/`demo_users`(267)、`usersCsv` 既定値→`seed/users/users.csv`(47) すべて追随。
- **他スクリプト**: `provision.mjs` は `seed-from-csv.mjs --no-users` をサブプロセス起動する構造で `seed/csv` を直参照せず影響なし。`db-seed.mjs` は `readdirSync(seedDir)` 非再帰で `.sql` のみ拾い、`20_sample.sql`（seed 直下残置）を正しく取得しつつサブディレクトリ CSV を誤取得しない。`ci.yml` は `db:seed` 経由。
- **FK 依存順**: `MASTER_TABLES` の定義順（divisions→departments→sections→positions→urgency_levels）は develop から不変。ディレクトリ分割はファイル名解決のみで投入順は配列順のまま。
- **README 整合**: 非空スキップ（`seedTable` の rowCount>0）の説明と「`ON CONFLICT DO NOTHING` にしない理由（削除行の復活防止）」が実装と一致。master=全環境/users=dev専用/demo=--demo時のみ も投入経路表と整合。

## 検証

- [x] `seed-gotrue-dev.mjs` の CSV パス解決 + パース（5 行・先頭 code=admin）
- [x] fresh init（`down -v`→`up`→`db:seed`→`test:db` pgTAP 9 通過）※実装時
- [x] `provision --no-users`（master のみ）経路 ※実装時
- [x] `pnpm seed:gotrue:dev` を実 GoTrue で回帰（BLOCKER 修正確認）
- [x] `git grep` で他に `seed/csv` 参照が残っていないことを確認

## フォローアップ

- なし（BLOCKER 修正で完了）
