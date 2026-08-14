# Review: カタログ堅牢化（コードレビュー）

| 項目 | 判定 | メモ |
| --- | --- | --- |
| 最終判定 | APPROVE | BLOCKER なし。実装は Plan の主要判断に沿っている。 |
| Plan 判定 | N/A | 本レビューはコードレビュー。Plan 妥当性は既存レビューで APPROVE 済み。 |
| 実装判定 | APPROVE | Markdown sanitize、Dialog/Modal/EventModal の focus-trap/ARIA、依存追加はいずれも妥当。 |
| 記録整理 | FOLLOW-UP | 作業ブランチに Plan 外の archive zip 削除が混在しているため、PR 前に意図確認するとよい。 |

- 対象 Plan: [outputs/plans/2026-07-05-0835-ui-catalog-hardening.md](../plans/2026-07-05-0835-ui-catalog-hardening.md)
- 計画レビュー: [outputs/reviews/2026-07-05-0840-ui-catalog-hardening-review.md](2026-07-05-0840-ui-catalog-hardening-review.md)
- 対象差分: `fix/ui-catalog-hardening` の作業ツリーと `develop` の差分
- 作成日時: 2026-07-05 09:04 JST

## Findings

### MEDIUM

- [NICE-TO-HAVE] `MarkdownPreview` の catch フォールバック sanitize には専用回帰テストがあるとより堅い。  
  該当箇所: [packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.tsx](../../packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.tsx:25), [packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.test.tsx](../../packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.test.tsx:23)  
  通常の `marked.parse` 成功経路では `DOMPurify.sanitize(...)` が適用され、テストも `<script>`、`onerror`、`javascript:` URL を押さえている。一方、catch 側も実装では `DOMPurify.sanitize(...)` されているが、現行 4 件のテストは失敗経路を直接踏んでいない。`marked.parse` を mock して悪意ある message を含む例外を投げ、フォールバック HTML から危険属性や script が除去されることを確認すると、重点確認事項の「通常 parse と catch フォールバックの両方」をテスト面でも明示できる。実装自体は sanitize 済みなので差し戻し対象ではない。

### LOW

- [NICE-TO-HAVE] Confirm 系のキャンセル初期フォーカス方針をテスト名か Storybook の確認観点に残すと、判断ログとの差分が追いやすい。  
  該当箇所: [packages/ui/core/organisms/Dialog/Dialog.tsx](../../packages/ui/core/organisms/Dialog/Dialog.tsx:160)  
  計画時は danger を主対象にしていたが、実装は confirm variant 全般で `[data-dialog-cancel]` を初期フォーカスにしている。これは破壊的操作以外でも「確定よりキャンセルを先に置く」保守的な UX として妥当で、ConfirmDialog ラッパにも自然に波及する。将来の変更で「danger のみ」に戻されないよう、確認観点として明文化しておくとよい。

## 確認メモ

- `MarkdownPreview` は通常 parse の出力と catch フォールバックの両方で `DOMPurify.sanitize(...)` を通している。  
  該当箇所: [packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.tsx](../../packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.tsx:25)
- `MarkdownPreview.test.tsx` の 4 件は、通常 Markdown 表示、`<script>` 除去、イベント属性除去、`javascript:` URL 無効化を確認しており、主経路の回帰テストとして妥当。  
  該当箇所: [packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.test.tsx](../../packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.test.tsx:6)
- `Dialog` の `FocusTrap` は `escapeDeactivates: false` / `clickOutsideDeactivates: false` で、既存の Esc/backdrop close 経路と二重発火しにくい構成になっている。Confirm では `[data-dialog-cancel]` に初期フォーカスが向く。  
  該当箇所: [packages/ui/core/organisms/Dialog/Dialog.tsx](../../packages/ui/core/organisms/Dialog/Dialog.tsx:156)
- `Button` は props を DOM に spread しているため、`data-dialog-cancel` selector は実ボタンに届く。  
  該当箇所: [packages/ui/core/molecules/Button/Button.tsx](../../packages/ui/core/molecules/Button/Button.tsx:143)
- `Modal` は `role="dialog"` / `aria-modal` / `aria-labelledby` を panel 側に付与し、閉じるボタンも `IconButton` の `label` で `aria-label` が入る。  
  該当箇所: [packages/ui/core/organisms/Modal/Modal.tsx](../../packages/ui/core/organisms/Modal/Modal.tsx:78)
- `EventModal` は既存の `titleRef` 初期フォーカスを維持しつつ trap を付与しており、heading id による `aria-labelledby` と × ボタンの `aria-label` も確認できる。  
  該当箇所: [packages/ui/core/organisms/EventModal/EventModal.tsx](../../packages/ui/core/organisms/EventModal/EventModal.tsx:238)
- `focus-trap-react` / `isomorphic-dompurify` は `packages/ui` の `dependencies` に入り、catalog 側の責務として閉じている。  
  該当箇所: [packages/ui/package.json](../../packages/ui/package.json:216)

## スコープメモ

- `git diff develop --` では `docs/99_archive/1on1-main.zip` の削除が作業ツリーに含まれている。今回の UI catalog hardening とは無関係に見えるため、PR に含める意図がなければ分離確認を推奨する。実装品質上の BLOCKER ではない。
- `develop...HEAD` のコミット済み差分は空だったため、本レビューは現在の作業ツリー差分を対象にした。
- ユーザー申告の検証: `pnpm -r typecheck` / `pnpm lint`（web+ui）/ `pnpm --filter @wanonwan/web test`（69件）/ `pnpm --filter @wanonwan/web build` / MarkdownPreview 新規テスト 4 件 green。本レビューでは追加実行していない。
- 既知事項の ui テストスイート既存破損は、本レビューの指摘対象外として扱った。

verdict: APPROVE
