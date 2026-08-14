# Review: SubHeaderToolbar Phase 3-2 — 残り admin 一覧への展開（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-14 01:51 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-07-1430-subheader-toolbar.md`](../plans/2026-07-07-1430-subheader-toolbar.md) |
| ブランチ | `feature/subheader-toolbar-phase3-2` |
| 関連 PR | [#86](https://github.com/sasakiyusuke2017015/wanonwan/pull/86) |
| レビュー種別 | 実装 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | APPROVE | BLOCKER なし |
| Plan 判定 | N/A | 既承認 Plan（#81）の残課題 Phase 3-2 の消化。計画は再レビューしない |
| 実装判定 | APPROVE | admin 4 画面の差分。認可・データ取得ロジック不変の UI chrome 移設 |
| 記録整理 | OK | Plan 残課題の Phase 3-2 を消し込み、ステータス追記 |

## 対象差分

- `admin/users`: items 空・合計のみの `StatisticList` を撤去（SubHeader の `DataCountDisplay` と完全重複）
- `admin/questions`: ページ内 h1 + 新規作成 `Link` → `subHeader`（title / createHref / onCreate / createLabel）
- `admin/surveys`: 同上。status 別集計の `StatisticList` は情報価値があるため残置
- `admin/answers`: h1 → `subHeader={{ title }}`。admin 起点の新規作成フローが無いため create なし（検索/件数は継続表示）

## 指摘

### [NICE-TO-HAVE] onCreate / createHref の二重指定を将来 SubHeaderToolbar 側へ寄せる余地

questions / surveys で同一遷移先を `onCreate`（SPA 遷移）と `createHref`（ネイティブ動作）に併記。
現行 API の意図どおりの正しい使い方だが、横展開が進むなら「`createHref` だけで Link 経由の
SPA 遷移も担う」形に寄せると各ページの `router.push` 重複を消せる（スコープ外・別途判断）。

### [NICE-TO-HAVE] answers の暗黙挙動の明文化

`subHeader={{ title }}` のみの指定で検索/件数は既定で SubHeader に出る。意図（create なし画面）を
PR 本文に一行残す（コード変更不要 → 本 Review と PR 本文に記載して対応済み扱い）。

## 確認できた良い点

- StatisticList の残置/撤去の判断が情報価値基準で一貫（users=撤去 / surveys・answers=残置）
- 不要になった `import Link` を除去、dead import なし
- h1 撤去後も SubHeaderToolbar の title が h1 描画を担い、見出しナビの退行なし
- 認可・データ取得ロジック不変。mutation / 秘密情報 / バリデーション欠落の該当なし

## 検証

- `pnpm --filter @wanonwan/web lint` / `typecheck` / `test`（20 files / 87 tests）green
- dev 実機（compose:dev + provision + web dev）で admin 4 画面 SSR 200・旧 h1 除去・
  サーバログにエラーなし・各 API（users 14 / surveys 4 / answers 10 / questions 14 行）応答確認
- 未検証ギャップ: SubHeaderToolbar は createPortal のため SSR HTML に現れず、ブラウザ実機での
  開閉・件数連動は Phase 3（admin/users・#81）の headless Chromium 検証に依拠
  （同一コードパス・props 配線のみの差）
