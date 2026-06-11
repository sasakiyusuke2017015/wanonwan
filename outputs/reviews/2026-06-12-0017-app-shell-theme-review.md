# コードレビュー: feature/app-shell-theme（アプリシェル + テーマ3軸 基盤）

- 対象ブランチ: `feature/app-shell-theme`
- レビュー範囲: 未コミット差分（`git diff` + 新規 `apps/web/components/layout/`）
- 対応 Plan: なし（durable Plan 未作成。本増分は基盤導入のみ）
- レビュー日時: 2026-06-12 00:17

## サマリ

「見た目踏襲（ui-catalog 本格適用）」第1増分として、テーマ3軸 + AppLayout シェル +
ナビ + テーマ切替UI を導入する基盤。hydration 安全性・シェル境界・型キャスト・
既存ページ移設・deep export 方針をレビューした。

BLOCKER は無し。設計の肝である hydration の mounted ゲートは正しく機能しており、
シェル系 ui-catalog コンポーネントが内部で theme atom を読まず props 駆動である点まで
確認した。NICE-TO-HAVE が数点。

## 観点別所見

### 1. hydration 安全性 — 問題なし
- `atomWithStorageSync` は `getStoredValue` をモジュール評価時に同期実行するため、
  クライアントでは atom 初期値が即 localStorage 値になる。これ単体では mismatch を起こすが、
  `AppLayout` が `mounted ? liveTheme : DEFAULT_THEME` でゲートしており、SSR と
  クライアント初回描画をともに既定テーマ（emerald/soft/wood）へ揃えている。正しい。
- シェル系（Header/SubHeader/SideNav/Footer/NavItem/BackgroundTexture）は内部で
  theme atom を読まず、すべて props 経由（AppLayout のゲート済み値）で受ける。
  確認済みで mismatch 経路なし。
- `BackgroundTexture` も `theme={background}`（mounted ゲート済み）を受ける。
- nav の admin 項目は client の `/me` 解決後に増えるが、SSR では AppLayout 自体が
  `"use client"` ツリー配下で、サーバ初期 HTML も client 初回も `data=undefined →
  isAdmin=false → 非admin 2項目` で一致する。`/me` 解決は mount 後の再レンダリングで
  起きるため mismatch にならない。問題なし。
- シェル外で theme atom を直接読むアプリ側コンポーネントは存在しない（grep で確認）。

### 2. /login 以外の未認証到達ルートへのシェル付与 — 要注意（NICE-TO-HAVE）
- `middleware.ts` の `PUBLIC_PATHS = ["/login", "/ui-demo"]` で `/ui-demo` が
  未認証到達可能。一方 `AppFrame` の `BARE_PATHS = ["/login"]` のみ。
  結果 `/ui-demo` は未認証でもシェル付きで描画される。
- クラッシュはしない（`/me` が 401 → `apiGet` throw → `data=undefined` →
  非admin 2項目で描画）。ただし「未認証ページにシェル（ログアウトボタン等）が出る」のは
  意図とズレる。`/ui-demo` を BARE_PATHS に加えるか、ui-demo を middleware の public から
  外すか方針を統一すべき。基盤増分なので BLOCKER にはしない。

### 3. テーマ切替の型安全性 — 許容（NICE-TO-HAVE）
- `PillSelect` の `onChange: (value: string) => void` が string のため
  `as typeof colorTheme` 等のキャストが必須。options が `as const` の閉じた集合なので
  実値は常に正当で実害なし。型健全性は失われるが許容範囲。
  改善するなら PillSelect をジェネリック化するか、ローカルで値検証する。

### 4. 既存ページの移設 — 問題なし
- `<main>` → `<div>` 化により、シェルの `<main>`（AppLayout）と二重 `<main>` を回避できている。
- `(admin)/layout.tsx` の独自ヘッダ撤去・admin ガードのみ残す変更は適切。
  ただし `import Link` は分岐内の非admin/エラー表示で使用継続のため dead import ではない（確認済み）。
- `surveys/page.tsx` のホームへリンク削除はナビ重複解消として妥当。

### 5. deep export 方針 — 妥当
- organisms/templates の barrel が MarkdownEditor(codemirror)/CalendarPage を巻き込み
  SSR で window 参照 → ビルド不能になる問題を、必要分の deep import で回避する判断は妥当。
  barrel の副作用 import を断ち切る現実的な解。代替（barrel 側の動的 import 化等）は
  ベンダリング先 packages/ui の改変になり本増分のスコープ外。現方針で良い。

## 指摘一覧

### [BLOCKER]
なし。

### [NICE-TO-HAVE]
1. `.claude/settings.json` に実装と無関係な Bash 許可コマンドが大量自動追記されている。
   PR ノイズになるため本コミットからは除外し、別管理にするのが望ましい。
2. `/ui-demo` がシェル付きで未認証描画される（観点2）。BARE_PATHS と middleware public の
   整合を取る。
3. 既定テーマが2箇所で表現されている: `AppLayout` の
   `DEFAULT_THEME = getThemeConfig("emerald","soft")` / `background = "wood"` ハードコードと、
   ui 側 `DEFAULT_GLOBAL_THEME`。`getThemeConfig(DEFAULT_GLOBAL_THEME.colorTheme,
   DEFAULT_GLOBAL_THEME.shapeTheme)` / `DEFAULT_GLOBAL_THEME.backgroundTheme` 参照にすると
   将来の既定変更で SSR/クライアントの一致が自動的に保たれ、ドリフトを防げる。
4. `useNavigationItems` と `AdminLayout` が同一 `queryKey: ["me"]` を共有するのは
   キャッシュ共有として良い設計だが、`Me` 型が2箇所で別定義（一方に `email?`）。
   共通型へ寄せると重複が消える。
5. 後続予定（各ページの InteractiveTable/FormField 定石化）は本増分のスコープ外。
   残課題として認識のみ。

## 最終判定

- Plan 判定: 該当 Plan なし（基盤増分、Plan 不要レベル）
- 実装判定: APPROVE
- 記録整理: 上記 NICE-TO-HAVE は後続タスク／別コミットで対応。特に指摘1（settings.json）は
  PR 前にコミットから外すことを推奨。

verdict: APPROVE
