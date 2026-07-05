# 計画レビュー: 仕上げ（テーマ5）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 20:40 JST |
| 対象 Plan | [2026-07-05-2015-finishing-touches.md](../plans/2026-07-05-2015-finishing-touches.md) |
| レビュア | Claude Code エージェント代行（`planner` + `architect` 並列） |

## Verdict

| 軸 | 判定 |
|---|---|
| 最終判定 | **NEEDS WORK（architect）→ 反映済み** |
| Plan 判定 | Phase 1/2 は APPROVE（即着手可）/ Phase 3/4 は設計ゲート前提で骨子承認 → 下記を反映 |

- planner: **APPROVE**（Phase1-2 即着手可・Phase3-4 は高優先 NICE を設計ゲートで解消）
- architect: **NEEDS WORK**（epic の設計に BLOCKER。Phase1-2 は設計 OK）

**両者一致**: Phase 1/2（polish）は即着手可。Phase 3/4（epic）の設計前提を Plan に反映してから実装承認。

## 反映した設計指摘（Phase 3/4 の設計ゲート議題）

### ダークモード
- **テーマは 2 系統**: System A（`design.ts` の JS/HSL → inline style）と System B（`tokens.css` の semantic CSS 変数）。app のハードコード色 114 箇所は**どちらも経由しない素の palette**。要判断#2 の「inline 併存 vs CSS 変数全面移行」の二択を **3 層モデル**に置換: 反転境界は **B（semantic トークンを `[data-theme-mode="dark"]` で上書き）**、System A は `generateColorConfig(base, isDark)` で**前景/neutral のみ**調整（ブランド色相は保持・非目標の HSL 非改修と両立）、114 箇所は **semantic トークンへ repoint 優先**・`dark:` は補助。
- **[BLOCKER] FOUC 未設計**: Jotai は hydration 後にしか走らず初回描画が明色でフラッシュ。`layout.tsx` の `<head>` に pre-paint inline script（localStorage + `matchMedia` を読み `<html>` に `data-theme-mode` 付与）+ `<html suppressHydrationWarning>` が必要。
- **[BLOCKER] body 地色**: `globals.css` の `body { background: var(--color-white) }` は反転しない → semantic surface トークンへ張替が前提。
- **[高優先] `dark:` バリアント配線**: Tailwind v4 の `dark:` は既定で `prefers-color-scheme` を見る → 手動トグル + system 選択と両立させるには `@custom-variant dark (&:where([data-theme-mode="dark"] *))` の配線が必須。
- **[高優先] 背景テーマ(9) × dark 軸**: 既存背景 9 種と dark mode の組み合わせ整合（直交か上書きか）を要判断に追加。
- **[NICE] a11y/コントラスト目標**（WCAG AA 準拠を目標とするか目視のみか）の線引きを 1 行。

### VRT
- **[BLOCKER] 安全網の対象ズレ**: 「VRT を先に入れれば 114 置換の安全網」は、114 が app 側（story 0）で VRT が catalog 141 stories のみを撮るため**成立しない**。解消: (a) app ページの Playwright スクショ VRT を足す（スコープ拡大）/ (b) 安全網主張を撤回し 114 は目視+手動確認、を要判断#3 に紐付け。
- **VRT×ダーク順序（解ける）**: **4-light（light で baseline 確立）→ Phase 3 を additive 実装（light 不変）→ 4-dark（ダーク撮影を新規 image キーで加算）**。安全網の本質は「dark 自体」ではなく「114/トークン化しても **light が不変**」の担保。差分爆発は「新規 image キーで加算」で回避。
- **[BLOCKER] MinIO CI 到達性**: GitHub-hosted runner は private MinIO に到達不可・service container は run 跨ぎで消える。baseline 永続には公開到達可能な stg バケット + Secrets か専用 S3 を決める必要。reg-suit は `reg-publish-s3-plugin`（`customEndpoint` で MinIO）+ `reg-keygen-git-hash` + `reg-notify-github`、GH artifact は reg-suit のモデルに合わず不可。
- **撮影層**: **storycap**（reg-suit 定番・storybook-static を全撮り）推奨。ただし **Storybook 10.2 系互換は要 spike**。NG 時は `index.json` + `iframe.html?id=` を Playwright で撮る薄いスクリプトにフォールバック。
- **[高優先] VRT flaky**: アニメーション atom・live date（`toLocaleDateString`）で偽陽性 diff。アニメ無効化・日付固定・font 待ちの戦略が要る。

### 構成
- epic 2 本（ダーク/VRT）は各々「単独 Plan 相当」。Phase 3/4 着手時に `outputs/plans/…-dark-mode.md` / `…-vrt.md` を**新規サブ Plan 化**し本 Plan からリンク（「判断ログ追記 or サブ Plan」の曖昧さを解消）。
- Phase 1 の被覆限界: `(admin)/layout.tsx` が client のため server layout では**セクション単位タイトル**まで。ページ個別化は `useDocumentTitle` 併用が実質必須。
