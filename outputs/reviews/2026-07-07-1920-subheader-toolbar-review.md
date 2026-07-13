# Code Review: SubHeaderToolbar + スロット機構 (Phase 2)

| 項目 | 値 |
|---|---|
| 対象 Plan | [2026-07-07-1430-subheader-toolbar.md](../plans/2026-07-07-1430-subheader-toolbar.md) |
| 対象差分 | feature/subheader-toolbar の Phase 2 (未コミット時点)。AppLayout / SubHeaderSlot(新) / SubHeaderToolbar(新) / DataTable (toolbar 外部化 + leading) |
| レビュアー | Claude Code (code-reviewer agent) |

## 依頼観点への回答（すべて問題なし）

1. **SubHeaderPortal の hooks 順序 / 再レンダーループ** — `useContext` → `useEffect` を無条件で呼び、throw は全 hooks の後。`slotContextValue` は `[slotContainer]` のみ依存 + 安定 setter で、`SubHeaderPortal` の effect は再発火しない。ループなし。
2. **SSR/hydration** — 初期 `subHeaderH=44` が既定ラベル `h-11` と一致し、`paddingTop` / `--topbar-h` は SSR と初回描画で同値。claim は effect 内 (post-hydration)。ResizeObserver は mount 後 + 存在ガードあり。
3. **fixed + 高さ auto の重なり** — SubHeader は z-index:40 で main より前面。本文 offset が実測追従するため潜り込みなし。
4. **SCSS `[data-dt-toolbar]` 上書き** — 属性セレクタはハッシュ非依存で、Toolbar の両分岐 (collapsible / 非) の外側 div に属性が付くため有効。
5. **toolbar='external' の gating** — `toolbar === 'internal'` の一点に集約し、絞り込み・ソート・下部ページャは分岐外で継続。client/server 両モードのテストで担保。

## [NICE-TO-HAVE]

1. **フォーマット churn**: root `.prettierrc.json` (semi/double) が packages/ui 実スタイル (no-semi/single) と食い違い、prettier 実行でファイル全体が整形されて実質変更が埋もれる。→ **レビュー後に対応済み**: 整形 hunk を revert しロジックのみ再適用 (差分 283/178 行 → 131/29 行)。config 統一は Plan 残課題へ。
2. `toolbar="external"` + `queryState` 未指定 (client) は検索が黙って効かなくなる footgun。JSDoc 記載済みだが dev warn を入れるとより FailFast (必須ではない)。
3. ResizeObserver がスライド展開中に連続発火し AppLayout を再レンダー (children は参照安定のため実害小)。体感問題が出たら rAF スロットル検討。
4. portal claim が effect 後のため、既定ラベル → ツールバーの一瞬の差し替えあり (高さ 44px 一致でシフトはほぼ無し。構造上の性質で対応不要)。

## 良い点

- `--topbar-h` を実測で配線し、従来 fallback 0 で sticky ヘッダが fixed chrome 下に潜っていた潜在問題を解消。
- gating の一点集約、SCSS の属性セレクタによる CSS Modules 両立、controlled 共有の設計が的確。

## verdict

**APPROVE**（BLOCKER なし。NICE-TO-HAVE (1) はレビュー後に解消済み、(2)〜(4) は Phase 3 実機確認で経過観察）
