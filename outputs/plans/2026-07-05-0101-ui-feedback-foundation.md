# Plan: UI フィードバック基盤（Toast 配線・削除確認・ルート境界）

> ステータス: 🟦 コードレビュー完了（APPROVE）・PR 化待ち

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 01:01 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | `feature/ui-feedback-foundation` |
| 関連 PR | TBD |
| レビュー | [計画レビュー](../reviews/2026-07-05-0115-ui-feedback-foundation-review.md): APPROVE / [コードレビュー](../reviews/2026-07-05-0210-ui-feedback-foundation-code-review.md): APPROVE |

## 目的

UI/UX 監査（2026-07-05 チャット内）で High と判定された 3 ギャップを解消し、
「操作の結果がユーザーに伝わる」最低限のフィードバック基盤を作る。

- **H-1**: `global-error.tsx` / `not-found.tsx` / `error.tsx` / `loading.tsx` が皆無
  → 想定外エラーは白画面直行、404 専用画面なし
- **H-2**: catalog に [Toast](../../packages/ui/core/organisms/Toast/Toast.tsx) /
  [useToast](../../packages/ui/core/hooks/ui/useToast.ts) が実装済みなのにアプリ側 import 0 件
  → 保存・削除が成功しても無言で遷移
- **H-3**: 破壊的操作（設問・掲載・添付の削除）が確認なし即実行
  （catalog の [ConfirmDialog](../../packages/ui/core/organisms/ConfirmDialog/ConfirmDialog.tsx) /
  [useConfirm](../../packages/ui/core/hooks/ui/useConfirm.ts) 未使用）

### 非目標（このテーマではやらない）

- Modal/Dialog の focus-trap・ARIA 付与（テーマ2「カタログ堅牢化」で対応）
- 一覧のページネーション・リトライ導線（テーマ3）
- 未保存警告・フォームのカタログ化（テーマ4）
- ユーザー / アンケート本体の削除導線の新設（削除機能自体が未実装。別 Plan）
- サーバ側の構造化ロギング・instrumentation（別テーマ。global-error はクライアント表示のみ担当）

## スコープ

| 対象 | 変更 |
|---|---|
| `packages/ui/core/providers/`（新設） | `ToastProvider` + `useAppToast()`（app 全体で使う context 版 Toast） |
| `apps/web/app/providers.tsx` | ToastProvider を配線 |
| `apps/web/app/global-error.tsx`（新規） | root layout ごと落ちたときの最終エラー画面 |
| `apps/web/app/error.tsx`（新規） | シェルを保ったままのページエラー境界（再試行ボタン付き） |
| `apps/web/app/not-found.tsx`（新規） | 404 専用画面 |
| `apps/web/app/(admin)/loading.tsx` ほか主要セグメント（新規） | ナビゲーション時のローディング表示（catalog `Spinner`） |
| `components/admin/QuestionsEditor.tsx` | 設問削除に ConfirmDialog + 成功/失敗トースト |
| `components/admin/PublicationsEditor.tsx` | 掲載削除に ConfirmDialog + 成功/失敗トースト |
| `components/admin/AttachmentsPanel.tsx` | 添付削除に ConfirmDialog、アップロード/削除に成功トースト |
| `components/admin/{SurveyForm,UserForm,InterviewForm}.tsx`・`components/survey/AnswerForm.tsx` | 保存成功時トースト（遷移後も表示される） |

## 現状コンテキスト

- Toast/useToast/useConfirm は catalog 実装済みだが **すべてコンポーネントローカル state**。
  保存成功 → `router.push` するフォーム（[SurveyForm.tsx:84-88](../../apps/web/components/admin/SurveyForm.tsx#L84-L88)、
  [UserForm.tsx:115-116](../../apps/web/components/admin/UserForm.tsx#L115-L116)、
  [AnswerForm.tsx:128-129](../../apps/web/components/survey/AnswerForm.tsx#L128-L129)）では
  ローカル Toast は遷移で即アンマウントされ見えない。
  → **遷移をまたいで生存する Provider（`providers.tsx` 直下）が必須**。これが本 Plan の中核設計。
- 即時削除の現場: [QuestionsEditor.tsx:104](../../apps/web/components/admin/QuestionsEditor.tsx#L104)、
  [PublicationsEditor.tsx:92](../../apps/web/components/admin/PublicationsEditor.tsx#L92)、
  [AttachmentsPanel.tsx:108](../../apps/web/components/admin/AttachmentsPanel.tsx#L108)。
- [InterviewForm.tsx:154](../../apps/web/components/admin/InterviewForm.tsx#L154) だけ緑テキストの
  成功表示があり、トーストへ統一する。
- 参考実装: ai_edu フォークの `global-error.tsx` / `not-found.tsx`（error.digest の
  「エラー ID」表示、root `<html>/<body>` を自前で描画する制約コメント）。
  waoon 向けには文言・スタイルを調整して移植する。

## 実装計画

1. **catalog: ToastProvider / useAppToast**（`packages/ui/core/providers/`）
   - 既存 `Toast` organism + `useToast` の state 形をそのまま context に持ち上げる
     （表示 API は `showToast(message, { type })` 互換。新規部品は作らず配線層のみ追加）。
   - **duration は Provider で埋めない**（`useToast` のように 3000ms を固定注入せず
     undefined のまま `Toast` へ渡し、error/warning=自動クローズなしの Toast 側 default を
     活かす）。（レビュー N-1）
   - **Toast の z-index を Dialog/Modal（zIndex 10000 系）より上に固定**する
     （現行 `z-50` のままでは確認ダイアログの下に潜る）。（レビュー N-2）
   - `packages/ui` の exports に `./providers` を追加、barrel 更新。
   - 新規 UI ロジックは catalog に置く（CLAUDE.md「新規 UI 部品は原則 ui-catalog に吸収」）。
2. **アプリ配線**: `app/providers.tsx` の QueryClientProvider 内側に ToastProvider を追加。
3. **ルート境界ファイル**（`global-error.tsx` / `error.tsx` は `reset()` を持つため
   **`"use client"` を明記**。`global-error.tsx` は `<html>/<body>` を自前で描画する）（レビュー N-3）
   - `app/global-error.tsx`: 素の Tailwind のみで描画（root layout が死んだ状態で呼ばれる
     ため、テーマ atom / catalog に依存しない）。`error.digest` をエラー ID として表示 + 再試行。
   - `app/error.tsx`: シェル内エラー境界。メッセージ + 「再試行」(`reset()`) + ダッシュボードへ戻る。
   - `app/not-found.tsx`: 404。トップへ戻るリンク。
   - `loading.tsx`: `(admin)/`・`dashboard/`・`surveys/`・`schedule/` に catalog `Spinner` の
     中央表示を配置（クライアントページ主体のため効果は遷移時のみ＝小さいが安価）。
4. **削除確認ダイアログ**（3 箇所）
   - `useConfirm` + `ConfirmDialog`（`type="danger"`・確認文言に対象名を含める。
     例: 「設問『◯◯』を削除しますか？」）。mutation は onConfirm 内で発火。
5. **成功/失敗トースト**
   - 保存系: SurveyForm / UserForm（作成・更新）/ AnswerForm / InterviewForm →
     `showToast("保存しました", { type: "success" })` を遷移直前に発火（Provider が遷移をまたぐ）。
   - InterviewForm の緑テキスト成功表示はトーストに置き換えて撤去。
   - 削除・アップロード系: QuestionsEditor / PublicationsEditor / AttachmentsPanel の
     mutation 成功/失敗に success / error トースト（error は自動クローズしない既存仕様のまま）。
   - 既存のフィールド単位エラー表示（valibot + fieldErrorsOf）は変更しない。

## 検証

- `pnpm -r typecheck` / `pnpm lint` / `pnpm --filter @waoon/web test`
- `pnpm --filter @ui-catalog/core lint`（root `pnpm lint` は web のみのため個別実行。レビュー N-4）
  - **残課題**: packages/ui には lint script はあるが eslint 本体が devDependencies に無く実行不能
    （ベンダリング時からの既存状態）。eslint 導入は別タスクとする
- 手動確認（dev compose 起動）:
  - [ ] 保存成功トーストが**遷移後の画面で**表示される（SurveyForm → 一覧）
  - [ ] 失敗（error）トーストが**自動で閉じない**（レビュー N-1）
  - [ ] 設問/掲載/添付の削除で ConfirmDialog が出て、キャンセルで何も起きない
  - [ ] 存在しない URL で not-found 画面が出る
  - [ ] ページ内で throw させると error.tsx（シェル維持 + 再試行）が出る
  - [ ] login など BARE_PATHS でもエラー境界が機能する

## リスク

| リスク | 対応 |
|---|---|
| Toast と Modal の重なり（portal / z-index 競合） | Toast は `createPortal` で body 直下。z-index を Modal より上に固定し手動確認 |
| global-error がテーマ/catalog に依存すると root 崩壊時に共倒れ | 素の Tailwind のみで実装（依存ゼロを lint 的に担保はせずレビューで確認） |
| ConfirmDialog に focus-trap が無い（テーマ2 未着手のため） | 本 Plan では既知の制約として受容。テーマ2 で catalog 側を堅牢化 |
| 成功トーストの出し忘れ・文言不統一 | 文言を「保存しました / 削除しました / アップロードしました」の 3 種に統一し、Plan にリスト化した箇所のみ対応 |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | UI/UX 改善はテーマ1（フィードバック基盤）から着手 | ユーザー選択。既存 catalog 部品の配線が中心で工数小・High 3 件解消 |
| 2026-07-05 | Toast はコンポーネントローカルでなく app Provider 方式 | 保存成功後に `router.push` するフォームではローカル Toast が遷移で消えるため |
| 2026-07-05 | ToastProvider は catalog（packages/ui）側に置く | 「新規 UI 部品は原則 ui-catalog に吸収」方針。アプリ固有依存なしで実装可能 |
| 2026-07-05 | 計画レビュー APPROVE（[Review](../reviews/2026-07-05-0115-ui-feedback-foundation-review.md)）。NICE-TO-HAVE N-1〜N-4 を実装計画・検証に反映 | duration の default 委譲 / Toast z-index / "use client" 明記 / ui package lint 追加 |
| 2026-07-05 | N-4 の ui package lint は実行不能と判明（eslint 未導入）。残課題化し typecheck で代替 | packages/ui は typecheck のみ CI 対象。eslint 導入は別タスク |
| 2026-07-05 | コードレビュー APPROVE（[Review](../reviews/2026-07-05-0210-ui-feedback-foundation-code-review.md)）。NICE-TO-HAVE（添付の失敗時 error トースト欠落）を反映済み | AttachmentsPanel の catch で inline error に加え error トーストも表示（Plan 文言と一致させた） |
| 2026-07-05 | develop が大幅前進（#50〜#63）していたため rebase で追従。QuestionsEditor は設問マスタ化で「削除」が「外す」（リンク解除）に変わっており、確認ダイアログ/トースト文言を「外す」意味論に適応（`外しました`）。providers.tsx は RouterProvider と共存 | 統一 3 文言の例外。マスタは残るのに「削除しました」と出すのは誤誘導のため |
| 2026-07-05 | 残課題だった ui package lint は #50 で eslint 整備済みと判明。rebase 後は `pnpm lint`（turbo）で web + ui 両方 green | 残課題クローズ |

## ステータス

- [x] Plan 承認（計画レビュー APPROVE 2026-07-05）
- [x] 実装完了（typecheck / web lint / test 69 / build すべて green）
- [x] コードレビュー完了（APPROVE 2026-07-05・NICE-TO-HAVE 反映済み）
- [ ] PR 作成・merge
- [ ] マージ後検証（手動確認チェックを消化）
