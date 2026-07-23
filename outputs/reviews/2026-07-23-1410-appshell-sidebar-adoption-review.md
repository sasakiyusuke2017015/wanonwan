# Review: AppShell / Sidebar 導入とアプリシェル刷新（ui-catalog 上流同期 第 2 弾）— 計画

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 14:10 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-1357-appshell-sidebar-adoption.md`](../plans/2026-07-23-1357-appshell-sidebar-adoption.md) |
| ブランチ | `feature/ui-catalog-sync-2` |
| 関連 PR | TBD |
| レビュー種別 | 計画 |
| verdict | **NEEDS WORK** |

> 初回判定は `NEEDS WORK`。下記 BLOCKER 4 件は **2026-07-23 に Plan へ反映済み**
> （反映内容は各 Finding 末尾と Plan の判断ログを参照）。再計画レビューで最終判定を更新する。

## サマリ

上流 ui-catalog の AppShell / Sidebar 基盤導入と apps/web シェル刷新の Plan を計画レビューした。
Plan の必須要素は `_template.md` 準拠で揃い、`node scripts/gen-outputs-readme.mjs` も通る。
上流部品の採否・Phase 分割・第 1 弾の教訓（vitest ベースライン採取 / registry 更新）の反映は妥当。
一方、**上流 `tokens.css` が持ち込むグローバル CSS 変数 `--topbar-h` が Phase A 単独で
apps/web の既存 DataTable 表示を壊す**点、および **スクロールモデルの決定が計画に無い**点が
抜けていたため初回判定は `NEEDS WORK`。

## 判定スコープ

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | NEEDS WORK | BLOCKER 4 件を Plan に反映してから実装着手（反映済み・再レビュー待ち） |
| Plan 判定 | NEEDS WORK | 影響範囲（tokens 波及 / レイアウト方式 / AppFrame / nav データ供給）の記述不足 |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | FOLLOW-UP → 対応済み | dashboard 再生成と `ui (1).zip` の gitignore 登録 |

## 事実検証の結果（コマンドで裏取り）

| Plan の主張 | 検証方法 | 結果 |
|---|---|---|
| 既存 `AppShell` は利用者ゼロの dead code | `grep -rn AppShell apps packages` | apps/web からの import ゼロ。参照は barrel export と自身の test/story、`registry.ts:160`、`FormPageShell.tsx:33` の JSDoc のみ — 正しい |
| `SidebarNav` は上流と完全同一 | base / v2 / waoon の 3 者 diff | 差分は CRLF/LF のみ。base ≡ v2 でもあり上流でも未変更 — 正しい |
| `panel-left-close` が waoon に存在 | `grep lucide-registry.ts` | `lucide-registry.ts:52,107` に存在 |
| `SubHeaderPortal` は chrome 非依存 | `SubHeaderSlot.tsx` / `SubHeaderToolbar.tsx` | portal は container div への `createPortal` のみ。`SubHeaderToolbar` は `DataTable/Toolbar` 依存で `SubHeader` 非依存 — 正しい。利用は `AdminListTable.tsx:17` に集約 |
| DropdownMenu portal 修正が ColumnPicker に効く | base→v2 diff | `createPortal(..., document.body)` 化 + 外側クリック判定に `menuRef` 追加を確認。waoon の DropdownMenu 利用は 3 箇所で **Modal 内での使用はゼロ**（focus-trap との干渉なし） |
| 前提部品は第 1 弾で導入済み | atoms / molecules 一覧 | `Animated` `ScrollArea` `SidebarNavGroup` `SidebarNavItem` すべて存在 — `SidebarShell` の依存は充足 |
| Phase A は `packages/ui` 限定で低リスク | tokens.css の base→v2 diff | **不正確**。`:root` に `--topbar-h: 3.5rem` を定義し `globals.css:3` の `@import` 経由で全画面に流入（BLOCKER 1） |
| E2E セレクタ依存の有無 | `playwright.config*` / `*.spec.ts` 検索 | apps/web / packages/ui に E2E は**未導入**。回帰検出は目視のみ |
| CI の実行内容 | `.github/workflows/ci.yml` | `pnpm turbo run typecheck lint build test` + pgTAP。apps/web の test は lib / API route のみでレイアウト系はゼロ |

## Findings

### [BLOCKER] Phase A の `tokens.css` 取り込みだけで既存 DataTable の sticky が 56px ずれる

上流 `tokens.css:412` は `:root` に `--topbar-h: 3.5rem` を定義する。一方 waoon の
`DataTable.module.scss:37,391` は `top: var(--topbar-h, 0)` で**未定義 = 0 を前提に**設計され、
`AppLayout.tsx:222-225` には「設定すると二重適用でヘッダ行が下へずれる（Chromium 実測）」という
Why コメントが残る。`globals.css:3` が tokens を `@import` するため、Phase A をマージした時点で
Phase B 未着手のまま admin 全一覧の sticky ヘッダがずれる。「Phase A は低リスク」という前提が崩れる。

→ **反映済み**: Phase A では当該 1 行を持ち込まない方針を実装計画・リスク・判断ログに明記。
Phase A の検証に「sticky 位置が現行から変わっていない」目視を追加。

### [BLOCKER] スクロールモデル（ページスクロール / main 内部スクロール）の決定が無い

上流 `AppShellRoot` は `min-h-screen`、`SidebarShell` は `fixed h-screen`、DataTable の sticky は
`--topbar-h` 起点 — **ページスクロール前提**の設計。現行 waoon は `AppLayout.tsx:100` の
`h-screen overflow-hidden` + `main` の `overflow-y-auto` で**本文だけが内部スクロール**する。
どちらを採るかで TopBar の position、main の offset、sticky の基準、`--topbar-h` を設定してよいかが
すべて変わる。Plan はこの分岐に触れていなかった。

→ **反映済み**: 「ページスクロールへ移行する」と決定し、根拠（上流 DataTable の設計・全面刷新方針との
整合・回避策を畳める）を現状コンテキストと判断ログに明記。移行手順を実装計画に追加。

### [BLOCKER] `AppFrame`（シェル適用の分岐点）と `cookies()` の dynamic 化が影響範囲に無い

シェルを被せるか否かは `AppFrame.tsx:8-16` の `BARE_PATHS`（`/login` / `/ui-demo` /
`/change-password`）が決めているが、Plan にこのファイルが一度も出てこない。root layout に
`AppShellProvider` を無条件で置くと未認証ページにもラッパが被る。また Next.js 16 で root layout が
`cookies()` を読むと**全ルートが dynamic rendering に落ちる**。

→ **反映済み**: 非 BARE 経路にのみ適用する方針と、dynamic 化の許容理由（`middleware.ts` が全ページ
認証ゲート済み）を現状コンテキスト・実装計画・リスク・判断ログに明記。

### [BLOCKER] `SidebarNav` に渡す groups / activeHref の供給方法が未定義

`navItems.ts:15` の `NAV_ITEMS` は**グループを持たないフラット配列**で、`SidebarNavGroupModel`
（`id` / `label` / `items`）とは形が違う。また `useNavigationItems.ts` は `/api/v1/auth/me` を
クライアント fetch した後にロールで絞り込むため、Sidebar 移行後は**初回ロード中に nav が空の
Sidebar が数百 ms 出る**。Plan の「`NAV_ITEMS` は現行維持」という記述とも矛盾していた。

→ **反映済み**: スコープを「項目とロール出し分けロジックは維持、グループ定義のみ新設」に修正。
`NAV_GROUPS` 新設とローディング中のスケルトン表示を実装計画へ、ちらつき確認を検証項目へ追加。

### [NICE-TO-HAVE] `@ui-catalog/core` に AppShell 系の subpath export が無い

`package.json` の `exports` は `./templates/Header` 等を個別に持つが AppShell 系は無く、Server
Component から `parseSidebarState` を取るには `'use client'` 部品を多数含むバレルを import することになる。

→ **反映済み**: `./templates/AppShell` / `./organisms/SidebarShell` / `./organisms/SidebarAccountMenu`
の subpath 追加を Phase A のスコープと実装計画に明記。`catalog-integrity.test.ts` が実在を検査する。

### [NICE-TO-HAVE] `AppShellRoot` の `bg-background` が waoon では解決しない

`AppShellRoot.tsx` は `cn('min-h-screen bg-background', className)` を持つが、waoon の
`tokens.css` に `--color-background` は無く Tailwind v4 は `bg-background` を生成しない。
背景は `globals.css` の `body` と `BackgroundTexture` が担うため実害は無いが、Phase B で
`className` を明示するかトークンを足すかを決めておくとよい。

### [NICE-TO-HAVE] `ui (1).zip` が `.gitignore` 未登録

`.gitignore:38` は `/ui.zip` のみで、repo root の `ui (1).zip`（34MB）は untracked のまま。
第 1 弾レビューでも同じ指摘があった。

→ **反映済み**: `/ui*.zip` へ一般化。

### [NICE-TO-HAVE] 目視項目の受け入れ基準が主観的

「ガタつかない」「配色も追従する」は判定者依存。E2E 未導入で目視が唯一のゲートである以上、
「どの URL で」「何を見て OK とするか」を書くと再現可能になる。

→ **反映済み**: 検証を URL + 手順 + OK 判定の表に置き換え（SSR 初期幅は「64px」等の数値で判定）。

### [NICE-TO-HAVE] 既存 `AppShell` 削除時の付随ファイルが手順に無い

削除対象には `AppShell.module.scss`（上流に無いため残留する）と `registry.ts:160` のエントリが
含まれる。`FormPageShell.tsx:33` の JSDoc も旧 `AppShell` の padding 仕様を参照しており
evergreen 観点で更新対象。

→ **反映済み**: Phase A の手順に明記。

### [NICE-TO-HAVE] 新 Plan 追加分の dashboard 再生成が未実施

→ **反映済み**: Review リンク追記とあわせて再生成。

## 良い点（維持してほしい判断）

- Phase A / B の PR 分割と、A を `packages/ui` 限定にする方針（切り戻し単位の縮小）
- vitest を「develop ベースライン採取 → 差分で新規失敗ゼロ判定」とした点（第 1 弾の
  ベースライン問題の再発防止として正しい）
- `VERSION_REGISTRY` / `versions.json` 更新を実装計画に明示した点（第 1 弾のコードレビューで
  registry 欠落が指摘された経緯を踏まえている）
- 見送り部品（`CertTypeLevelBadge` / `RelatedSection`）を依存関係の理由付きで除外した点
- `SubHeaderToolbar` 資産（PR #81 / #86）を無改修で残せる根拠を現状コンテキストに書いた点（実測でも正しい）

## 検証（この Review 自体の）

- [x] Plan 全文と前提 Plan・2 つの Review を読み、必須要素と `_template.md` 準拠を確認
- [x] `node scripts/gen-outputs-readme.mjs` 実行（成功）
- [x] `.github/workflows/ci.yml` の実行内容と apps/web の test 範囲を確認
- [x] `app/layout.tsx` が Server Component であること、`AppFrame` / `middleware.ts` の分岐を確認
- [x] 上流 `tokens.css` の追加ブロックを base→v2 diff で確認
- [x] `DataTable.module.scss` の `--topbar-h` 依存と `AppLayout.tsx` の Why コメントを突き合わせ
- [x] `SidebarShell` / `AppShellProvider` / `AppShellRoot` / `sidebarState` / `SidebarAccountMenu` を読了
- [x] `SidebarNav` の 3 者 diff、`panel-left-close` の registry 存在を確認
- [x] `NAV_ITEMS` / `useNavigationItems` の構造とデータ供給タイミングを確認
- [x] Playwright 未導入・DropdownMenu の Modal 内使用ゼロを grep で確認
- 検証ギャップ: 実際のブラウザ描画（sticky ずれ / テーマ連動時のコントラスト）は未検証。
  上流 46 ファイル差分のうち tokens.css / DropdownMenu / SidebarShell 以外の中身は個別確認していない。

## フォローアップ

- [x] BLOCKER 4 件を Plan の実装計画 / リスク / 判断ログへ反映
- [x] `.gitignore` へ `/ui*.zip` を追加
- [x] 目視項目を URL + 観測点の表へ具体化
- [ ] 再計画レビュー → 笹木さん承認 → Phase A 着手
