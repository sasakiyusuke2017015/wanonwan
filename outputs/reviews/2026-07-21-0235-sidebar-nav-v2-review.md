# Review: 左ペインを ui-catalog 新 SidebarNav へ乗せ替え（計画）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-21 02:35 JST |
| レビュアー | Claude Code（architect 代行レビュー） |
| 対象 Plan | [`plans/2026-07-21-0224-sidebar-nav-v2.md`](../plans/2026-07-21-0224-sidebar-nav-v2.md) |
| ブランチ | `feature/sidebar-nav-v2`（TBD） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | NEEDS WORK → **指摘反映済み（承認待ち）** | BLOCKER 2 件はいずれも Plan 修正で解消。反映後は実装に進める状態 |
| Plan 判定 | 反映後 APPROVE 相当 | 乗せ替え先の選定（SidebarNav、ShellLayout 見送り）・CSS 変数ブリッジ・GuardedLink 方針は妥当と確認 |
| 実装判定 | N/A | 実装はまだ存在しない |
| 記録整理 | OK | 反映内容は Plan 判断ログに記録済み |

## BLOCKER（2 件・反映済み）

| # | 指摘 | Plan への反映 |
|---|---|---|
| B1 | **トークン定義先の機構誤り**。apps/web は Tailwind v4 の CSS-first 構成（postcss は素の `@tailwindcss/postcss`・`@config` なし）で、Plan が定義先としていた `tailwind.preset.ts` は v3 遺物として**ビルドに一切読まれない**。preset に足しても `bg-sidebar-primary` 等のユーティリティは生成されず、全て無スタイル（背景 transparent・active 消失）になる | 定義先を **`apps/web/app/globals.css` の `@theme inline`**（`--color-sidebar-*` ← `var(--sidebar-*)`）へ全面差し替え。app 所有ファイルなので「vendored 無改修」方針とも一貫。alpha 修飾（`/15`）は v4 の color-mix 展開で hex 変数でも機能することも確認済み |
| B2 | **collapsed レール幅 36px では新部品のアイコンが clip**。ScrollArea `px-2`（16px）+ collapsed item `px-2`（16px）+ アイコン `w-5`（20px）= 最小 ~52px。旧 36px レールは padding なし手書き button の前提だった | レール幅を **56px** へ（`LEFT_PANE_WIDTH: 36 → 56` に意味づけ直し + `LEFT_PANE_EXPANDED_WIDTH: 208` 追加） |

## NICE-TO-HAVE（反映済み）

- alpha 修飾のリスク記述を「@theme 登録が前提。未登録だとユーティリティ自体が出ない」へ精緻化（リスク表）。
- GuardedLink の modifier クリック（Cmd/Ctrl+click）非対応を判断ログに明記（旧 `<button>` 実装踏襲で回帰ではない）。
- SSR 初回の `chromeShift` フラッシュ増大（208px）を回避するため、**初期状態をレール（collapsed=true）**に（判断ログ + Phase 3）。

## 検証で確認された事実（レビュアーによる実ファイル照合）

- ユーティリティ生成経路: `globals.css` の `@import "@ui-catalog/core/styles/tokens"`（`@theme static`）+ `@source "../../../packages/ui/core"`。preset/config JS は不使用。
- GuardedLink 契約: SidebarNavItem は `href/title/aria-*/className/...rest` を `linkComponent` へ渡す → `guardedNavigate(path)` で成立。
- SideNav（入れ物）の `transition: all` は width 切替アニメに使える。
- SidebarNav 内蔵のアクティブ判定（最長前方一致）は既存 `isNavItemActive` と同一ロジックで、下部タブとの並存でズレなし。
- 過去 Plan 整合: upstream-sync Plan は「トークンは tokens.css/globals.css の @theme 管理」と記録しており B1 の判定を裏づける。ShellLayout 見送りも採用スコープと矛盾なし。

## フォローアップ

- [ ] 笹木さん承認後に実装（Phase 1 の最初にトークン配線を実機確認してから Phase 2 へ）
- [ ] 実装後は `/pr-review` でコードレビュー
