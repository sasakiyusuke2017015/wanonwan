# Plan: カタログ堅牢化（MarkdownPreview XSS 修正 + モーダルの focus-trap / ARIA）


| 項目 | 値 |
|---|---|
| 概要 | UI/UX 改善テーマ2。MarkdownPreview の無サニタイズ `dangerouslySetInnerHTML` を DOMPurify で封じ（アプリ未使用の潜在 XSS を catalog 層で無効化）、Modal/Dialog/EventModal に focus-trap + `role="dialog"`/`aria-modal` を付与。ConfirmDialog/AlertDialog はラッパのため自動で恩恵 |
| ステータス | 🟢 マージ済み（検証中） |
| PR | [#66](https://github.com/sasakiyusuke2017015/wanonwan/pull/66) |
| Review | [計画レビュー](../reviews/2026-07-05-0840-ui-catalog-hardening-review.md) / [コードレビュー](../reviews/2026-07-05-0904-ui-catalog-hardening-code-review.md) |

## 目的

UI/UX 改善テーマ2。catalog（`@ui-catalog/core`）に残る **セキュリティ 1 件 + アクセシビリティ 1 群** を塞ぐ。

- **XSS（潜在）**: [MarkdownPreview](../../packages/ui/core/organisms/MarkdownPreview/MarkdownPreview.tsx)
  が `marked.parse()` の結果を**サニタイズせず** `dangerouslySetInnerHTML` に渡している
  （JSDoc にも「危険な HTML の除去は行わない」と明記）。`<script>` / `on*` ハンドラが素通り。
  **現時点で apps/web からの利用は 0 件**のため即時の攻撃面は無いが、catalog は将来の
  アンケート説明文・面談メモ等で使われる想定の共有部品であり、「使った瞬間に stored XSS」
  という時限爆弾を catalog 層で無効化しておく。
- **モーダルの a11y 欠落**: [Modal](../../packages/ui/core/organisms/Modal/Modal.tsx) /
  [Dialog](../../packages/ui/core/organisms/Dialog/Dialog.tsx)（= ConfirmDialog / AlertDialog の実体）/
  [EventModal](../../packages/ui/core/organisms/EventModal/) に
  **フォーカストラップ・初期フォーカス・閉じた後のフォーカス復帰・`role="dialog"`・`aria-modal` が無い**。
  Dialog はバックドロップに `role="button" tabIndex={-1}` という不自然な role が付いている
  （[Dialog.tsx:162](../../packages/ui/core/organisms/Dialog/Dialog.tsx#L162)）。
  キーボード / スクリーンリーダー利用者はモーダルの背後にフォーカスが抜ける。
  テーマ1 で ConfirmDialog の利用箇所が増えた（設問・掲載・添付の削除確認）ため、影響が拡大している。

### アプリでの利用箇所（対象の実害範囲）

| organism | apps/web での利用 |
|---|---|
| Modal | [ThemeSettingsModal](../../apps/web/components/layout/ThemeSettingsModal.tsx) |
| Dialog（ConfirmDialog 経由） | QuestionsEditor / PublicationsEditor / AttachmentsPanel（テーマ1 で導入） |
| EventModal | [ScheduleCalendar](../../apps/web/components/schedule/ScheduleCalendar.tsx) |
| MarkdownPreview | （現状 0 件・潜在） |

### 非目標（このテーマではやらない）

- DropdownMenu / ContextMenu / EventPopover 等、非モーダル系ポップアップのキーボード対応（別テーマ）
- InteractiveTable のキーボードナビ（テーマ3「一覧 UX」）
- ダークモード・テーマ非追従色（テーマ5）
- MarkdownEditor 本体の堅牢化（Preview と違い出力を直接 innerHTML しない限り対象外。確認のみ）

## 現状コンテキスト

- 参考実装: ai_edu フォークが同一祖先の catalog に対して**同じ修正を実装済み**
  （`isomorphic-dompurify@^2` + `focus-trap-react@^11`、React 19 で稼働実績あり）。
  - MarkdownPreview: `DOMPurify.sanitize(raw)` を通してから描画。エラー時フォールバック文字列も sanitize。
  - Dialog / Modal / EventModal: `<FocusTrap>` で包み、`role="dialog"` + `aria-modal` +
    `aria-labelledby / aria-describedby`、`fallbackFocus`、閉じた後の trigger への復帰、
    バックドロップの `role="button"` 削除（クリックで閉じる挙動は維持）。
- wanonwan の catalog は #50 で eslint 整備済み・Storybook + a11y addon あり。
- 依存追加は packages/ui の `dependencies`（`@measured/puck` と同じ扱い。
  peerDependencies にしないのは、利用側 app に導入判断を漏らさないため）。

## スコープ

| 対象 | 変更 |
|---|---|
| `packages/ui/package.json` | `isomorphic-dompurify@^2` / `focus-trap-react@^11` を dependencies に追加 |
| `core/organisms/MarkdownPreview/MarkdownPreview.tsx` | `DOMPurify.sanitize()` を通す。JSDoc の「信頼できる入力にのみ利用する」制約を撤去 |
| `core/organisms/Dialog/Dialog.tsx` | FocusTrap + `role="dialog"` + `aria-modal` + `aria-labelledby/describedby`。バックドロップの `role="button"` / `aria-label` を削除（クリック close は維持） |
| `core/organisms/Modal/Modal.tsx` | 同上（`aria-label` は title prop から。無い場合に備え `ariaLabel` prop を検討） |
| `core/organisms/EventModal/` | 同上 |

ConfirmDialog / AlertDialog は Dialog の薄いラッパのため自動的に恩恵を受ける（変更不要見込み）。

## 実装計画

1. **依存追加**: packages/ui に `isomorphic-dompurify` / `focus-trap-react` を追加（`pnpm add --filter @ui-catalog/core`）。
2. **MarkdownPreview の sanitize**（フォーク実装を参考に移植）:
   - `marked.parse()` の出力と、catch 節のエラーフォールバック HTML の両方を `DOMPurify.sanitize()` に通す。
   - JSDoc を「DOMPurify でサニタイズしてから描画する」に更新。
3. **Dialog の focus-trap + ARIA**:
   - パネルを `<FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true, fallbackFocus: ... }}>` で包む
     （バックドロップクリックで閉じる既存挙動と Esc を壊さない設定を明記）。
   - パネルに `role="dialog"` `aria-modal="true"`、title があれば `aria-labelledby`、message に `aria-describedby`。
   - バックドロップから `role="button"` / `tabIndex` / `aria-label` を削除（onClick は維持）。
   - 閉じたら FocusTrap の `returnFocusOnDeactivate`（default）で trigger に復帰。
   - **初期フォーカスの component 別方針**（レビュー N-2）:
     - ConfirmDialog（confirm variant）= キャンセルボタン（破壊的操作の誤確定防止）
     - AlertDialog（alert variant）= 閉じる / OK ボタン
     - Modal = 閉じるボタン（無ければ `fallbackFocus` = パネル `tabIndex={-1}`）
     - EventModal = 既存のタイトル入力への focus を維持（不可なら閉じるボタン / fallback）
4. **Modal / EventModal に同処置**（構造が違うので個別に適用。既存の Esc / backdrop close は維持）。
5. **確認**: ThemeSettingsModal・削除確認（設問/掲載/添付）・ScheduleCalendar の EventModal を
   キーボードだけで操作（Tab 循環 / Esc / 復帰）。Storybook の a11y addon で該当 stories を目視。

## 検証

- `pnpm -r typecheck` / `pnpm lint`（turbo: web + ui）/ `pnpm --filter @wanonwan/web test` / `pnpm --filter @wanonwan/web build`
- **packages/ui のユニットテスト実行**（レビュー N-1）: `pnpm --filter @ui-catalog/core exec vitest run`
  を検証コマンドに含める。ui の scripts が `test:storybook` しか無いため、`test: "vitest run"` 相当の
  script 追加も本 PR で行う（storybook プロジェクトと分離できる形は実装時に config を見て確定）
- MarkdownPreview: `<img src=x onerror=alert(1)>` / `<script>` を含む source が無害化されること +
  通常の Markdown（見出し・リスト・テーブル）が維持されることをユニットテストで固定
- **実行結果（2026-07-05）**: typecheck 全 green / lint（web+ui）green / web test 69 green / build green /
  MarkdownPreview 新規テスト 5 件 green（フォールバック経路の回帰テスト含む）。
  **ui スイート全体は既存破損あり**（下記残課題）— stash による baseline 比較で、
  本 PR の変更による**新規失敗ゼロ**を確認済み（対象 4 organism のテストは変更前後で同一結果）。
- **残課題（別タスク）**: ベンダリングされた ui テストスイートに既存の失敗が多数
  （`@testing-library/user-event` 未導入 → 本 PR で devDep 追加済み・これで import 失敗の一群は解消 /
  `core/__tests__/helpers` が未ベンダリング（Dialog.test 等が参照）/
  実装と乖離した stale な期待値（Modal.test の maxHeight 等・EventModal.test の保存ボタン disabled））。
  スイート全体の修復は本 PR のスコープ外とし、CI への `ui test` 組み込みは修復後に行う。
- 手動確認（マージ後検証）:
  - [ ] confirm ダイアログを開くと初期フォーカスがキャンセルボタンにある
        （**danger に限らず confirm variant 全般**。コードレビュー LOW 対応の確認観点）
  - [ ] 削除確認ダイアログ表示中、Tab がダイアログ内で循環し背後に抜けない
  - [ ] ダイアログを閉じると開いたボタンにフォーカスが戻る
  - [ ] Esc / バックドロップクリックで閉じる既存挙動が変わらない
  - [ ] ThemeSettingsModal も同様（Tab 循環・復帰）
  - [ ] EventModal 固有（レビュー N-3）: 日付クリックで新規作成 / 既存イベント編集 /
        保存・削除 / Esc・バックドロップ close / タイトル入力への初期フォーカス /
        モバイル表示で Tab 循環が成立
  - [ ] スクリーンリーダー（Windows ナレーター等）でダイアログ表示が通知される

## リスク

| リスク | 対応 |
|---|---|
| FocusTrap 導入で既存の Esc / backdrop close が壊れる | `clickOutsideDeactivates: true` 等の options を明示し、手動確認項目に含める |
| フォーカス可能要素が無いダイアログで focus-trap が throw する | `fallbackFocus` にパネル要素（`tabIndex={-1}`）を指定 |
| EventModal は dnd-kit 等と共存しており trap との干渉があり得る | EventModal だけ切り離して個別確認。問題があれば EventModal のみ別 PR に分離 |
| DOMPurify で正当な Markdown 出力（テーブル等）が削られる | 既定設定は HTML5 標準タグを許可するため通常の marked 出力は影響なし。ユニットテストで代表ケースを固定 |
| catalog 共通変更のため全モーダル利用箇所に波及 | 利用 4 箇所（上表）をすべて手動確認対象にする |

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-07-05 | テーマ2 として XSS 修正と focus-trap を 1 PR に束ねる | どちらも catalog organisms への局所変更で、アプリ側の変更ゼロ。分けるほどの規模でない |
| 2026-07-05 | MarkdownPreview はアプリ未使用だが catalog 層で先に塞ぐ | 使った瞬間に stored XSS になる時限爆弾を、利用開始の判断と切り離して無効化する |
| 2026-07-05 | 依存は peer でなく dependencies に置く | sanitize / focus-trap は部品の内部実装であり、利用側 app に導入判断を委ねる性質のものではない |
| 2026-07-05 | 計画レビュー APPROVE（[Review](../reviews/2026-07-05-0840-ui-catalog-hardening-review.md)）。N-1〜N-3 を反映 | ui の vitest 実行コマンド明記 + test script 追加 / 初期フォーカスの component 別方針 / EventModal 固有の手動確認条件 |
| 2026-07-05 | ui テストスイートに既存破損が多数と判明（N-1 実施時）。`user-event` devDep 追加で import 失敗群のみ本 PR で解消し、スイート全体の修復は残課題化 | baseline 比較（stash）で本 PR の新規失敗ゼロを確認。stale テストの修復は XSS/a11y と無関係のスコープ外作業 |
| 2026-07-05 | Dialog の初期フォーカスは confirm variant 全般でキャンセルボタンに | 計画では danger のみ想定だったが、confirm はすべて「誤確定を防ぐ」性質のため一律に適用（alert は従来通り先頭ボタン） |
| 2026-07-05 | コードレビュー APPROVE（[Review](../reviews/2026-07-05-0904-ui-catalog-hardening-code-review.md)）。NICE-TO-HAVE 2 件を反映 | catch フォールバック経路の専用回帰テスト追加（marked.parse を mock して悪意ある message を注入）/ confirm キャンセル初期フォーカス方針を検証観点に明文化 |
| 2026-07-05 | 本 PR で追加した `packages/ui` の `"test": "vitest run"` を削除し、CI から `ui#test` を除外（`fix/ci-ui-test-exclude`） | CI は `pnpm turbo run typecheck lint build test`。test script を足したことで turbo が既存破損の ui スイート全体を回し、#66 マージ（cdcea98）以降 develop が赤化。本 Plan の方針「CI への `ui test` 組み込みはスイート修復後」と矛盾していたため、script を消して turbo に `ui#test` をスキップさせ緑化（web#test 69 / worker#test のみ実行）。**ui スイート全体の修復＋test script 復活＋CI 組み込みは残課題のまま** |

## ステータス

- [x] Plan 承認（計画レビュー APPROVE 2026-07-05）
- [x] 実装完了（typecheck / lint web+ui / web test 69 / build green・MarkdownPreview テスト 5 件追加）
- [x] コードレビュー完了（APPROVE 2026-07-05・NICE-TO-HAVE 2 件反映済み）
- [x] PR 作成・merge 済み（[#66](https://github.com/sasakiyusuke2017015/wanonwan/pull/66)）
- [ ] マージ後検証（手動確認チェックを消化）
