# Code Review: SubHeaderToolbar Phase 3 (admin/users 適用)

| 項目 | 値 |
|---|---|
| 対象 Plan | [2026-07-07-1430-subheader-toolbar.md](../plans/2026-07-07-1430-subheader-toolbar.md) |
| 対象差分 | feature/subheader-toolbar の Phase 3 (AdminListTable subHeader opt-in / admin/users 適用 / --topbar-h 取り下げ / onFilteredCountChange) |
| レビュアー | Claude Code (code-reviewer agent、2 往復) |

## 1 巡目: NEEDS WORK

**[BLOCKER]** `toolbar="external"` 時、SubHeader の件数が絞り込み前の総数固定で、
検索で 12→1 行に絞っても「表示: 12件」のまま可視行と矛盾する (内蔵 toolbar 時の
「M / N件」から機能後退)。修正方針として DataTable からの件数公開 callback を提案。

**[NICE-TO-HAVE]**
- ページ h1 除去で admin/users から heading 要素が消える (SR の見出しナビ低下)
- `subHeader.createHref` 単独指定でボタンが出ない footgun (union 型化の提案)
- subHeader モードでは columnPicker / 内蔵リセットのスコープが内蔵 toolbar と異なる
- SubHeaderToolbar JSDoc の「--topbar-h に反映」が wanonwan 実装方針と乖離

確認済みの良い点: `subHeader` 未指定時の後方互換は完全維持 / controlled `queryState` の
setter は安定でループなし / `onCreate` + `createHref` 二重指定は IconButton の
modified-click 委譲と噛み合い妥当 / `--topbar-h` 取り下げ後も scss の
`var(--topbar-h, 0px)` はフォールバック付きで dead ではない。

## 修正対応 (2 巡目で確認)

1. **BLOCKER**: `ClientDataTable` に `onFilteredCountChange(filteredCount, totalCount)` を
   追加 (types JSDoc + effect + テスト)。AdminListTable が `useCallback` で受けて
   `DataCountDisplay` に `outOf` 付きで反映。実機で 閉「表示: 12件」→ 検索
   「表示: 1 / 12件」→ リセット「表示: 12件」を確認
2. title を `<h1>` で描画 (SCSS に margin リセット)
3. JSDoc を「main が独自スクロールする構成では --topbar-h を設定しない」に更新
4. union 型化 / columnPicker は残課題として見送り (Plan 残課題に記録)

## 2 巡目判定

- callback は参照安定 + optional chaining ガードで再レンダーループ・非 subHeader 経路への
  副作用なし。後方互換維持。BLOCKER・新規リグレッションなし。

## verdict

**APPROVE**
