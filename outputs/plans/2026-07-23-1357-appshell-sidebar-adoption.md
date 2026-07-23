# Plan: AppShell / Sidebar 導入とアプリシェル刷新（ui-catalog 上流同期 第 2 弾）

| 項目 | 値 |
|---|---|
| 概要 | ui-catalog 上流の AppShell / Sidebar 基盤（Cookie 永続 + Cmd+B + SSR 対応）を取り込み、apps/web のシェルを Sidebar + TopBar 構成へ全面刷新する。あわせて上流の 46 ファイル修正（DropdownMenu の portal バグ修正含む）を同期 |
| ステータス | 🟣 マージ承認待ち |
| 前提 Plan | [ui-catalog 上流同期 第 1 弾](2026-07-16-2354-ui-catalog-upstream-sync.md) |
| PR | [#103](https://github.com/sasakiyusuke2017015/waoon/pull/103)（Phase A）/ [#104](https://github.com/sasakiyusuke2017015/waoon/pull/104)（Phase B） |
| Review | [計画レビュー 1](../reviews/2026-07-23-1410-appshell-sidebar-adoption-review.md) / [計画レビュー 2](../reviews/2026-07-23-1435-appshell-sidebar-adoption-review2.md) / [計画レビュー 3](../reviews/2026-07-23-1500-appshell-sidebar-adoption-review3.md) / [コードレビュー Phase A](../reviews/2026-07-23-1505-appshell-sidebar-phase-a-code-review.md) / [コードレビュー Phase B](../reviews/2026-07-23-1540-appshell-sidebar-phase-b-code-review.md) |

ブランチ: `feature/ui-catalog-sync-2`（Phase A）/ `feature/appshell-sidebar`（Phase B）

## 目的

ui-catalog 上流の新リリース（`ui (1).zip`）が持ち込んだ **AppShell / Sidebar 基盤**を
waoon へ導入し、apps/web のアプリシェルを左 Sidebar + TopBar 構成へ刷新する。
折りたたみ状態は Cookie で永続化し、SSR 初期描画から正しい幅で出す。
副次的に、上流の 46 ファイル修正（**DropdownMenu の z-index バグ修正**を含む）も同期する。

## スコープ

### やること

**Phase A — カタログ同期（`packages/ui` のみ）**

- 上流のみ変更の **16 ファイル**を上流版で置換
- 両側変更の **13 ファイル**を個別マージ（DataTable 7 は waoon 版維持 / barrel 4 は union / tokens.css / SelectableList story）
- 上流新規のうち **AppShell / Sidebar 系 + 汎用部品**を採用（下記「採用リスト」）
- `tokens.css` の sidebar 配色トークンと `@theme inline` ブリッジを取り込む。
  ただし **`--topbar-h` は `:root` ではなく `[data-sidebar-state]` にスコープして**取り込む
  （下記「`--topbar-h` の罠」）
- `package.json` に `./templates/AppShell` / `./organisms/SidebarShell` /
  `./organisms/SidebarAccountMenu` の subpath export を追加
  （Server Component から `parseSidebarState` を client 部品ごと引き込まずに import するため）

**Phase B — apps/web シェル刷新**

- **スクロールモデルをページスクロールへ移行**する（現行は `main` の内部スクロール。
  下記「スクロールモデルの決定」）
- `AppShellProvider` / `AppShellRoot` を導入。`layout.tsx`（Server）で Cookie から
  `parseSidebarState` し、`AppFrame` 経由で **非 BARE 経路にのみ**適用する（SSR 初期幅の一致）
- `SidebarNav` に渡す **`NAV_GROUPS`（一般 / 管理）を新設**する（`NAV_ITEMS` のグルーピング定義）
- `AppSideNav` + `FloatingMenuButton` を **`SidebarShell`** に置換（brand / nav / footer slot）
- `HeaderUserMenu` を **`SidebarAccountMenu`** へ統合（デスクトップは sidebar footer、
  モバイルは TopBar に `placement="topbar"`）。catalog へ配置オプションを吸収し、
  アプリ側の重複実装を削除する
- `Header` / `Footer` テンプレート利用を廃し、アプリ層の **TopBar** に置換
  （パンくず + 通知ベル。高さは `--topbar-h`）
- `SubHeader` テンプレート利用を廃し、TopBar 直下の **slot 帯**に置換
  （`SubHeaderPortal` の container を移すだけ。`SubHeaderToolbar` 自体は無改修）
- Sidebar 配色を **waoon テーマ 3 軸に連動**させる（`--sidebar-*` をテーマ色から driveする）
- モバイルは **現行の下部タブバーを維持**（Sidebar はデスクトップのみ）
- 未保存ガード（`useGuardedNavigate`）を `SidebarNav` の `linkComponent` 経由で維持

### やらないこと（スコープ外）

- **DataTable / Toast の上流版採用**（第 1 弾と同方針。waoon 版を維持）
- ai-education ドメイン専用部品の取り込み（下記「見送りリスト」）
- モバイル UI の作り替え（下部タブバーは現行のまま）
- ナビゲーション**項目とロール出し分けロジック**の変更（`NAV_ITEMS` の中身と
  `useNavigationItems` の絞り込みは現行維持。グループ定義の新設のみ行う）
- 認証 / API / DB / RLS への変更（本 Plan は UI シェル層のみ）

## 現状コンテキスト（2026-07-23 時点）

### 上流差分の規模

第 1 弾（PR [#97](https://github.com/sasakiyusuke2017015/waoon/pull/97)）で取り込んだ `ui.zip` が
正確な共通祖先になるため、三方向比較は前回より精密。**マージ以降 waoon は `packages/ui` を
一切変更しておらず、上流追随ファイルでの waoon 側改変はゼロ**。

| 分類 | 件数 | 対応 |
|---|---|---|
| そのまま採用可 | 16 | 上流版で置換 |
| waoon 側で改変 | **0** | — |
| 両側変更（要マージ） | 13 | DataTable 7 / barrel 4 / tokens.css / story 1 |
| waoon に無い（見送り部品） | 17 | 対象外 |
| 上流の新規 | 28（7 部品 + hexColor util） | 下記の採否 |

component の `versions.json` は前回と完全同一。zip が 21MB→34MB に増えたのは
`storybook-static` 同梱によるもので、中身の規模増ではない。

### 上流新規部品の採否

**採用**: `AppShell`（AppShellProvider / AppShellRoot / sidebarState）、`SidebarShell`、
`SidebarAccountMenu`、`SegmentedRatioBar`、`utils/hexColor`

**見送り（ai-education ドメイン専用 / 見送り部品依存）**:
`CertTypeLevelBadge`（`LevelBadge` 依存）、`RelatedSection`（`RelatedList` 依存）

### 主要な上流変更の中身

- **`DropdownMenu`（バグ修正・実利用あり）**: メニューを `body` へ portal するようになった。
  祖先の stacking context に閉じ込められて実効 z-index が頭打ちになる問題の修正で、
  上流コメントが名指しする症状（DataTable の sticky toolbar で列並べ替え中のヘッダセルが
  メニューの上にせり出す）は **waoon の `ColumnPicker` がそのまま該当する**
- **`Badge`**: 任意 hex 背景色（文字色は YIQ でコントラスト自動導出）+ 丸ロゴ画像に対応
- **`Icon`**: `link` / `scroll-text` の 2 種を追加
- `SectionHeading` / `LoadingZone` / `FormPageShell` / `Tabs` / `SegmentedControl` の改善

### AppShell / Sidebar 基盤の構造

上流の AppShell は「**状態 + data 属性**」だけの薄い基盤で、TopBar は各アプリが組む設計。

| 部品 | 役割 | 行数 |
|---|---|---|
| `AppShellProvider` | Context で開閉状態を保持。Cookie 永続化（`sidebar_state`、1 年）と Cmd/Ctrl+B ショートカット（input / textarea / contenteditable フォーカス中は無視） | 84 |
| `AppShellRoot` | `data-sidebar-state` をルート div に bind するだけ。tokens.css 側が `--sidebar-w` を切替 | 28 |
| `sidebarState` | `parseSidebarState()`（不正値は `expanded` に fallback）+ Cookie 名定数。SSR から使う | 13 |
| `SidebarShell` | 左ペインの器（presentational）。brand + 開閉トグル + `SidebarNav` + footer slot。展開 240px / 折りたたみ 64px | 128 |
| `SidebarAccountMenu` | sidebar 最下部のユーザーメニュー（`DropdownMenu` ベース）。`onAction` は `closeMenu` を受け取る形 | 281 |

前提部品は **すべて第 1 弾で導入済み**（`SidebarNav` / `SidebarNavGroup` / `SidebarNavItem` /
`ScrollArea` / `Collapse` / `DropdownMenu`）。`SidebarNav` は上流と完全同一。
`SidebarShell` が使う `panel-left-close` アイコンも waoon の lucide-registry に存在する。

### apps/web の現行シェル

[`AppLayout.tsx`](../../apps/web/components/layout/AppLayout.tsx)（278 行）が
`Header` / `SubHeader` / `AppSideNav` / `FloatingMenuButton` / `Footer` / 下部タブバー /
`ThemeSettingsModal` を組み立てている。テーマ 3 軸（`useTheme` の `colors` / `shapes`）と
深く結合し、`useGuardedNavigate`（未保存ガード）を全ナビリンクに通している。

**重要**: `SubHeaderPortal`（[`SubHeaderSlot.tsx`](../../apps/web/components/layout/SubHeaderSlot.tsx)）は
container div へ `createPortal` するだけの **chrome 非依存**の仕組みで、`SubHeaderToolbar`
テンプレートも `SubHeader` に依存せず `DataTable/Toolbar` だけを見ている。
したがって **シェルを刷新しても SubHeaderToolbar 資産（PR #81 / #86）は無改修で残せる**。
利用箇所も [`AdminListTable.tsx`](../../apps/web/components/admin/AdminListTable.tsx) に集約済み。

### `--topbar-h` の罠（Phase 分割に影響）

上流 `tokens.css:412` は `:root` に `--topbar-h: 3.5rem` を定義する。一方 waoon の
[`DataTable.module.scss:37,391`](../../packages/ui/core/organisms/DataTable/DataTable.module.scss) は
`top: var(--topbar-h, 0)` と `calc(var(--topbar-h, 0px) + var(--dt-toolbar-h, 0px))` で
**「未定義 = 0」を前提に** sticky を組んでおり、
[`AppLayout.tsx:222-225`](../../apps/web/components/layout/AppLayout.tsx) には
「`--topbar-h` はここでは設定しない。設定すると二重適用でヘッダ行が下へずれる（Chromium 実測）」
という Why コメントが残る。`apps/web/app/globals.css:3` が tokens を `@import` するため、
**`:root` のまま Phase A で取り込むと、Phase B 未着手のまま admin 全一覧の sticky ヘッダが
56px ずれる**。

対処として、この 1 行を `:root` ではなく **`[data-sidebar-state]` にスコープ**して取り込む。
属性を付与するのは `AppShellRoot` だけなので、Phase A の apps/web では未定義のまま
（= 現行の sticky 挙動を維持）、Phase B で `AppShellRoot` が入った時点で自動的に有効になる。
Storybook（`AppShell` stories は属性を持つ）でも `SidebarShell` の brand 行
（`h-[var(--topbar-h)]`）が正しい高さになる。

```css
/* :root ではなく AppShellRoot 配下に閉じる */
[data-sidebar-state] { --topbar-h: 3.5rem; }
```

sidebar の幅系トークン（`--sidebar-w*`）と `[data-sidebar-state]` ルールも、参照者が
`AppShellRoot` のみのため Phase A で入れて無害。

### sticky の停留基準（TopBar だけでは足りない）

`--topbar-h` を有効にしても、それだけでは admin 一覧のヘッダが SubHeader 帯の裏へ潜る。
[`DataTable.module.scss:37,391`](../../packages/ui/core/organisms/DataTable/DataTable.module.scss) は
停留基準を `--topbar-h` + `--dt-toolbar-h` で組むが、admin 一覧は toolbar を `SubHeaderPortal` で
帯へ出す **external toolbar 構成**であり、
[`useStickyToolbarOffset.ts`](../../packages/ui/core/organisms/DataTable/useStickyToolbarOffset.ts) は
内部 toolbar が無いとき `--dt-toolbar-h` を **`0px` に固定**する（wrapper 要素へ直接書くため
祖先から帯高を継承させることもできない）。結果、ヘッダは TopBar 直下（`3.5rem`）に停まり、
その上に重なる SubHeader 帯（44px〜、funnel 展開で可変）の裏に隠れる。

よって **DataTable に chrome 帯の項を足す**。DataTable は waoon 版を維持している
（＝改修してよい）ため、停留基準に `--chrome-subheader-h` を加える:

```scss
.toolbar { top: calc(var(--topbar-h, 0px) + var(--chrome-subheader-h, 0px)); }
.th      { top: calc(var(--topbar-h, 0px) + var(--chrome-subheader-h, 0px) + var(--dt-toolbar-h, 0px)); }
```

帯の実高は現行同様 ResizeObserver で測り、`AppShellRoot` に `--chrome-subheader-h` として書く。
**現行の ResizeObserver は撤去せず、出力先を `main` の `paddingTop` から CSS 変数へ変える**。

### スクロールモデルの決定

上流 DataTable の sticky は「ページスクロール時、TopBar（fixed, 高さ `--topbar-h`）の直下へ
吸着させる」と明記された **ページスクロール前提**の設計。対して現行 waoon は
`AppLayout.tsx:100` の `flex h-screen flex-col overflow-hidden` + `main` の `overflow-y-auto` で
**本文だけが内部スクロール**し、`--topbar-h` を未定義に保つことで sticky の二重適用を回避している。
SubHeader 実高を ResizeObserver で測って `main` の `paddingTop` に足す仕組みもこの前提に依存する。

本 Plan は**ページスクロールへ移行する**。理由は、上流型への全面刷新という方針と整合し、
`--topbar-h` を本来の意味で使えるようになるため。`main` の `h-screen` / `overflow-hidden` を
外し、TopBar と SubHeader 帯を `fixed` / `sticky` に置く。

副作用として、body が伸びるようになるため **Modal 表示中に背景がスクロールする**ようになる
（現行は `overflow-hidden` が実質の scroll lock として働いていた。body scroll lock の実装は
`packages/ui` / `apps/web` のどこにも存在しない）。Modal 表示中に body へ `overflow: hidden` を
付ける最小対応を入れる。

### モバイルでの sidebar 無効化（`:root` では効かない）

`--sidebar-w` は上流 `tokens.css` の `[data-sidebar-state='collapsed'|'expanded']` ルールで
**`AppShellRoot` 要素そのものに宣言される**。カスタムプロパティは「その要素での宣言 >
祖先からの継承」で決まるため、`:root` を media query で上書きしても配下には届かない
（宣言順や `!important` でも解決しない）。同じ属性セレクタに対して、基底ルールより**後ろで**
上書きする必要がある:

```css
@media (max-width: 767px) {
  [data-sidebar-state='collapsed'],
  [data-sidebar-state='expanded'] { --sidebar-w: 0px; }
}
```

### モバイルのアカウント導線（欠落しやすい）

`Header` を廃し `HeaderUserMenu` を Sidebar footer へ移し、かつ Sidebar をデスクトップのみに
すると、**モバイルにアカウントメニューを開く UI が 1 つも残らない**。現行 Header は幅に依存せず
表示され、モバイルでもログアウト / パスワード変更 / テーマ設定 / 視点切替に到達できる。
そのため、モバイルでは **`HeaderUserMenu` を TopBar 右端に残す**（`md:hidden`）。
`SidebarAccountMenu` は sidebar 幅を前提とした配置（`crossOffset`）なので流用しない。

### 視点切替（ロール切替）の引き継ぎ

[`HeaderUserMenu.tsx`](../../apps/web/components/layout/HeaderUserMenu.tsx) は
`PUT /api/v1/auth/active-role` を叩く**視点切替**を持ち、`useNavigationItems` は
`activeRole` 基準でナビを絞り込む。これが落ちるとマルチロールユーザー（dev の `multi1`〜`9`）は
admin / interviewer のナビへ到達できなくなる（PR #99 の機能後退）。

`SidebarAccountMenu` は表現力として充足しており追加改修は不要:
`section.showCheck`（選択中に check、他は同幅 placeholder）でロール一覧を、
`section.error` で失敗時のエラー行を、`badge` で現在ロールのチップを出せる。
`onAction(id, { closeMenu })` により「成功時のみ閉じる」も再現できる。

### シェル適用の分岐点と SSR の前提

シェルを被せるか否かは [`AppFrame.tsx:8-16`](../../apps/web/components/layout/AppFrame.tsx) の
`BARE_PATHS`（`/login` / `/ui-demo` / `/change-password`）が決めている。
`AppShellProvider` / `AppShellRoot` を root layout に無条件で置くと未認証ページにもシェルの
ラッパが被るため、**`AppFrame` の非 BARE 経路にのみ適用**する（`initialState` は root layout の
`cookies()` から prop で渡す）。

[`app/layout.tsx`](../../apps/web/app/layout.tsx) は Server Component なので `cookies()` を
使えるが、root layout がこれを読むと **全ルートが dynamic rendering に落ちる**。
`middleware.ts` が全ページを認証ゲートしており実害は小さいため、これは許容する。

### ナビゲーションのデータ供給

[`navItems.ts:15`](../../apps/web/components/layout/navItems.ts) の `NAV_ITEMS` は
**グループを持たないフラット配列**で、`SidebarNav` が要求する `SidebarNavGroupModel`
（`id` / `label` / `items`）とは形が違うため、グループ定義の新設が要る。

また [`useNavigationItems.ts`](../../apps/web/components/layout/useNavigationItems.ts) は
`/api/v1/auth/me` を TanStack Query で **クライアント fetch した後**にロールで絞り込む。
現行は `items.length > 1` でサイドナビ自体を出し分けているため、Sidebar 移行後は
**初回ロード中に nav が空の Sidebar が数百 ms 出る**。ローディング中の見せ方を決める必要がある。

### 決定済みの設計方針（2026-07-23 ユーザー確認）

| 論点 | 決定 |
|---|---|
| Sidebar 配色 | **waoon テーマ 3 軸に連動**（上流の固定ダーク slate は不採用） |
| 既存 chrome | **シェル全体を上流型へ刷新**（Header / SubHeader / Footer テンプレートの利用を廃止） |
| モバイル | **下部タブバーを維持**（Sidebar はデスクトップのみ） |

## 実装計画

### Phase A — カタログ同期（PR 1・`packages/ui` のみ）

1. `develop` 起点で `feature/ui-catalog-sync-2` を作成
2. 上流のみ変更 16 ファイルを置換（各ファイルの現行改行コードを維持）
3. 両側変更 13 ファイルを `git merge-file` で三方向マージ
   - DataTable 7 ファイル: waoon 版維持（第 1 弾と同方針）
   - barrel 4 本: union マージ + 見送り部品の export 除外
   - `tokens.css`: 上流の sidebar 配色トークン + `[data-sidebar-state]` ルール +
     `@theme inline` ブリッジを取り込む。**`--topbar-h: 3.5rem` は `:root` ではなく
     `[data-sidebar-state]` にスコープ**して書く（apps/web は Phase A では未定義のまま）
4. 採用新規部品をコピーし、barrel と `package.json` の subpath export を追加
   - `AppShell` は **waoon 既存の `core/templates/AppShell` と衝突**するため、
     既存（`AppShell` を export・利用者ゼロの dead code）を削除して上流版に置き換える。
     付随する `AppShell.module.scss`（上流に無く残留する）も削除し、
     `FormPageShell.tsx:33` の JSDoc が参照する旧 `AppShell` の padding 仕様も更新する
5. `VERSION_REGISTRY` / `versions.json` を更新（新部品の追加、`AppShell` エントリの見直し）
6. 検証（下記）→ `/pr-review` → PR 作成

### Phase B — apps/web シェル刷新 + shell トークン確定（PR 2）

> Phase B は apps/web に加えて **`packages/ui` の `tokens.css` と `DataTable.module.scss`** も
> 変更する（sticky 基準とモバイル無効化ルール）。Phase A の「`packages/ui` 限定」とは対照的に、
> B は両方に跨る。

7. `feature/appshell-sidebar` を作成（Phase A マージ後の `develop` 起点）
8. **スクロールモデル移行**: `AppLayout` の `h-screen` / `overflow-hidden` と `main` の
   `overflow-y-auto` を外してページスクロールにする。Modal 表示中に body へ
   `overflow: hidden` を付ける最小の scroll lock を入れる
9. **sticky 基準の修正**: `DataTable.module.scss` の `.toolbar` / `.th` に
   `--chrome-subheader-h` の項を足す。SubHeader 帯の実高を ResizeObserver で測り
   `AppShellRoot` に同変数として書く（現行の ResizeObserver は撤去せず出力先を変える）
10. **モバイル無効化ルール**: `tokens.css` の `[data-sidebar-state]` 基底ルールより後ろに
    `@media (max-width: 767px)` の `--sidebar-w: 0px` 上書きを追加する
11. **テーマブリッジ**: waoon テーマ色から `--sidebar-*` を driveする層を追加。写像は
    `sidebar`←`primaryBgColor` / `sidebar-foreground`←`primaryContrastText` /
    `sidebar-border`←`primaryBorderColor` / `sidebar-accent`←`navHoverBgColor` /
    `sidebar-accent-foreground`←`navActiveTextColor` / `sidebar-primary`←`accentBgColor` /
    `sidebar-primary-foreground`←`accentContrastText` / `sidebar-ring`←`focusRingColor`。
    上流トークンは fallback の既定値として残す
12. **SSR 配線**: `app/layout.tsx`（Server）で `cookies()` から `parseSidebarState` し、
    `AppFrame` へ prop で渡す。`AppFrame` は **非 BARE 経路でのみ** `AppShellProvider` /
    `AppShellRoot` を適用する（`/login` / `/ui-demo` / `/change-password` はシェルなしのまま）
13. **ナビのグループ定義**: `NAV_GROUPS`（一般 / 管理）を `navItems.ts` に新設し、
    `useNavigationItems` の絞り込み結果をグループへ写像する。`/me` 未取得中は
    **nav とアカウント行の両方をスケルトン表示**にして、空 → 生えるのちらつきを避ける
    （`SidebarAccountMenu` の `name` / `email` は必須 string だが waoon の `me` は nullable）
14. **Sidebar 構築**: `SidebarShell` に brand（waoon → `/dashboard`）、groups、
    footer に `SidebarAccountMenu` を差す。`linkComponent` に未保存ガード付き Link を注入し、
    `resolveIcon` は既存 `Icon` に委譲。`onAction` には
    **視点切替（`showCheck` セクション + 失敗時 `section.error`）/ テーマ設定 / PW 変更 /
    ログアウト**を配線する（視点切替の欠落は PR #99 の機能後退になる）
15. **TopBar 構築**: アプリ層に TopBar を作り、パンくず + 通知ベルを移設。
    高さは `--topbar-h`、左 offset は `--sidebar-w`。
    **右端にモバイル専用のアカウント導線を `md:hidden` で置く**。導線は catalog の
    `SidebarAccountMenu` に `placement="topbar"` オプションを足して共有し
    （`sections` / `onAction` は `useAccountMenu()` で Sidebar と共通）、
    アプリ側の `HeaderUserMenu` は削除する
16. **SubHeader 帯の移設**: TopBar 直下に sticky の slot 帯を置き、`SubHeaderPortal` の
    container を移す（`SubHeaderToolbar` 自体は無改修）
17. **撤去と移設**: `AppSideNav` / `FloatingMenuButton` と `Header` / `SubHeader` / `Footer`
    テンプレートの利用を削除する。ただし旧 `AppLayout` には**移設が必要な要素**が同居するので
    取りこぼさない: `useDocumentTitle`（タブタイトル）/ `BackgroundTexture` と
    その基準になる `relative` な祖先 / `BlurFade key={pathname}`（画面遷移フェード）/
    `ThemeSettingsModal` の実体 / 下部タブの表示条件 `items.length > 1`
18. **モバイル**: 下部タブバーは現行のまま残す。Sidebar は `hidden md:block` 相当のラッパで
    包む（`SidebarShell` は `className` を受け取らない presentational 部品のため、
    非表示化はラッパ側で行う）
19. 未使用化した catalog テンプレート（`Header` / `SubHeader` / `Footer` / `SideNav`）の
    去就を判断（[evergreen.md](../../.claude/rules/evergreen.md) に従い、参照ゼロなら削除）
20. 検証（下記）→ `/pr-review` → PR 作成

各 Phase 完了ごとに typecheck を回し、壊れた時点で切り分けられるようにする。

## 検証

### Phase A

- `pnpm turbo run typecheck lint build test`（CI と同一コマンドで parity 担保）
- `pnpm --filter @ui-catalog/core exec vitest run`
  （packages/ui に `test` script が無く CI ゲート外のため手元で明示実行。
  **develop 時点の失敗数をベースラインとして先に採取し、新規失敗ゼロを確認する**）
- `catalog-integrity.test.ts` が green（追加した subpath export の実在を検査する）
- dev スタックで `/admin/users` を開き、**sticky ヘッダとツールバーの位置が現行から
  変わっていない**こと（`--topbar-h` を持ち込んでいないことの確認）

### Phase B

- `pnpm turbo run typecheck lint build test`
- dev スタックでの目視。受け入れ条件は URL と観測点で書く:

| 確認 | 手順 | OK の判定 |
|---|---|---|
| Cookie 永続 | `/dashboard` で Sidebar を折りたたみ → リロード | 折りたたんだまま復帰する |
| SSR 初期幅 | collapsed 状態で `/admin/users` をリロード | 初期描画から幅 64px。hydration 後に 240px→64px のガタつきが無い |
| Cmd+B | 任意画面で Cmd/Ctrl+B → 検索欄にフォーカスして再度 Cmd+B | 1 回目は開閉する。2 回目は開閉せず文字入力が効く |
| テーマ連動 | テーマ設定で rose / sharp / fabric を切替 | Sidebar の背景・アクティブ色が各テーマに追従し、文字が読める |
| SubHeaderToolbar | `/admin/users` `/admin/surveys` `/admin/answers` `/admin/questions` | 検索 / 件数 / 新規作成 / フィルタ funnel が従来どおり出る |
| DropdownMenu portal | `/admin/users` で列ピッカーを開き、列をドラッグ並べ替え | メニューがヘッダセルの上に重なる（下に潜らない） |
| sticky | `/admin/users` を縦スクロール | ヘッダ行が **SubHeader 帯の直下**に吸着し、帯と重ならない。funnel を開いて帯が高くなっても追従する |
| Modal 背景 | 任意のモーダルを開いてホイール操作 | 背景がスクロールしない |
| 未保存ガード | `/admin/surveys/new` で 1 文字入力 → Sidebar のリンクを踏む | 離脱確認ダイアログが出る |
| 視点切替 | `multi1` でログインし、アカウントメニューから視点を切り替える | Sidebar の nav 項目が切替後のロールに入れ替わる |
| nav ちらつき | `/dashboard` をハードリロード | 空の nav は出ない（ロール非依存 3 項目は即描画）。アカウント行はスケルトンで、`/me` 取得後に管理グループが追加される |
| モバイル | 幅 375px で `/dashboard` | 下部タブバーが出て Sidebar は出ず、本文が左に寄っていない |
| モバイル導線 | 幅 375px でアカウントメニューを開く | ログアウト / PW 変更 / テーマ設定 / 視点切替のすべてに到達できる |
| BARE 経路 | `/login` `/change-password` | Sidebar / TopBar が出ない |

- 第 1 弾 Plan の未了目視項目（Icon lucide 化 / テーマ崩れ / focus-trap）も本 Plan の
  目視で**まとめて消化する**

### dev スタックで検証済み（2026-07-23・HTTP / CSS レベル）

ブラウザ自動化が未導入のため、DOM / CSS で機械的に確認できる範囲を先に消化した。

| 項目 | 確認方法 | 結果 |
|---|---|---|
| BARE 経路 | `/login` の HTML | `data-sidebar-state` の出現ゼロ = シェル非適用 |
| SSR 初期幅 | Cookie 3 パターンで `/admin/users` を取得 | 無し → `expanded` / `collapsed` → `collapsed` / 不正値 → `expanded` に fallback |
| シェル構造 | `/admin/users` の HTML | `aside`（Sidebar）/ `header`（TopBar）/ `breadcrumb` / `main` がすべて描画 |
| テーマ連動 | 同 HTML の inline style | `--sidebar: hsl(343, 79%, 35%)` = rose テーマ色（上流のダーク slate ではない） |
| chrome 帯の変数 | 同 HTML | `--chrome-subheader-h: 44px` を inline 宣言 |
| `--topbar-h` のスコープ | 配信 CSS | `[data-sidebar-state] { --topbar-h: 3.5rem }` のみ。`:root` への漏れゼロ |
| モバイル無効化のカスケード | 配信 CSS の行番号 | 基底ルール（6003 行）より後（6011 行）に media query が出力され、後勝ちが成立 |
| sticky の停留基準 | 配信 CSS | `.toolbar` / `.th` とも `--chrome-subheader-h` を加算した `calc()` になっている |

### ブラウザ検証（2026-07-23・Playwright / Chromium・**20/20 PASS**）

NixOS のため `nixpkgs` の `playwright-driver.browsers` を `PLAYWRIGHT_BROWSERS_PATH` に指定し、
`@playwright/test` はスクラッチパッドへ入れて（リポジトリは汚さない）実ブラウザで検証した。

| 確認 | 結果 |
|---|---|
| Sidebar 表示 / 展開 240px / 折りたたみ 64px | PASS |
| `sidebar_state` cookie の書き込み | PASS（`collapsed` で保存） |
| リロード後も折りたたみ維持（SSR 初期幅） | PASS（`collapsed` / 64px） |
| Ctrl+B で開閉 | PASS |
| 入力欄フォーカス中は Ctrl+B が発火しない | PASS（入力値 `"ab"` が保持される） |
| SubHeaderToolbar（funnel / 件数 / 新規作成 / リセット） | PASS |
| funnel 展開で帯が伸び `--chrome-subheader-h` が追従 | PASS（45→68px / var=68px） |
| スクロール時ヘッダ行が chrome 帯の下に吸着 | PASS（th.top=127 ≥ band.bottom=124） |
| DropdownMenu が body へ portal される | PASS（`parentIsBody: true`） |
| Sidebar 背景がテーマ色 | PASS（`rgb(160, 19, 59)` = rose 系。上流のダーク slate ではない） |
| モーダル表示中の body スクロールロック | PASS（`/schedule` で `overflow: hidden`） |
| 未保存フォームからの離脱ガード | PASS（ダイアログ表示 + URL 維持） |
| 視点切替がアカウントメニューに出る | PASS（multi ロールで 3 件） |
| モバイル 375px: Sidebar 非表示 / 本文 offset 0 / 下部タブ | PASS |
| モバイルのアカウント導線（ログアウト / PW / テーマ / 視点） | PASS（全て到達可） |

検証中に判明した既存仕様（本 Plan 起因ではない）:

- admin 一覧のフィルタ行は funnel 折りたたみが既定（`collapse--closed` / `height: 0`）
- **列ピッカー（gear）は waoon の admin 一覧では未使用**（`AdminListTable` が `onColumnsChange` を
  渡していないため `ColumnPicker` が描画されない）。DropdownMenu の portal 修正は
  TopBar の通知ベル / アカウントメニューで検証した

## リスク

| リスク | 影響 | 緩和策 |
|---|---|---|
| **Phase A の `--topbar-h` 混入で admin 一覧の sticky が 56px ずれる** | admin 4 画面 | `:root` ではなく `[data-sidebar-state]` にスコープして取り込む。Phase A の検証に「sticky 位置が現行から変わっていない」目視を含める |
| **sticky ヘッダが SubHeader 帯の裏に潜る** | admin 4 画面 | 停留基準に `--chrome-subheader-h` を足す。目視の OK 判定を「帯の直下に吸着」で書く |
| **モバイルのアカウント導線消失（ログアウト等が不能）** | モバイル全画面 | TopBar 右端に `HeaderUserMenu` を `md:hidden` で残す。目視項目に到達確認を含める |
| **視点切替の移設漏れでマルチロールがナビに到達できない** | multi ロール利用者 | `SidebarAccountMenu` の `showCheck` セクションで再現。目視項目に視点切替を含める |
| Modal 背後のページがスクロールする | 全モーダル | body scroll lock を最小実装。目視項目に含める |
| 旧 `AppLayout` 撤去時に付随機能を落とす | タブタイトル / 背景 / 遷移フェード / テーマ設定 | 移設が必要な要素を実装手順に列挙 |
| **ページスクロール移行で既存画面のスクロール挙動が変わる** | 全認証画面 | Phase B の目視で全画面をスクロールして確認。`main` の内部スクロール前提だった SubHeader 実高→paddingTop の仕組みを畳み忘れると二重に効くため、撤去を手順に明記 |
| シェル刷新による既存画面の崩れ | 全認証画面 | Phase を A / B に分け、B を単独 PR にして切り戻し可能にする。目視項目を画面単位で網羅 |
| E2E が未導入で回帰検出が目視のみ | 全認証画面 | 受け入れ条件を URL + 観測点の表で具体化し、判定を再現可能にする |
| `/me` 取得前の Sidebar が空でちらつく | 初回ロード | nav 部分をスケルトン表示にする。目視項目に含める |
| root layout の `cookies()` で全ルートが dynamic 化 | ビルド出力 | `middleware.ts` が全ページを認証ゲート済みで実害は小さいため許容。判断ログに明記 |
| SSR / hydration mismatch（sidebar 幅・テーマ） | 全画面のちらつき | Cookie 由来の `initialState` を SSR に渡す設計。テーマは現行の `mounted` ガード方式を踏襲 |
| SubHeaderToolbar の再配線ミス | admin 4 画面のツールバー消失 | portal 機構は chrome 非依存と確認済み。container の設置場所を移すだけに留める |
| テーマ連動ブリッジの色設計が破綻（コントラスト不足） | 可読性 | 上流トークンを fallback に残し、写像は段階的に。目視で 3 テーマ全て確認 |
| `AppShell` 置き換えで既存 export が消える | ビルド失敗 | 既存 `AppShell` は利用者ゼロ（barrel export のみ）と確認済み。typecheck で担保 |
| 未保存ガードの配線漏れ | データ消失 | `linkComponent` 注入で一元化。目視項目に離脱ガードを含める |
| catalog テンプレート削除の巻き込み | ビルド失敗 | 参照ゼロを grep + typecheck で確認してから削除。判断は Phase B の最後に回す |

## 判断ログ

| 日時 | 判断 | 理由 |
|---|---|---|
| 2026-07-23 | Sidebar 配色は waoon テーマ 3 軸に連動させる | 上流の固定ダーク slate では、テーマを切り替えても sidebar だけ取り残される。既存画面との一体感を優先（ユーザー決定） |
| 2026-07-23 | シェル全体を上流型へ刷新する（左ペインだけの置換に留めない） | AppShell / Sidebar の採用がこのプロジェクトの主目的であるため（ユーザー決定） |
| 2026-07-23 | モバイルは下部タブバーを維持 | 狭い画面で本文が圧迫されるのを避ける。既存コードをそのまま使えて差分も小さい（ユーザー決定） |
| 2026-07-23 | Phase A / B を別 PR に分ける | A は `packages/ui` 限定で低リスク、B は apps/web の広範な差分。分けることで切り戻し単位を小さくする |
| 2026-07-23 | 上流 `AppShell` で waoon 既存 `AppShell` を置き換える | 既存は barrel export のみで利用者ゼロの dead code。ディレクトリ名も衝突するため温存する理由がない |
| 2026-07-23 | `CertTypeLevelBadge` / `RelatedSection` は見送り | それぞれ見送り済みの `LevelBadge` / `RelatedList` に依存し、waoon に使途がない（第 1 弾の方針を踏襲） |
| 2026-07-23 | vitest は develop 時点のベースラインを採取してから比較する | 第 1 弾で既存破損スイートの存在が判明済み。絶対数ではなく差分で新規失敗を判定する |
| 2026-07-23 | 上流 `tokens.css` の `--topbar-h: 3.5rem` を `:root` ではなく `[data-sidebar-state]` にスコープする（計画レビュー 1・2 回目） | DataTable の sticky が「未定義 = 0」前提のため `:root` だと Phase A で admin 一覧が 56px ずれる。属性を付けるのは `AppShellRoot` だけなので、スコープを絞れば Phase A は無影響のまま Phase B で自動的に有効化でき、Storybook の brand 行も壊れない（「1 行を除外して後で戻す」案より副作用が少ない） |
| 2026-07-23 | スクロールモデルをページスクロールへ移行する（計画レビュー指摘で決定） | 上流 DataTable の sticky はページスクロール前提の設計で、全面刷新の方針とも整合する。当初「ResizeObserver → `paddingTop` の回避策を畳める」としたが、2 回目レビューで **SubHeader 帯の実高は sticky 基準に必要**と判明したため撤回し、ResizeObserver は出力先を CSS 変数へ変えて残す |
| 2026-07-23 | sticky の停留基準に `--chrome-subheader-h` を新設する（計画レビュー 2 回目） | admin 一覧は external toolbar 構成で `--dt-toolbar-h` が `0px` 固定になるため、`--topbar-h` だけでは帯の裏にヘッダが潜る。DataTable は waoon 版を維持しており改修してよい |
| 2026-07-23 | モバイルの `--sidebar-w: 0px` は `[data-sidebar-state]` セレクタで上書きする（計画レビュー 2 回目） | カスタムプロパティは要素上の宣言が祖先からの継承に優先するため、`:root` への media query では `AppShellRoot` 配下に届かない |
| 2026-07-23 | モバイルのアカウント導線は `HeaderUserMenu` を TopBar に残して確保する（計画レビュー 2 回目） | Header 廃止 + Sidebar デスクトップ限定を重ねるとモバイルでログアウト / PW 変更 / テーマ / 視点切替が到達不能になる。`SidebarAccountMenu` は sidebar 幅前提の配置なので流用しない |
| 2026-07-23 | 視点切替を `SidebarAccountMenu` の `showCheck` セクションで引き継ぐ（計画レビュー 2 回目） | 移設漏れは PR #99 の機能後退。`SidebarAccountMenu` は `showCheck` / `section.error` / `badge` を備え追加改修は不要 |
| 2026-07-23 | `/me` 取得中のスケルトンは**アカウント行のみ**にする（当初「nav も」としていたのを実装時に変更） | nav はロール非依存の 3 項目を即描画でき、空欄は出ない。全体をスケルトンにすると逆に描画が遅く見えるため |
| 2026-07-23 | `EventModal` にも body scroll lock を配線（コードレビュー Phase B の BLOCKER） | `Modal` を経由しない自前オーバーレイのため対象外だった。パネルが viewport 基準の絶対配置なので、背景がスクロールするとアンカー元からずれる |
| 2026-07-23 | 未使用化した catalog テンプレート（`Header` / `SubHeader` / `Footer` / `SideNav` / `FloatingMenuButton`）は削除せず残す | 上流同期で追随している資産で、削除すると次回同期の差分が増える。`SubHeaderToolbar` は継続利用中 |
| 2026-07-23 | `AppShellRoot` の `bg-background` は対処しない | waoon の `tokens.css` に `--color-background` が無く Tailwind が utility を生成しないため、実害がない（背景は `body` と `BackgroundTexture` が担う） |
| 2026-07-23 | モバイルのアカウント導線を `SidebarAccountMenu` の `placement` オプションへ吸収し、`HeaderUserMenu`（154 行）を削除 | popover 本体（sections / showCheck / error）は元々配置非依存で、分岐が要るのは trigger と展開方向のみ。catalog へ吸収すると視点切替 / ログアウトの二重実装が解消し、エラー表示の非対称も消える（CLAUDE.md「新規 UI 部品は原則 ui-catalog に吸収」）。上流との差分は増えるが、`placement` は waoon 固有の業務ロジックではない汎用オプションなので還元可能 |
| 2026-07-23 | アカウントメニューの `sections` / `onAction` を `useAccountMenu()` へ抽出 | Sidebar（デスクトップ）と TopBar（モバイル）が同じ部品を使うため、視点切替 / テーマ / PW 変更 / ログアウトの実装を 1 本にする |
| 2026-07-23 | `AppShellProvider` / `AppShellRoot` は `AppFrame` の非 BARE 経路にのみ適用する（計画レビュー指摘） | root layout に無条件で置くと `/login` `/change-password` にもシェルのラッパが被る。`/change-password` は「他へ遷移させない」ための bare 化なので Sidebar を出してはいけない |
| 2026-07-23 | root layout の dynamic rendering 化を許容する | `cookies()` を読むと全ルートが dynamic に落ちるが、`middleware.ts` が全ページを認証ゲートしており静的化の利得は元々小さい |
| 2026-07-23 | `NAV_GROUPS` は新設する（スコープの微修正・計画レビュー指摘） | `NAV_ITEMS` はフラット配列で `SidebarNavGroupModel` と形が違う。項目とロール出し分けロジックは現行維持のまま、グループ定義だけを足す |

## 残課題

- **`showNav === false` の経路が実質デッド**。`NAV_ITEMS` にロール非依存の項目が 3 つあるため
  `items.length > 1` は常に true だが、将来 false になると `main` の `paddingLeft` と
  TopBar / 帯の `left` が Sidebar の有無を見ていないため 240px の空白ガターが残る。
- `SidebarAccountMenu` の popover 内部は `text-gray-900` 等を直書きしており、
  `--sidebar-*` のテーマブリッジが効かない（可読性は担保されるため上流既定配色のままとする）。
- `--sidebar-accent-foreground`（`navActiveTextColor` の写像先）は `SidebarNavItem` が参照して
  いない（active は `bg-sidebar-primary/15` + `text-sidebar-foreground`）。目視時の期待値に注意。
- `SidebarAccountMenu` の `menuCrossOffset`（`collapsed ? 21 : 80`）は sidebar 幅から手で導いた値。
  `--sidebar-w-expanded` / `--sidebar-w-collapsed` を変えるときは追随が要る。
- `roleError` はメニューを閉じて開き直しても残る。`switchRole.reset()` と合わせた扱いを検討する。

## ステータス

- [x] 計画レビュー 1 回目（NEEDS WORK。BLOCKER 4 件を反映済み）
- [x] 計画レビュー 2 回目（NEEDS WORK。新規 BLOCKER 4 件を反映済み）
- [x] 計画レビュー 3 回目（APPROVE。BLOCKER ゼロで収束）
- [x] Plan 承認（笹木さん OK）
- [x] Phase A: カタログ同期（16 置換 / 13 マージ / 新規部品採用 / registry 更新）
- [x] Phase A: 検証（CI parity 10 タスク成功 / vitest 新規失敗ゼロ）→ コードレビュー APPROVE
- [x] Phase A: PR 作成（#103）
- [ ] Phase A: マージ
- [x] Phase B: テーマブリッジ + SSR 配線
- [x] Phase B: Sidebar / TopBar / SubHeader 帯の構築と旧 chrome 撤去
- [x] Phase B: 検証（CI parity 10 タスク成功 / vitest 新規失敗ゼロ）→ コードレビュー（BLOCKER 1 件反映済み）
- [x] Phase B: PR 作成（#104・base は #103 の stacked PR）
- [ ] Phase B: マージ
- [x] ブラウザ検証（Playwright / Chromium・20/20 PASS。第 1 弾の未了項目も消化）
- [ ] マージ後検証（stg 等の別環境があれば）
