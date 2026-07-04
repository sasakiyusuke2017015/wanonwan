# Review: UI フィードバック基盤（コードレビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 02:10 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-07-05-0101-ui-feedback-foundation.md`](../plans/2026-07-05-0101-ui-feedback-foundation.md) |
| 計画レビュー | [`2026-07-05-0115-ui-feedback-foundation-review.md`](2026-07-05-0115-ui-feedback-foundation-review.md)（APPROVE） |
| レビュー種別 | コードレビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER はなし。Toast Provider 配線、削除確認、ルート境界は Plan の主目的を満たしている |
| Plan 判定 | N/A | 本レビューはコードレビュー |
| 実装判定 | **APPROVE** | 計画レビュー N-1〜N-4 は実装へ反映済み。重点確認項目も成立している |
| 記録整理 | **FOLLOW-UP** | Review file は作成済み。PR 化前に Plan / Dashboard へ本コードレビューリンクを反映するとよい |

## Findings

BLOCKER はありません。以下は [NICE-TO-HAVE] のみで、差し戻し理由にはしません。

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [NICE-TO-HAVE] LOW N-1 | [`AttachmentsPanel.tsx` line 70](../../apps/web/components/admin/AttachmentsPanel.tsx#L70), [`line 95`](../../apps/web/components/admin/AttachmentsPanel.tsx#L95) / Plan Step 5: [`ui-feedback-foundation.md` lines 94-96](../plans/2026-07-05-0101-ui-feedback-foundation.md#L94-L96) | Plan は AttachmentsPanel も「mutation 成功/失敗に success / error トースト」としているが、アップロード/削除の失敗時は従来どおり inline `setError` のみ。Questions / Publications の削除失敗 toast は実装済みなので重点確認は満たすが、Plan 文言とは少しズレる | 揃えるなら `catch` で `showToast(..., { type: "error" })` も出す。inline error を残すかは現行 UX 維持でよい |

## 重点確認

- ToastProvider の生存範囲は妥当。RootLayout の [`Providers`](../../apps/web/app/layout.tsx#L15) 配下、`AppFrame` より外側で [`ToastProvider`](../../apps/web/app/providers.tsx#L17) が children を包むため、`router.push` による root 内遷移では表示主体が残る。
- duration は N-1 どおり修正済み。[`ToastProvider`](../../packages/ui/core/providers/ToastProvider.tsx#L44) は `duration` を注入せず、[`Toast`](../../packages/ui/core/organisms/Toast/Toast.tsx#L39) 側の error/warning 自動クローズ無効 default に委譲している。
- z-index は N-2 どおり修正済み。Toast は [`zIndex: 10010`](../../packages/ui/core/organisms/Toast/Toast.tsx#L125)、Dialog は [`zIndex: 10000`](../../packages/ui/core/organisms/Dialog/Dialog.tsx#L155)。
- `global-error.tsx` は依存ゼロの方針を満たす。[`"use client"`](../../apps/web/app/global-error.tsx#L1)、`<html>/<body>` 自前描画、catalog / theme atom / Providers import なし。
- ConfirmDialog のキャンセル時 no-op は成立。Questions / Publications / Attachments の mutation は `showConfirm(... onConfirm: ...)` 内だけで発火し、`handleCancel` 側には mutation 呼び出しがない。
- Questions / Publications の削除失敗 toast は実装済み。[`QuestionsEditor.tsx`](../../apps/web/components/admin/QuestionsEditor.tsx#L64) と [`PublicationsEditor.tsx`](../../apps/web/components/admin/PublicationsEditor.tsx#L55) で error toast を出している。

## 妥当性レビュー

- `@ui-catalog/core/providers` の package export と barrel export が追加されており、app 側 import と整合している。
- 保存成功 toast は Survey / User / Answer の遷移直前、および Interview の refresh 前に発火している。Provider が root 側にあるため、保存後の無言遷移問題は解消できる。
- ルート境界は `global-error` / `error` / `not-found` / 主要 loading segment が揃っており、テーマ1の「最低限のフィードバック基盤」として過不足ない。

## 検証（この Review 自体の）

- [x] 対象 Plan と計画レビューを確認
- [x] `develop...HEAD` のコミット差分が空であることを確認し、現在の working tree 差分を `develop` と照合してレビュー
- [x] ToastProvider / Toast / package exports / app providers を確認
- [x] `global-error.tsx` / `error.tsx` / `not-found.tsx` / loading files を確認
- [x] Questions / Publications / Attachments の ConfirmDialog と削除 mutation を確認
- [x] Survey / User / Interview / Answer の保存 toast を確認
- [ ] `pnpm -r typecheck` / `pnpm lint` / `pnpm --filter @waoon/web test` / build は未実行（ユーザー申告では green）

verdict: APPROVE
