# Review: app shell（レイアウト/テーマ）を旧 1on1 の見た目に寄せる（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-28 22:47 JST |
| レビュアー | Claude Code（code-reviewer） |
| 対象 Plan | [app-shell-legacy-look](../plans/2026-06-28-2212-app-shell-legacy-look.md) |
| ブランチ | `feature/app-shell-legacy-look` |
| 関連 PR | TBD |
| レビュー種別 | 実装（コード） |
| 対象差分 | 未コミット差分（AppLayout 書き換え + AppSideNav/HeaderUserMenu 新規 + useNavigationItems 修正 + package.json exports 追記 + logout-button.tsx 削除） |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER ゼロ |
| Plan 判定 | N/A | 計画は別途承認済み（本レビューは実装対象） |
| 実装判定 | APPROVE | API 利用正当・dead code なし・hydration ガード整合。NICE 指摘のみ |
| 記録整理 | OK | Plan の判断ログと実装が一致。drift なし |

## 確認した観点（すべて問題なし）

- **`"use client"` 境界**: AppLayout / AppSideNav / HeaderUserMenu すべてクライアント部品。`useRouter` / `useState` / `getBoundingClientRect` を使うため正当。
- **hydration**: `mounted` ガードで SSR/初回描画は `DEFAULT_THEME`、mount 後に `liveTheme` へ切替（`AppLayout.tsx:45-48`）。localStorage 由来テーマでの mismatch を回避できており整合。
- **`useEffect`**: `setMounted(true)` のみ。依存配列 `[]` 妥当。
- **`key` の使い方**: 本文 `BlurFade key={pathname}`（`AppLayout.tsx:126`）でページ遷移ごとに再マウントしフェード再生 → 意図通り。ナビ `key={item.id}` も妥当。
- **`router.push` / `router.replace`**: ナビ遷移は `push`、ログアウト後は `replace("/login")` + `refresh()`（`HeaderUserMenu.tsx:27-28`）。戻るボタンでログイン後画面に戻れないようにする意図として正しい。
- **テーマ色キー**: `navActiveBgColor` / `navActiveTextColor` / `navHoverBgColor` / `navHoverTextColor` / `secondaryTextColor` / `primaryContrastText` はすべて `packages/ui/core/constants/design.ts` に存在（`ThemeConfig["colors"]` 型経由で参照、型安全）。mounted ガード後の `colors` を一貫して使用。
- **package.json exports**: 追記 4 件（BlurFade / FloatingMenuButton / DropdownMenu / MenuItemList）は既存の `./organisms/Modal` / `./organisms/BackgroundTexture` と完全に同形（`./core/organisms/<Name>/index.ts`）。バレル経由で window 参照を持つ別 organism を巻き込む prerender 失敗を狭い subpath で回避する判断ログとも整合。
- **dead code（logout-button.tsx 削除）**: ソースツリーに `LogoutButton` / `logout-button` の参照ゼロ（`.next` ビルドキャッシュ内のヒットのみ）。集約により参照ゼロ = 削除妥当（evergreen）。
- **useNavigationItems の me.email 修正**: `/api/v1/auth/me` は `user: { email }` 形で返す（`route.ts:26`）。`data.user?.email ?? null` の取り出しは API 実装と一致（`useNavigationItems.ts:39-41`）。optional chaining で欠落時も安全。
- **エラーハンドリング**: ログアウトの fetch を try/catch し、失敗時は `loggingOut` を戻して再操作可能に（`HeaderUserMenu.tsx:29-31`）。
- **イミュータビリティ**: mutation なし。`setSideOpen((v) => !v)` も関数更新で正しい。
- **アクセシビリティ**: サイドナビ各ボタン `aria-label={item.label}`（`AppSideNav.tsx:63`）、FloatingMenuButton は内部で `aria-label` を持つ、MenuItemList.Item は `role="menuitem"` + `tabIndex=0` + Enter/Space 対応（UI 側）。下部タブ・サイドナビとも `<button type="button">` で適切。
- **参照先の存在**: `/api/v1/auth/logout`（route.ts）/ `/change-password`（page.tsx）いずれも実在。

## レビュー結果

| 重大度 | ラベル | ファイル:行 | 指摘 | 推奨対応 |
|---|---|---|---|---|
| 低 | NICE-TO-HAVE | `AppSideNav.tsx:54-56` | `ref` コールバックで `itemRefs.current.set(item.id, el)` するが、アンマウント時に Map から `delete` していない。ナビ項目は admin 判定で増減し得る（`useNavigationItems` の `adminOnly` フィルタ）ため、非表示になった項目の id が Map に残留する。実害は「使われない参照が数件残る」程度（id は固定セットで GC 上も `WeakMap` 不要レベル）だが、cleanup を返すとより正確。 | `ref={(el) => { if (el) itemRefs.current.set(item.id, el); else itemRefs.current.delete(item.id); }}`（React 19 は ref cleanup 関数も可：`ref={(el) => { itemRefs.current.set(item.id, el); return () => itemRefs.current.delete(item.id); }}`） |
| 低 | NICE-TO-HAVE | `AppSideNav.tsx:96-106` ツールチップ | ツールチップ色 `rgba(31,41,55,0.95)` がハードコード。テーマ非連動（旧実装も `bg-gray-800` 固定なので踏襲としては妥当）。テーマ追従させたいなら将来 `secondaryBgColor` 等に寄せる余地。 | 現状維持で可。テーマ連動が要件化したら別タスク。 |
| 低 | NICE-TO-HAVE | `AppSideNav.tsx:32-33` ツールチップ top | `getBoundingClientRect().top` を `mouseEnter` 時に1回だけ算出。ホバー保持中にウィンドウリサイズ／テーマモーダル開閉でレイアウトが動くと top がズレ得る。サイドナビは `position:fixed` で本文スクロールには追従不要のため通常操作では問題ない（旧実装も同方式）。 | 現状維持で可。気になるならホバー中の `resize` リスナで再計算。 |
| 低 | NICE-TO-HAVE | `AppLayout.tsx:20` `SUBHEADER_HEIGHT = 44` | サブヘッダ高さがマジックナンバー（内側 `h-11`=44px とは一致しているが二重定義）。`LAYOUT_SIZES` 由来の定数があればそちらに寄せると DRY。 | UI 側に定数があれば参照、なければ現状可。 |

## レイアウト破綻リスクの所見

- ルートを `h-screen overflow-hidden`（`AppLayout.tsx:56`）にし、`<main>` のみ `overflow-y-auto`（L117-118）。SubHeader/Footer は `position:fixed; right:0; left:sideShift`、SideNav は `position:fixed`。chrome はすべて fixed で本文フローから外れるため、`main` の `paddingTop`/`paddingBottom`/`paddingLeft` で chrome 分を確保する設計は整合。
- **FloatingMenuButton と Footer の重なり**: `position="bottom-left"` のボタンは `bottom:8px` / 中心 `LEFT_PANE_WIDTH/2 - size/2`（`FloatingMenuButton.tsx:83,88`）で z-index 10000。Footer は z-index 50（`Footer.module.scss`）。**ボタンが Footer の上に重なる**が、ボタンはサイドナビレール幅内に収まり、Footer は中央テキストのみのため機能的衝突はない（旧 1on1 と同じ重なり方）。視認上 Footer 左端にボタンが乗るのは設計通り。
- **paddingLeft transition**: `main` に `transition-all duration-300`（L118）、SubHeader/Footer も同方式（scss `transition: left 300ms` / `all`）で本文・chrome が同期して寄る。整合。
- **R1（Phase 2 全画面影響）**: コードレビュー範囲では破綻箇所を特定できず。ただし**高さ前提でない既存ページ（admin テーブル / dashboard / schedule カレンダー）の実画面崩れは静的レビューでは検出不能**。Plan の検証チェックボックス「ブラウザ目視（全画面の崩れ確認）」が未了のため、ここは目視での確認が必須（下記検証ギャップ）。

## 検証

- typecheck / build: グリーン（依頼者確認済み・本レビューでは再実行せず）。
- 静的確認: API 利用・参照先存在・dead code・hydration ガード・exports 同形性を上記の通り確認。

### 検証ギャップ（最終判定は下げない）

- **ブラウザ目視が未了**（Plan ステータス `- [ ] ブラウザ目視`）。特に Phase 2 のスクロールモデル変更は全画面に影響するため、admin テーブル / dashboard / schedule カレンダー等の縦スクロール・高さ前提ページが崩れないことを実画面で確認すること。崩れた場合は当該ページのみ個別 fallback（Plan R1 の方針）。
- モバイル下部タブの表示・サイドナビ開閉・本文の寄り・ヘッダーメニュー導線（テーマ/PW変更/ログアウト）の実動作確認。

## 残課題（NICE-TO-HAVE、後追い可）

- `AppSideNav` の `itemRefs` cleanup（上表）。
- ツールチップ色のテーマ連動（要件化したら別タスク）。
- `SUBHEADER_HEIGHT` の定数集約。

## 最終判定: APPROVE

BLOCKER（セキュリティ脆弱性 / ランタイムバグ / Plan 要件未達）はゼロ。NICE-TO-HAVE のみのため APPROVE。ただし **マージ前に Plan のブラウザ目視チェック（特に Phase 2 の全画面崩れ確認）を完了すること**を条件として付す（コード品質の差し戻しではなく、Plan 記載の検証手順の履行）。
