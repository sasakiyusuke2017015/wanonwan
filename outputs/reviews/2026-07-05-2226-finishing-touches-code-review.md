# コードレビュー: 仕上げ Phase 1（ページタイトル）

- 対象 Plan: [仕上げ（ページタイトル/公開一覧/ダーク/VRT）](../plans/2026-07-05-2015-finishing-touches.md)
- 対象ブランチ: `feature/page-titles`（develop 起点・未コミット作業ツリー）
- レビュー種別: コードレビュー（Phase 1 実装）
- レビュー方針: `[BLOCKER]` / `[NICE-TO-HAVE]`。現行スタック（Next 16 / React 19 / @waoon/ui）は所与。当 PR で変更していない既存コードの bad practice は対象外。

## 最終判定

| 軸 | 判定 | 補足 |
|---|---|---|
| 最終判定 | **APPROVE** | `[BLOCKER]` なし。`[NICE-TO-HAVE]` のみ |
| Plan 判定 | N/A | 本レビューは実装レビュー（計画レビューは [2040 review](2026-07-05-2040-finishing-touches-review.md) 済み） |
| 実装判定 | APPROVE | 正しさ・網羅性・template 整合すべて確認済み |
| 記録整理 | OK | Plan ステータス / dashboard は同 PR で更新済み |

## 重点観点の検証結果

### 1. 正しさ（effect 依存 / SSR 安全性 / fallback 分岐）— OK

- `useDocumentTitle`（[useDocumentTitle.ts:9-13](../../apps/web/hooks/useDocumentTitle.ts)）は `"use client"` + `useEffect` 内でのみ `document` に触れるため SSR 安全。依存配列 `[title]` も適切。
- fallback 分岐（`title && title !== "waoon" ? ... : "waoon"`）は、AppLayout の `activeLabel` が `"waoon"` fallback（[AppLayout.tsx:55](../../apps/web/components/layout/AppLayout.tsx)）のとき suffix なしの `"waoon"` になり、root metadata の `default` と一致する。妥当。

### 2. 網羅性（prefix match での認証パス被覆）— OK

全 authed ページを列挙し、`isNavItemActive`（[navItems.ts:69-71](../../apps/web/components/layout/navItems.ts)）の prefix match で意味あるセクション名にマップされることを確認:

| パス群 | マップ先 label |
|---|---|
| `/dashboard` | ダッシュボード |
| `/surveys`, `/surveys/[publishId]` | アンケート |
| `/schedule` | スケジュール |
| `/admin/users`, `/new`, `/[id]/edit` | ユーザー管理 |
| `/admin/surveys` + 配下 | アンケート管理 |
| `/admin/questions` + 配下 | 設問マスタ |
| `/admin/answers`, `/[id]` | 回答・面談 |
| `/admin/org` + `/divisions|departments|sections/...` | 組織マスタ |
| `/admin/positions` + 配下 | 役職マスタ |
| `/admin/urgencies` + 配下 | 緊急度マスタ |

- authed で `"waoon"` fallback に落ちるページは無い（`/admin/org/divisions/new` 等の深いパスも `startsWith('/admin/org/')` で拾える）。
- `/`（[app/page.tsx](../../apps/web/app/page.tsx)）は `redirect('/dashboard')` で描画されないため title 無関係。
- `/ui-demo` は BARE_PATH かつ NAV 非登録 → `"waoon"` 既定のまま。dev デモ用途なので問題なし。
- NAV_ITEMS の href に相互ネストが無い（`/admin` 単独項目が無い）ため、`items.find(i => i.active)` の先頭一致で label が競合しない点も確認。

### 3. template との整合 — OK

- login / change-password は BARE_PATHS（[AppFrame.tsx:8](../../apps/web/components/layout/AppFrame.tsx)）で AppLayout 外。よって AppLayout の `useDocumentTitle(activeLabel)` とページ個別 `useDocumentTitle(...)` が **同一ツリーで二重発火しない**。二重サフィックス無し。
- suffix 区切りはフック（`${title} ｜ waoon`）と root template（`%s ｜ waoon`）で全角バー `｜` + 前後半角スペースが完全一致。
- root metadata `title: { default, template }` は Next の `Metadata['title']`（TitleTemplate）型に適合。typecheck green と整合。

### 4. hooks 規約 / 未使用 import — OK

- `useDocumentTitle` の呼び出しはすべて条件分岐前・トップレベル（login は `LoginPage` 直下、change-password は他フック直後）。early return より前で呼ばれており hooks ルール順守。
- 追加 import に未使用なし。

## 指摘

### [NICE-TO-HAVE] `"waoon"` リテラルが 3 箇所に分散

`"waoon"` という文字列が root metadata の `default`（[layout.tsx:7](../../apps/web/app/layout.tsx)）、AppLayout の fallback（[AppLayout.tsx:55](../../apps/web/components/layout/AppLayout.tsx)）、フック内の特別扱い（[useDocumentTitle.ts:11](../../apps/web/hooks/useDocumentTitle.ts)）の 3 箇所にハードコードされている。フックが `"waoon"` を magic string として比較しているため、AppLayout の fallback 文字列がずれると suffix 判定が壊れる暗黙結合がある。

修正案（任意）: AppLayout 側で fallback を `null` にし、フックは falsy を既定名にフォールバックさせる。

```ts
// AppLayout.tsx
const activeLabel = items.find((i) => i.active)?.label ?? null;

// useDocumentTitle.ts
const APP_NAME = "waoon";
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} ｜ ${APP_NAME}` : APP_NAME;
  }, [title]);
}
```

これで「セクション名が偶然 `"waoon"` だったら suffix を付けない」という意味的にやや不自然な分岐も消える。

### [NICE-TO-HAVE] クライアントナビ時の title 更新順序を実機確認したい

root metadata の `default` が `"waoon"` のため、App Router のクライアント遷移で Next が metadata 由来の title（`"waoon"`）を適用するタイミングと、AppLayout の `useEffect` が section 名を上書きするタイミングが交差し得る。初期ロードは問題ないが、**セクション間のクライアント遷移直後**にタブが一瞬 `"waoon"` になる / まれに `"waoon"` で上書きされる可能性がある。Plan の検証項目（笹木さん手動確認）に「初期表示だけでなくクライアント遷移後の title」も明記しておくと安全。実装上の欠陥ではなく、metadata + `document.title` 併用設計に内在する確認事項。

## 実施した検証 / ギャップ

- 実施: 差分全読み、AppFrame / navItems / useNavigationItems の被覆解析、全 authed page ルート列挙による網羅確認、`document.title` / metadata `title` の他箇所競合 grep（競合なし）。
- 未実施（提出者申告どおり）: dev 起動での実タブ表示確認（笹木さん手動）。上記 NICE-TO-HAVE #2 の遷移後 title を含めて確認推奨。
- `pnpm turbo run typecheck lint build test` green は提出者申告に依拠。

## verdict

APPROVE
