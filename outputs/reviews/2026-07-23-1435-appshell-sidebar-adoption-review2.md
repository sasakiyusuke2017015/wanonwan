# Review: AppShell / Sidebar 導入とアプリシェル刷新（ui-catalog 上流同期 第 2 弾）— 計画（2 回目）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 14:35 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-1357-appshell-sidebar-adoption.md`](../plans/2026-07-23-1357-appshell-sidebar-adoption.md) |
| ブランチ | `feature/ui-catalog-sync-2` |
| 関連 PR | TBD |
| レビュー種別 | 計画（2 回目） |
| verdict | **NEEDS WORK** |

> この判定は 2 回目時点のもの。下記の新規 BLOCKER 4 件は **2026-07-23 に Plan へ反映済み**。
> 最終判定は 3 回目の計画レビューで更新する。

## サマリ

1 回目レビュー（[`2026-07-23-1410`](2026-07-23-1410-appshell-sidebar-adoption-review.md)）の
BLOCKER 4 件の反映状況を検証し、あわせて新規 BLOCKER の有無をコマンドで裏取りした。
1 回目の指摘は **4 件すべて正しく反映済み**。一方、反映で新たに確定した 2 つの決定
（ページスクロール移行 / モバイルは下部タブ維持）が持ち込む副作用が計画に落ちておらず、
新規 BLOCKER 4 件を検出した。方針そのものは変える必要がなく、いずれも手順追加で解消できる。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | NEEDS WORK |
| Plan 判定 | NEEDS WORK（ページスクロール移行と「モバイル = 下部タブのみ」の副作用が未反映） |
| 実装判定 | N/A（本 Plan 由来の差分はまだ無い） |
| 記録整理 | OK（dashboard 再生成済み・`.gitignore` は `/ui*.zip` へ一般化済み） |

## 1 回目 BLOCKER の反映状況

| # | 1 回目の指摘 | 検証結果 |
|---|---|---|
| 1 | Phase A で `--topbar-h` を持ち込まない | **反映 OK**。`--sidebar-w*` / `[data-sidebar-state]` を Phase A で入れても無害という主張も、参照者が `AppShellRoot` のみであることを実ファイルで確認して正しい |
| 2 | スクロールモデルの決定が無い | **反映 OK（ただし副作用が未展開）**。「ページスクロールへ移行」と決定済みだが、移行後の sticky 基準・Modal 背後スクロールが未整理 |
| 3 | `AppFrame` の非 BARE 経路のみ + `cookies()` の dynamic 化許容 | **反映 OK**。`middleware.ts` の matcher が API / 静的以外を認証ゲートしている事実を再確認 |
| 4 | `NAV_GROUPS` 新設 + `/me` 取得前スケルトン | **反映 OK**。フラット配列と `SidebarNavGroupModel` の形差を確認、写像は実装可能 |

NICE-TO-HAVE も、subpath export / `.gitignore` / 目視項目の具体化 / 既存 `AppShell` 削除の
付随ファイル / dashboard 再生成すべて反映済み。`bg-background` のみ未反映だった。

## Findings

### [BLOCKER] ページスクロール移行後、DataTable の sticky ヘッダが SubHeader 帯の下に潜る

`DataTable.module.scss:37,391` は停留基準を `--topbar-h` + `--dt-toolbar-h` で組むが、
admin 一覧は toolbar を `SubHeaderPortal` で帯へ出す external toolbar 構成であり、
`useStickyToolbarOffset.ts` は内部 toolbar が無いとき `--dt-toolbar-h` を **`0px` に固定**する
（wrapper 要素へ直接書くため祖先から帯高を継承させることもできない）。結果ヘッダは
TopBar 直下に停まり、その上の SubHeader 帯（44px〜、funnel 展開で可変）の裏に隠れる。
Plan の受け入れ条件「ヘッダ行が TopBar 直下に吸着」も誤った期待値になっていた。

→ **反映済み**: 停留基準に `--chrome-subheader-h` を足す方針（案 B）を採用。ResizeObserver は
撤去せず出力先を CSS 変数へ変える。目視の OK 判定も「帯の直下に吸着」へ書き換え。

### [BLOCKER] モバイルの `--sidebar-w: 0px` は `:root` への media query では効かない

`--sidebar-w` は `[data-sidebar-state='collapsed'|'expanded']` ルールで **`AppShellRoot`
要素そのものに宣言される**。カスタムプロパティは「その要素での宣言 > 祖先からの継承」で
決まるため、`:root` 側を上書きしても配下に届かない（宣言順・`!important` でも解決しない）。

→ **反映済み**: 同じ属性セレクタに対して、基底ルールより後ろで上書きする方式に修正。

### [BLOCKER] モバイルでアカウントメニューへの導線が完全に消える

`Header` 廃止 + `HeaderUserMenu` の Sidebar footer 移設 + Sidebar のデスクトップ限定を
重ねると、モバイルにアカウントメニューを開く UI が 1 つも残らない。現行 Header は幅に
依存せず表示され、モバイルでもログアウト / PW 変更 / テーマ設定 / 視点切替が可能。

→ **反映済み**: TopBar 右端に `HeaderUserMenu` を `md:hidden` で残す方針を追加し、
目視項目に到達確認を追加。

### [BLOCKER] 視点切替（ロール切替）の移設が実装計画から欠落している

`HeaderUserMenu.tsx` は `PUT /api/v1/auth/active-role` を叩く視点切替を持ち、
`useNavigationItems.ts` はナビを `activeRole` 基準で絞り込む。落ちるとマルチロール
ユーザーは admin / interviewer ナビへ到達する手段を失う（PR #99 の機能後退）。
`SidebarAccountMenu` は `showCheck` / `section.error` / `badge` / `onAction(id, {closeMenu})`
を備え、追加改修なしで再現できる。

→ **反映済み**: `onAction` の配線対象に視点切替を明記し、目視項目に
「multi ロールで視点を切り替えると nav 項目が入れ替わる」を追加。

### [NICE-TO-HAVE] Phase B の見出しが「apps/web シェル刷新」だが `packages/ui` も触る

`--topbar-h` 復帰も上記 BLOCKER 2 の修正も `packages/ui/core/styles/tokens.css` への変更。
Phase A の「`packages/ui` 限定で低リスク」と読み合わせると誤解を招く。

→ **反映済み**: 見出しを「apps/web シェル刷新 + shell トークン確定」に変更し、
Phase B が両方に跨ることを冒頭に明記。

### [NICE-TO-HAVE] Phase A の `--topbar-h` 除外で Storybook の brand 行が潰れる

`SidebarShell.tsx:74` は `h-[var(--topbar-h)]` を使う。Phase A で当該行を落とすと
Storybook の brand 行が `height: auto` になる。除外ではなく `[data-sidebar-state]` へ
スコープを絞る案なら Storybook も壊れず、apps/web も Phase A では無影響。

→ **反映済み**: スコープ限定方式を採用（1 回目の「除外して後で戻す」案を上書き）。

### [NICE-TO-HAVE] ページスクロール移行で Modal 背後のページがスクロールする

現行は `h-screen overflow-hidden` が実質の scroll lock として働いている。
body scroll lock の実装は `packages/ui` / `apps/web` のどこにも無い（grep で 0 件）。

→ **反映済み**: リスク表と実装手順、目視項目に追加。

### [NICE-TO-HAVE] 1 回目の `bg-background` 指摘が Plan に記録されていない

→ **反映済み**: 「残課題」節を新設して記録。

### [NICE-TO-HAVE] 旧 `AppLayout` 撤去時に引き継ぐ付随機能が手順に無い

`useDocumentTitle` / `BackgroundTexture` と基準になる `relative` 祖先 /
`BlurFade key={pathname}` / `ThemeSettingsModal` の実体 / 下部タブの `items.length > 1` 条件。

→ **反映済み**: 「撤去と移設」の手順に列挙。

### [NICE-TO-HAVE] `SidebarAccountMenu` の `name` / `email` は必須 string、wanonwan の `me` は nullable

`/me` 取得前は `me === null`。`initial` は `name.charAt(0)` で導出されるため空文字だと `?` になる。

→ **反映済み**: スケルトンの範囲を「nav とアカウント行の両方」に広げた。

## 良い点（維持してほしい判断）

- 1 回目の BLOCKER 4 件を、実装計画 / リスク / 判断ログ / 検証の **4 箇所すべてに一貫して**
  落としている（判断ログに「計画レビュー指摘」と出所も残っている）
- `--topbar-h` の罠を独立節にし、`DataTable.module.scss` の行番号と `AppLayout.tsx` の
  Why コメントまで引いた点。実ファイルと突き合わせて記述は正確
- 検証表を URL + 手順 + OK 判定の 3 列にした点。Cmd+B の「検索欄フォーカス中は開閉しない」は
  `AppShellProvider.tsx:24-31` の実装と一致しており観測点として妥当
- 上流差分の件数（16 / 13 / 17 / 28）が実測と整合

## 検証（この Review 自体の）

- [x] Plan 全文と 1 回目 Review 全文を読了し、反映箇所を行単位で突合
- [x] `ui.zip`（base）と `ui (1).zip`（v2）を展開し `core` 配下の差分を実測
- [x] 上流 `AppShellProvider` / `AppShellRoot` / `sidebarState` / `SidebarShell` /
  `SidebarAccountMenu` / `tokens.css:389-441` を読了
- [x] `DataTable.module.scss` の sticky 定義と `useStickyToolbarOffset.ts` の
  `--dt-toolbar-h` 書き出しを読み、external toolbar 時に `0px` 固定になることを確認
- [x] `packages/ui/infra/theme` と `core/constants/design.ts` の `ColorConfig` を読み、
  `--sidebar-*` 8 トークンへの写像可能性を確認（**キーの不足は無い**）
- [x] `HeaderUserMenu.tsx` と `useNavigationItems.ts` を突合し、視点切替がナビ出し分けの
  前提であることを確認
- [x] `AppFrame.tsx` / `app/layout.tsx` / `middleware.ts` の matcher を確認
- [x] `catalog-integrity.test.ts` が exports target 実在を検査することを確認
- [x] `node scripts/gen-outputs-readme.mjs` 実行（成功・33 Plan）
- 検証ギャップ: ブラウザ実描画は未検証（sticky の実位置・カスタムプロパティのカスケード・
  テーマ 3 軸でのコントラスト）。上流 46 差分のうち主要 5 ファイル以外の中身は個別確認していない

## フォローアップ

- [x] 新規 BLOCKER 4 件を Plan の実装計画・検証・リスク・判断ログへ反映
- [x] Plan に「残課題」節を設け `bg-background` の扱いを記録
- [x] Phase B の変更対象に `packages/ui/core/styles/tokens.css` を明記
- [ ] 3 回目の計画レビュー → 笹木さん承認 → Phase A 着手
