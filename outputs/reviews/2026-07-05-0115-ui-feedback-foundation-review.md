# Review: UI フィードバック基盤（Toast 配線・削除確認・ルート境界）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 01:15 JST |
| レビュアー | Codex |
| 対象 Plan | [`plans/2026-07-05-0101-ui-feedback-foundation.md`](../plans/2026-07-05-0101-ui-feedback-foundation.md) |
| レビュー種別 | 計画レビュー |

## 判定

| 軸 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER はなし。Toast Provider 化、削除 ConfirmDialog、ルート境界新設はいずれもテーマ1の目的に合っており、実装着手できる |
| Plan 判定 | **APPROVE** | 非目標の切り方と主要リスクの扱いは妥当。NICE-TO-HAVE は実装時の補強で足りる |
| 実装判定 | N/A | 本 Review は計画のみ。実装コードは未レビュー |
| 記録整理 | FOLLOW-UP | Review file は作成済み。Plan メタ情報 / Dashboard へのリンク反映は実装着手側でまとめて行うのがよい |

## 指摘事項

BLOCKER はありません。以下はすべて [NICE-TO-HAVE] で、差し戻し理由にはしません。

| 重大度 | 位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| [NICE-TO-HAVE] MEDIUM N-1 | Plan 実装計画 Step 1 / Step 5: [`ui-feedback-foundation.md` lines 69-72](../plans/2026-07-05-0101-ui-feedback-foundation.md#L69-L72), [`lines 88-91`](../plans/2026-07-05-0101-ui-feedback-foundation.md#L88-L91) / 現行 hook: [`useToast.ts` lines 33,45](../../packages/ui/core/hooks/ui/useToast.ts#L33), 現行 Toast: [`Toast.tsx` line 39](../../packages/ui/core/organisms/Toast/Toast.tsx#L39) | Plan は「error は自動クローズしない既存仕様」としているが、現行 `useToast` は `duration` を常に 3000ms に埋めるため、Provider が state 形をそのまま持ち上げると error/warning も自動クローズされる可能性がある | `ToastProvider` 実装方針に「`duration` 未指定時は Toast 側の default に委ねる」または「error/warning は Provider 側で `duration: 0` にする」を追記する。手動確認にも失敗トーストが閉じないことを 1 項目足す |
| [NICE-TO-HAVE] LOW N-2 | Plan リスク: [`ui-feedback-foundation.md` lines 103-109](../plans/2026-07-05-0101-ui-feedback-foundation.md#L103-L109) / 現行 Toast: [`Toast.tsx` line 122](../../packages/ui/core/organisms/Toast/Toast.tsx#L122), 現行 Dialog: [`Dialog.tsx` line 155](../../packages/ui/core/organisms/Dialog/Dialog.tsx#L155) | z-index 競合はリスク表に入っていてよい。ただし現行 Toast は `z-50`、Dialog/Modal は `zIndex: 10000` 系なので、「Modal より上に固定」は実装ステップにも明示した方が取りこぼしにくい | Step 1 かリスク対応に、Toast の z-index を Dialog/Modal より上げる具体策を追記する。例: Toast root を `z-[10010]` 相当にする、または Provider の portal container 側で固定する |
| [NICE-TO-HAVE] LOW N-3 | Plan 実装計画 Step 3: [`ui-feedback-foundation.md` lines 76-83](../plans/2026-07-05-0101-ui-feedback-foundation.md#L76-L83) | `global-error.tsx` / `error.tsx` は `reset()` やクリック操作を持つため Client Component 前提だが、Plan には `"use client"` が明記されていない | Step 3 に「`global-error.tsx` と `error.tsx` は `"use client"` を付ける。`global-error.tsx` は `<html>/<body>` を自前で描画する」と明記する |
| [NICE-TO-HAVE] LOW N-4 | Plan 検証: [`ui-feedback-foundation.md` lines 93-101](../plans/2026-07-05-0101-ui-feedback-foundation.md#L93-L101) / root script: [`package.json` line 15](../../package.json#L15), ui script: [`packages/ui/package.json` line 64](../../packages/ui/package.json#L64) | Plan は `packages/ui` に Provider / export を追加するが、`pnpm lint` は root では `@waoon/web` のみを lint する。ui package 側 lint が検証から漏れる | 検証に `pnpm --filter @ui-catalog/core lint` を足す。Provider に unit test を置くなら、対応する ui 側 test command も併記する |

## 妥当性レビュー

- Toast をコンポーネントローカルではなく app Provider 方式にする判断は妥当。`SurveyForm` / `UserForm` / `AnswerForm` は保存成功後に `router.push` しており、ローカル state の Toast では遷移時に表示主体が消えるため、`app/providers.tsx` 配下で生存させる設計が目的に直結している。
- ToastProvider を `apps/web` ではなく `packages/ui` 側へ置く判断も妥当。`Toast` / `useToast` / `ConfirmDialog` はすでに catalog 側にあり、`@ui-catalog/core` は `./hooks` や organism を export する構造なので、`./providers` を追加する拡張は CLAUDE.md の「新規 UI 部品は原則 ui-catalog に吸収」と整合する。アプリ固有の router / API / Jotai に依存させない前提は維持したい。
- `global-error.tsx` を catalog / theme atom 非依存の素の Tailwind で書く判断は妥当。root layout ごと落ちるケースの最後の表示なので、`AppFrame`、Jotai、catalog organism に依存しない方が共倒れを避けやすい。
- 非目標の切り方は妥当。focus-trap / ARIA、ページネーション、未保存警告はいずれもテーマ1の「操作結果の最低限フィードバック」からは独立しており、ここで抱え込むよりテーマ2以降に回す方が Plan の粒度を保てる。
- ConfirmDialog の focus-trap 欠落を既知制約として受容する判断は、今回の計画レビューでは許容範囲。破壊的操作の即実行を止める価値が大きく、catalog 堅牢化で後追い改善する整理でよい。

## 次に進む道

1. Plan は承認扱いで実装に進めてよい。
2. 実装時に N-1 から N-4 を小さく拾う。特に error/warning Toast の duration と z-index はコードレビューで見落としやすいので、実装差分に含めるのが安全。
3. コードレビューでは Provider の生存範囲、`global-error.tsx` の依存ゼロ、ConfirmDialog のキャンセル時 no-op、遷移後 Toast 表示を重点確認する。

## 検証（この Review 自体の）

- [x] 対象 Plan を確認
- [x] 既存 Review の形式を確認
- [x] `.claude/rules/plan-review-workflow.md` と CLAUDE.md の関連方針を確認
- [x] `apps/web/app` の実ルート構成、`app/providers.tsx`、主要フォーム / editor の存在を確認
- [x] `packages/ui` の Toast / useToast / ConfirmDialog / useConfirm / export 構造を確認
- [x] 検証コマンドと package scripts の整合を確認
- [ ] 実装コードの typecheck / lint / test は未実施（計画レビューのため）

verdict: APPROVE
