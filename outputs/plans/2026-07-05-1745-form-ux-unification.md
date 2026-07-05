# Plan: フォーム UX 統一（テーマ4）

> ステータス: 🟡 実装中（PR-A merged / PR-B 実装完了・コードレビュー代行 APPROVE 相当・提出。PR-C〜D 残り）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-07-05 17:45 JST（計画レビュー反映: 18:15） |
| 担当 | Claude Code + 笹木さん |
| ブランチ | PR-A: `feature/form-feedback-unify` / PR-B: `feature/form-unsaved-guard` / PR-C: `feature/form-catalog-adoption` / PR-D: `feature/auth-form-unify`（予定・TBD） |
| 関連 PR | TBD |
| レビュー | [計画レビュー](../reviews/2026-07-05-1810-form-ux-unification-review.md): NEEDS WORK → 反映済み（エージェント代行 planner + architect） |
| 前提 | テーマ1（Toast/ConfirmDialog 配線・PR #64）・テーマ3（DataTable 一本化・#70）マージ済み。`useAppToast` / `ConfirmDialog` / `FormActions` / `fieldErrorsOf` が既存資産として使える |

## 目的

UI/UX 改善テーマ4「フォーム UX 統一」。監査（2026-07-05 チャット内）で挙がったフォーム系ギャップを、既存カタログ資産へ寄せて解消する。3 本柱:

1. **未保存変更の離脱警告（新規・目玉）** — リポジトリ全体で dirty 追跡・`beforeunload`・離脱ガードが**完全に不在**。編集途中の離脱でデータが黙って消える。
2. **成功/エラーフィードバックの統一** — テーマ1 で一部フォームに保存トーストが入ったが、`MasterForm` / 設問マスタ単体ページは未導入。成功後遷移が 3 パターン混在、エラー表示が「フォーム=インライン / エディタ=トースト」で分裂。
3. **生 UI フォームのカタログ化** — `QuestionForm`（完全に生 UI）・`PublicationForm`・認証ページ（`login` デスクトップ）・`QuestionsEditor`/`AttachmentsPanel` の生 `<select>`/`<button>` が catalog 部品を通っていない。

## 非目標（このテーマではやらない）

- **react-hook-form 等のフォームライブラリ導入**（現行の `useState` + valibot 方式を維持）。
- **バリデーション schema の全面統一**。特に `InterviewForm` の field error UI 欠落は**本テーマでは対応せず別 Plan**（既にカタログ化済みで PR-C の対象外・valibot schema 新設は影響大）。`QuestionForm` の valibot 化はカタログ化の副産物の範囲に留める。
- **新規入力 atom の新設**（`RadioGroup` 等は既存 `Radio` / `PillSelect` / `Segment` で対応）。
- **AnswerForm の回答体験そのものの刷新**（レイアウト/操作フローは維持。生 input → catalog `Radio`/`Checkbox` の差し替えまで）。
- 削除機能そのものの新設（テーマ1 の非目標を踏襲）。
- **遷移ガードの catalog への配置**（下記 §catalog/app 境界。Next 固有の遷移傍受は apps 層に置く）。

## 現状コンテキスト

調査（2026-07-05・Explore 3 並列）で確定した gap マトリクス。✅=統一済 / ⚠️=部分 / ❌=欠落。

| フォーム | カタログ化 | 成功フィードバック | 未保存警告 | バリデーション | 送信中UX |
|---|---|---|---|---|---|
| [SurveyForm](../../apps/web/components/admin/SurveyForm.tsx) | ✅ | ✅ toast+push+refresh（基準形）| ❌ | ✅ valibot+FormField | ✅ isPending |
| [UserForm](../../apps/web/components/admin/UserForm.tsx) | ✅ | ⚠️ 新規は非遷移で初期PWインライン | ❌ | ✅ valibot | ✅ |
| [InterviewForm](../../apps/web/components/admin/InterviewForm.tsx) | ✅ | ⚠️ refreshのみ留まる | ❌ | ❌ 検証なし・field error UI 無（別 Plan）| ✅ busy |
| [MasterForm](../../apps/web/components/admin/MasterForm.tsx) | ✅ | ❌ **toast欠落**（push+refreshのみ）| ❌ | ✅ valibot | ✅ |
| [AnswerForm](../../apps/web/components/survey/AnswerForm.tsx) | ⚠️ radio/checkbox が生 input タイル | ✅ toast+push | ❌ | ⚠️ requiredFieldErrors（動的）| ✅ |
| [QuestionForm](../../apps/web/components/admin/QuestionForm.tsx) | ❌ **完全に生 UI**・FormActions 非使用 | ❌ 呼出側依存（マスタ単体は toast 無）| ❌ | ❌ HTML required のみ | ⚠️ 生 button・"..." 表現 |
| [PublicationsEditor](../../apps/web/components/admin/PublicationsEditor.tsx)（内部 PublicationForm）| ❌ **生 input/select/datetime-local** | ⚠️ 削除は toast・保存導線は生 | ❌ | ❌ API 任せ | ⚠️ 生 button |
| [login](../../apps/web/app/login/page.tsx) | ⚠️ 入力欄は catalog・**デスクトップ 2 カラムは生 Tailwind**・**テーマ非追従** | 遷移のみ | N/A | HTML required | ✅ LoginButton |
| [change-password](../../apps/web/app/change-password/page.tsx) | ⚠️ 入力欄 catalog・**カード外殻が生 div** | 遷移のみ（成功 toast 無）| N/A | 手書き手続き的 | ✅ Button |

### 既存資産（使うだけで済む）

- 入力: `Input` / `TextArea` / `Select` / `Checkbox` / `Radio` / `Switch`
- 構造: [`FormField`](../../packages/ui/core/molecules/FormField/FormField.tsx) / [`AuthFormCard`](../../packages/ui/core/organisms/AuthFormCard/AuthFormCard.tsx) / `LoginButton` / `PasswordValidation`
- ボタン: `Button`（`loading`/`disabled`/`variant`/`borderRadius`）+ アプリ [`FormActions`](../../apps/web/components/admin/FormActions.tsx)
- フィードバック: [`ToastProvider` / `useAppToast`](../../packages/ui/core/providers/ToastProvider.tsx)・`ConfirmDialog` / `useConfirm`
- 検証: [`fieldErrorsOf` / `requiredFieldErrors`](../../apps/web/lib/forms/field-errors.ts)（valibot 連携）
- **submit payload ビルダー**: `buildPayload()`（各フォーム）/ `questionDraftToPayload()`（QuestionForm）— **dirty 判定のベースライン比較に流用する**

### 新規追加が要るもの（計画レビューで設計確定）

未保存離脱ガードは、catalog にもアプリにも 0 件。**catalog/app で境界を分ける**:

- **catalog `packages/ui/core/hooks/ui/useUnsavedGuard`**（新設）: `useUnsavedGuard({ when: isDirty })`。**`beforeunload`（タブ閉じ/リロード）+ dirty 判定ヘルパのみ**。`window` API のみでフレームワーク非依存（SSR は effect 内アクセスで安全）。catalog の `RouterAdapter` 抽象を壊さない。
- **apps/web `NavigationGuardProvider` + `useGuardedNavigate()`**（新設・Next 依存）: dirty レジストリを参照し、dirty なら `await confirm()`（ConfirmDialog 実体を Provider が所有）→ 確定時のみ実 `router.push`。プログラム遷移の choke point を一本化する。

### アプリ内遷移の実態（設計の前提・計画レビューで判明）

主要遷移は `<Link>` ではなく **`router.push`/`router.replace`（プログラム遷移）**。`Link onNavigate` だけでは捕捉できない:

- サイドナビ [`AppSideNav.tsx:59`](../../apps/web/components/layout/AppSideNav.tsx#L59) / 下部タブ [`AppLayout.tsx:193`](../../apps/web/components/layout/AppLayout.tsx#L193) / ヘッダメニュー [`HeaderUserMenu.tsx:27,59`](../../apps/web/components/layout/HeaderUserMenu.tsx#L27) / 行クリック（`MasterListView`・`AdminListTable.onRowClick`）/ 各フォームの cancel・success 遷移
- 素の `<Link>`（パンくず等）は少数
- **popstate（ブラウザ戻る/進む）** も要考慮

## スコープ（4 PR 構成・計画レビューで再分割）

膨らんだ未保存ガードを独立 PR に切り出し、低リスクのフィードバック統一を先行させる。**1 ブランチ = 1 PR** を直列で回す。

### PR-A: フィードバック統一（`feature/form-feedback-unify`・低リスク先行）

| 対象 | 変更 |
|---|---|
| `MasterForm` / 設問マスタ単体ページ（`app/(admin)/admin/questions/new`・`[id]/edit`）| `useAppToast().showToast("保存しました", {type:"success"})` を追加 |
| 全業務フォーム | 成功後遷移の型をルール化（push+refresh を基準・同一画面編集は refresh のみを許容） |
| エラー表示 | **使い分けを明文化**: フォームの submit/バリデーションエラーは**フォーム内インライン**、非同期の行アクション（削除・リンク等）は **error トースト** |

### PR-B: 未保存離脱ガード基盤（`feature/form-unsaved-guard`・目玉・独立）

| 対象 | 変更 |
|---|---|
| catalog `packages/ui/core/hooks/ui/useUnsavedGuard`（新設）| `beforeunload` + dirty 判定ヘルパ（フレームワーク非依存）。Storybook 不要・vitest で単体検証 |
| apps `NavigationGuardProvider` / `useGuardedNavigate`（新設）| dirty レジストリ + `await confirm()` + 実 push。`app/providers.tsx` に配線 |
| ナビ 3 コンポーネント（`AppSideNav` / `AppLayout` 下部タブ / `HeaderUserMenu`）+ 行クリック導線 | 生 `router.push`/`router.replace` を `useGuardedNavigate()` へ移行（choke point 集約）|
| 素の `<Link>`（パンくず等）| Next 16 `onNavigate` で `preventDefault` → 同じ confirm フローに合流 |
| popstate（戻る/進む）| dirty 中に `history.pushState` ダミー + `popstate` で confirm → キャンセル時は再 push で押し戻す |
| 各業務フォーム（下表）| dirty 判定（`buildPayload()` 流用 + 安定 stringify・配列対応）+ ガード配線。**保存成功時に dirty ベースラインをリセットしてから遷移**（ガード暴発防止）+ dirty のままキャンセル押下時も confirm |

**ガード配線対象フォーム（明確化）**:

| フォーム | dirty ガード | 備考 |
|---|---|---|
| SurveyForm / UserForm / InterviewForm / MasterForm | ✅ | admin 編集フォーム |
| QuestionForm / PublicationForm | ✅ | PR-B では**生 UI のまま配線**（UI 差し替えは PR-C で挙動不変に）|
| AnswerForm | ✅（要判断: `beforeunload` のみ or 遷移ガードも）| 回答者向け公開ページ。回答途中離脱の警告価値は高い |
| login / change-password | ❌ N/A | 認証フォームは離脱警告の対象外 |

### PR-C: 生 UI フォームのカタログ化（`feature/form-catalog-adoption`）

| 対象 | 変更 |
|---|---|
| `QuestionForm.tsx` | 生 input/select/textarea → `FormField`+`Input`+`Select`+`TextArea`、生 button → `FormActions`、API 任せ検証 → `fieldErrorsOf`（設問 schema があれば流用・無ければ最小追加）。**PR-B で入れた dirty 配線は挙動不変で維持** |
| `PublicationsEditor.tsx`（内部 `PublicationForm`）| 生 input/select/datetime-local → catalog、生 button → `FormActions` |
| `QuestionsEditor.tsx` / `AttachmentsPanel.tsx` | 「マスタから追加」の生 `<select>`・並べ替え/file の生 `<button>` を catalog へ |
| `AnswerForm.tsx` | radio/checkbox の生 input タイルを catalog `Radio`/`Checkbox` へ差し替え（レイアウト/操作は維持）|

### PR-D: 認証ページ統一（`feature/auth-form-unify`）

| 対象 | 変更 |
|---|---|
| `login/page.tsx` | デスクトップ 2 カラムの生 Tailwind を整理し外殻を `AuthFormCard` 系へ統一。`useTheme` でテーマ追従。見出し/説明の様式統一 |
| `change-password/page.tsx` | カード外殻を `AuthFormCard` へ寄せ `login` と統一。成功時 `useAppToast` |
| 送信ボタン | `LoginButton` と汎用 `Button` の使い分けを整理・文書化 |

## 実装計画

1. **PR-A**（低リスク先行）: トースト追加 + エラー使い分け明文化 + 成功後遷移ルール化。
2. **PR-B**（目玉）: catalog `useUnsavedGuard` → apps `NavigationGuardProvider`/`useGuardedNavigate` → ナビ 3 + Link + popstate 配線 → 各フォーム dirty 配線 + 成功時リセット → 手動確認を厚めに。
3. **PR-C**: `QuestionForm` → catalog + `fieldErrorsOf`（効果大）→ `PublicationForm` → 生 select/button → AnswerForm radio/checkbox。
4. **PR-D**: 認証ページのカード外殻統一 + login テーマ追従 + 成功トースト。
5. 各 PR: `pnpm turbo run typecheck lint build` + `pnpm --filter @waoon/web test`。catalog 新フックは vitest（テーマ2 の ui スイート既存破損に触れない独立ファイルで）。

## 検証（マージ後の手動確認 = 各 PR 末尾）

PR-B:
- [ ] 編集して未保存のままタブを閉じる/リロードで `beforeunload` 警告が出る
- [ ] 編集して未保存のまま**サイドナビ/下部タブ/ヘッダメニュー**で離脱しようとすると確認ダイアログが出る（プログラム遷移も捕捉）
- [ ] **ブラウザの戻る**でも確認ダイアログが出る（popstate）
- [ ] 素の `<Link>`（パンくず等）でも確認が出る
- [ ] **保存成功時は確認が暴発せず**、そのまま一覧へ遷移する（dirty リセット）
- [ ] dirty のままキャンセル押下で確認が出る

PR-A / C / D:
- [ ] 保存成功で「保存しました」トーストが全フォームで出る（Master・設問マスタ単体含む）
- [ ] 保存失敗時のエラーが統一様式（フォーム=インライン / 行アクション=トースト）で出る
- [ ] `QuestionForm` / `PublicationForm` が catalog 見た目・テーマ追従・送信中 UX で他フォームと揃う（挙動不変）
- [ ] AnswerForm の radio/checkbox が catalog 化されても回答フローが退行しない
- [ ] login がテーマ切替に追従し、change-password と外殻が揃う
- [ ] 二重送信防止（送信中ボタン disabled）が退行していない

## リスク

| リスク | 対応 |
|---|---|
| **App Router に公式の遷移ブロック API が無い**（計画レビュー BLOCKER）| `NavigationGuardProvider` + `useGuardedNavigate` でプログラム遷移を choke point 集約し、`Link onNavigate` + `popstate` を併用。ナビ 3 コンポーネントの移行を PR-B スコープに明記済み |
| dirty 判定の実装がフォームごとにバラバラ（`useState draft` が 6 種）| submit 用 `buildPayload()`/`questionDraftToPayload()` をベースラインに流用し安定 stringify で比較。`AnswerForm` の `string[]` は配列対応。参照等価は使わない |
| catalog 新フックが既存破損 ui テストスイートの巻き添え（テーマ2 残課題）| 新規テストは独立ファイル。既存スイートに触れない |
| 遷移ガードを catalog に置くと RouterAdapter 抽象を壊す | catalog は `beforeunload` + dirty 判定のみ。Next 依存の遷移傍受は apps 層に置く（§非目標） |
| `QuestionForm` を PR-B（配線）と PR-C（カタログ化）で 2 度触る | dirty はドラフト state 側で UI 差し替えと直交。PR-C は「挙動不変で UI のみ差し替え」と明記 |
| `QuestionForm` は設問マスタ + アンケート編集の 2 経路で再利用（`EMPTY_QUESTION`/`questionDraftToPayload` を export）| 両呼び出し元の挙動不変を手動確認に含める |
| 保存成功遷移がガードに暴発 | 成功時に dirty ベースラインをリセットしてから遷移（PR-B 実装計画に明記）|

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | テーマ4 を PR 分割（当初 3 PR）| 対象フォーム 9 本 + catalog 新フックで 1 PR は過大。テーマ1〜3 と同じ直列運用 |
| 2026-07-05 | フォームライブラリ（react-hook-form）は導入しない | 現行 `useState`+valibot で全フォームが動作。dirty 判定は薄いスナップショット比較で足りる |
| 2026-07-05 | 未保存警告は **`beforeunload` + アプリ内遷移ガード**を採用（笹木さん選択）| ロードマップの狙い（サイドナビ等での離脱防止）を満たすため |
| 2026-07-05 | エラーは **使い分けを明文化**（フォーム submit=インライン / 非同期行アクション=トースト）（笹木さん選択）| 現状の妥当な使い分けをルール化 |
| 2026-07-05 | AnswerForm の radio/checkbox を catalog `Radio`/`Checkbox` にカタログ化（笹木さん選択）| 一本化の完全性。レイアウト/操作は維持し体験は変えない |
| 2026-07-05 | **計画レビュー NEEDS WORK を反映**: 遷移ガード方式を「`Link onNavigate` 傍受」→「`NavigationGuardProvider` + `useGuardedNavigate`（プログラム遷移集約）+ `Link onNavigate` + `popstate`」へ変更 | 主要遷移が `router.push`（プログラム）で `onNavigate` は発火せず、当初方式ではサイドナビ離脱を素通りする（planner + architect が独立に BLOCKER 指摘）|
| 2026-07-05 | 遷移ガードの **catalog/app 境界を分割**: catalog=`beforeunload`+dirty 判定のみ / apps=Next 依存の遷移傍受 | catalog の `RouterAdapter`（フレームワーク非依存）抽象を壊さない。テーマ3 の「共通挙動は catalog へ」はルーティング依存には適用しない |
| 2026-07-05 | dirty ベースラインは既存 submit payload ビルダーを流用 | 正規化済みの同一形状を安定 stringify で比較でき落とし穴が少ない |
| 2026-07-05 | **3 PR → 4 PR に再分割**: 膨らんだ未保存ガードを独立 PR-B に切り出し、低リスクのフィードバック統一（PR-A）を先行 | 計画レビューで PR-A が過小（ナビ移行が抜け）と判明。高リスクのガードを隔離し、トースト追加は独立で先に入れられる |
| 2026-07-05 | `InterviewForm` の field error UI 欠落は本テーマ対象外（別 Plan）| 既にカタログ化済みで PR-C の対象に入らず、valibot schema 新設は影響大 |
| 2026-07-05 | PR-B 実装: catalog `useUnsavedGuard`（beforeunload）+ apps `NavigationGuardProvider`/`useGuardedNavigate`/`useUnsavedChangesGuard` + `isDirtyPayload`。シェルナビ + 7 フォーム配線 | 計画レビューの設計どおり。dirty はフォーム state の安定 stringify 比較・成功時 baseline リセット |
| 2026-07-05 | ConfirmDialog を `@ui-catalog/core/organisms/ConfirmDialog` の narrow import に変更（バレル回避）+ 同サブパスを package.json exports に追加 | root providers に入るため静的プリレンダ経路に乗り、バレル `@ui-catalog/core/organisms` 経由だと window を触る兄弟モジュールで build が `window is not defined` になったため |
| 2026-07-05 | PR-B コードレビュー（代行 code-reviewer + architect）で **BLOCKER 2 件を反映**（[Review](../reviews/2026-07-05-1852-form-ux-unification-review.md)）| (1) パンくず「ホーム」が catalog Breadcrumb の素の SPA Link で未ガード → アプリ層でガード付き描画に置換。(2) popstate 確認中の多重 back で resolver 上書き・すり抜け → in-flight Promise 再利用 + 確認中フラグ |

## ステータス

- [x] 要ユーザー判断 4 点の確定（2026-07-05）
- [x] 計画レビュー（エージェント代行・NEEDS WORK）→ BLOCKER + NICE-TO-HAVE を Plan に反映（2026-07-05・[Review](../reviews/2026-07-05-1810-form-ux-unification-review.md)）
- [x] Plan 再確認・承認（PR 数 3→4 の変更含む・笹木さん承認 2026-07-05）
- [x] PR-A 実装完了（保存トースト 3 箇所）→ [#71](https://github.com/sasakiyusuke2017015/waoon/pull/71) merged
- [x] PR-B 実装完了（未保存ガード基盤・7 フォーム配線・typecheck/lint/build/test green・web test 71）
- [x] PR-B コードレビュー（代行 code-reviewer + architect・BLOCKER 2 件反映・[Review](../reviews/2026-07-05-1852-form-ux-unification-review.md)）→ 提出
- [ ] PR-B merge（笹木さん承認）
- [ ] PR-C 実装・レビュー・merge
- [ ] PR-D 実装・レビュー・merge
- [ ] マージ後検証（手動確認チェックを消化）
