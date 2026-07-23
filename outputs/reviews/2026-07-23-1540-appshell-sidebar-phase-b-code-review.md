# Review: AppShell / Sidebar 導入 Phase B — apps/web シェル刷新（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-23 15:40 JST |
| レビュアー | Claude Code（code-reviewer サブエージェント） |
| 対象 Plan | [`plans/2026-07-23-1357-appshell-sidebar-adoption.md`](../plans/2026-07-23-1357-appshell-sidebar-adoption.md) |
| 対象 | ブランチ `feature/ui-catalog-sync-2` の未 commit 差分（Phase B 分） |
| ブランチ | `feature/ui-catalog-sync-2` |
| 関連 PR | TBD |
| レビュー種別 | 実装（Phase B） |
| verdict | **NEEDS WORK** |

> 初回判定は `NEEDS WORK`。BLOCKER 1 件と主要な NICE-TO-HAVE は **2026-07-23 に反映済み**
> （各 Finding 末尾を参照）。反映後に CI parity 10 タスク成功 / vitest 新規失敗ゼロを再確認した。

## サマリ

Phase B 差分（`apps/web` の `layout.tsx` / `AppFrame` / `AppLayout` / `AppSidebar` / `AppTopBar` /
`GuardedLink` / `SidebarThemeBridge` / `navItems`、`AppSideNav` 削除、`packages/ui` の
`tokens.css` / `DataTable.module.scss` / `useBodyScrollLock` + `Modal` / `Dialog` 配線）を
実ファイルで確認した。機能移設・レイアウトのカスケード・SSR / hydration・モバイル・
セキュリティを中心にレビューし、BLOCKER 1 件を検出した。

## 判定スコープ

| 軸 | 判定 |
|---|---|
| 最終判定 | NEEDS WORK（BLOCKER 反映済み・再検証済み） |
| Plan 判定 | N/A（計画レビュー 3 回目で APPROVE 済み） |
| 実装判定 | NEEDS WORK → 対応済み |
| 記録整理 | FOLLOW-UP → 対応済み |

## Findings

### [BLOCKER] `EventModal` に body scroll lock が入っておらず、ページスクロール移行の副作用が残る

`EventModal.tsx` は `Modal` を経由せず自前で `position: fixed; inset: 0` のオーバーレイを組んでおり、
`Modal` / `Dialog` にだけ配線した `useBodyScrollLock` の対象外になっていた。旧レイアウトでは
ルートの `h-screen overflow-hidden` が実質の scroll lock として働いていたため背景は動かなかったが、
Phase B のページスクロール移行で `/schedule`（`ScheduleCalendar.tsx` が利用）の予定モーダルを
開いたままホイールすると背景がスクロールする。

さらに `EventModal` のパネルはクリック位置由来の座標で viewport 基準に絶対配置されるため、
背景がスクロールすると**パネルがアンカー元のセルからずれる**。単なる「背景が動く」以上の破綻で、
Plan の検証表「Modal 背景 / 背景がスクロールしない」も満たしていない。

→ **反映済み**: early return より前に `useBodyScrollLock(modal.isOpen)` を追加。
なお「`Modal` / `Dialog` を経由しない自前オーバーレイは他に無い」ことを grep で確認済み。

### [NICE-TO-HAVE] モバイル無効化の media query が px、Tailwind の `md` は rem で基準がズレる

`--sidebar-w: 0px` の上書きは `@media (max-width: 767px)`（px）だが、Sidebar の表示切替は
Tailwind の `md`（`48rem`）。media query の `rem` はブラウザ既定フォントサイズ基準のため、
16px 以外の環境（アクセシビリティ目的で拡大しているユーザー）で境界が一致せず、
「Sidebar は非表示なのに幅だけ 240px 残る」帯域が生じる。

→ **反映済み**: `@media (max-width: 47.999rem)` へ変更。

### [NICE-TO-HAVE] scroll lock 時のスクロールバー幅補償がない

ページスクロール構成では、classic scrollbar 環境（Windows + Chrome = 本プロジェクトの
第一級環境）でモーダルを開くたびにスクロールバーが消え本文が約 15px 右へジャンプする。
`fixed` の TopBar / SubHeader 帯 / Sidebar は動かないためズレ方が不均一になる。

→ **反映済み**: lock 時に `window.innerWidth - documentElement.clientWidth` 分の
`padding-right` を body へ付け、解除時に復元する。

### [NICE-TO-HAVE] `GuardedLink` が `UrlObject` の href で壊れる

`String(href)` は `UrlObject` のとき `"[object Object]"` になる。現在の呼び出し元は必ず
string を渡すので実害はないが、型で縛るほうが確実。

→ **反映済み**: `Omit<ComponentProps<typeof Link>, "href"> & { href: string }` に変更。

### [NICE-TO-HAVE] `NAV_GROUPS` に載せ忘れた nav 項目が Sidebar から静かに消える

`toSidebarGroups` は `NAV_GROUPS.itemIds` 起点で写像するため、`NAV_ITEMS` に項目を足して
`NAV_GROUPS` へ登録し忘れると「下部タブには出るのに Sidebar には出ない」非対称な欠落になる
（現時点では全項目が網羅されていることは確認済み）。

→ **反映済み**: `navItems.test.ts` を追加し、双方向の整合（全項目がどれかのグループに属する /
グループが実在しない id を参照しない）を検査する。

### [NICE-TO-HAVE] `AppSidebar` と `HeaderUserMenu` で視点切替 / ログアウトが二重化

`switchRole` の `useMutation` と `logout()` が同一ロジックで重複し、エラー時の見せ方だけ
非対称（Sidebar は `section.error`、Header は toast）。片方だけ直す事故が起きやすい。
`useAccountActions()` へ切り出し、エラー表示だけ注入する形が素直。

→ **未反映**（Plan の残課題へ。モバイル導線として両方が必要なため統合は別タスク）。

### [NICE-TO-HAVE] `showNav === false` の経路が実質デッド

`NAV_ITEMS` に `roles` 無し項目が 3 つあるため `items.length > 1` は常に true。将来 false に
なった場合、`main` の `paddingLeft` と TopBar / 帯の `left` は Sidebar の有無を見ていないため、
デスクトップで 240px の空白ガターだけが残る。

→ **未反映**（Plan の残課題へ）。

### [NICE-TO-HAVE] `/me` 取得中の見せ方が Plan の受け入れ表と食い違う（記録整理）

Plan は「nav とアカウント行の**両方**をスケルトン」としているが、実装はアカウント行のみで、
nav は role なし 3 項目を先に描いて admin 群が後から生える。空欄は出ないので挙動としては
妥当だが、受け入れ条件を実態へ合わせる必要がある。

→ **反映済み**: Plan の検証表と判断ログを実態に合わせて更新。

## 確認して問題なかった点

**機能移設の網羅性**: 旧 `AppLayout` の要素はすべて追跡できた。`useDocumentTitle` /
`BackgroundTexture` と `relative` 祖先（`AppShellRoot className="relative"`）/
`BlurFade key={pathname}` / `ThemeSettingsModal` / 下部タブと表示条件 `items.length > 1` /
`SubHeaderPortal` の container（`SubHeaderSlotProvider` は最外殻に維持）/ 未保存ガード
（`GuardedLink` + TopBar の `guardedNavigate` + 下部タブ `onClick`）/ パンくず / 通知ベル /
視点切替（`showCheck` + `section.error`）/ ログアウト・PW 変更・テーマ設定。
`Footer` の文言のみ意図的に消えている（Plan の Footer 廃止方針どおり）。

**レイアウトのカスケード**: `--sidebar-w` は `AppShellRoot` 自身に宣言されるが、カスタム
プロパティは継承するため子ラッパ配下の `fixed` 要素からも正しく解決される。`--chrome-subheader-h`
の循環も無い（宣言はラッパ div、帯はその子で `fixed` のためフローに影響せず、消費者は
`main` 配下の DataTable）。`main` の `paddingTop = calc(--topbar-h + subHeaderH)` は
TopBar と帯の合計に一致し二重計上は無い。z-index も sidebar 40 > topbar 30 = 下部タブ 30 >
帯 20 > `.th` 3 の順で、`AppShellRoot` が stacking context を作らないため意図どおり比較される。

**SSR / hydration**: `await cookies()` → `parseSidebarState`（不正値は `expanded` へ fallback）→
`AppFrame` prop → `AppShellProvider` の一方向で初期描画から幅が確定する。`parseSidebarState` は
`"use client"` を持たない専用 subpath から import しており、Server Component にクライアント
部品を引き込んでいない。テーマは従来どおり `mounted` ガード、`subHeaderH` も SSR / 初回とも
44px で一致するため mismatch は無い。

**セキュリティ**: `GuardedLink` の href は `NAV_GROUPS` 由来の静的値のみでユーザー入力は
流れ込まない。`sidebar_state` cookie は enum を allowlist でパースし、機微情報を持たず
認可には一切使われていない。ログアウトは既存と同じ `POST /api/v1/auth/logout` →
`router.replace("/login")` 経路で、`confirmLeave()` を先に取る順序も維持されている。

**未使用化したもの**: `AppSideNav.tsx` は削除済みで参照ゼロ。`Header` / `SubHeader` / `Footer` /
`SideNav` / `FloatingMenuButton` の import も消えている（apps/web の残存参照は
`SubHeaderToolbar` のみ）。catalog 側テンプレートを残す判断は、上流同期資産で削除すると
次回同期の差分が増えるため妥当。

## 実施した検証と未検証事項

- 実施: `git status` / `git diff` による差分特定、Phase B 全ファイルの通読、
  `AppShellRoot` / `AppShellProvider` / `SidebarShell` / `SidebarNav` / `SidebarNavItem` /
  `SidebarAccountMenu` / `BackgroundTexture` / `EventModal` / `DropdownMenu` の実装確認、
  `AppSideNav` / 旧テンプレート参照の grep、subpath export の実在確認、`console.log` 検査
- 事実として受領: `pnpm turbo run typecheck lint build test` の 10 タスク成功、
  vitest の新規失敗ゼロ、全ルートの dynamic 化
- 未検証: **ブラウザ実描画**（Plan の受け入れ表による目視）。特にテーマ 3 軸連動時の
  コントラスト、`SubHeaderToolbar` の funnel 展開時の追従、Cmd+B、Cookie 永続は目視必須
