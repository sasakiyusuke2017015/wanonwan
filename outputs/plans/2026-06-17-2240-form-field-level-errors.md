# フォームのフィールド単位 valibot エラー表示

> ステータス: 🟡 実装中（Phase 1〜3 実装済み・全フォーム対応完了 / PR レビュー待ち）
> 由来: [Status Dashboard「次セッションの起点」#2 見た目の磨き込み](../README.md) の「フォームのフィールド単位 valibot エラー表示」。

| 項目 | 値 |
|---|---|
| 一次情報 | [FormField (error prop 既存)](../../packages/ui/core/molecules/FormField/FormField.tsx) / [domain schemas](../../packages/domain/src/user.ts) / [UserForm](../../apps/web/components/admin/UserForm.tsx) |
| 関連 Review | （未） |
| 関連 PR | （未） |

---

## 1. 目的 / 非目的

### 目的

フォーム送信時、入力エラーを**フィールドごと**に該当 `FormField` の下へ表示する。現状は手書きの集約バリデーション（「コード・名前・メールは必須です」を画面下部に 1 つ）で、どの項目がダメか分からない。domain の valibot スキーマをクライアントで使い、フィールド単位の日本語メッセージを出す。

### 非目的

- サーバ `parseBody` の 400 を field 単位に変える（現状は汎用 `{ error }`。クライアント検証で UX を満たすため今回サーバは不変。サーバ side の issue 返却は別タスク）。
- 新規バリデーションルールの追加（既存スキーマの制約を表示するだけ。新ルールは別）。
- リアルタイム（onChange 毎）検証（今回は **submit 時**に検証。逐次検証は後続で検討可）。

## 2. 現状コンテキスト（調査結果）

- `FormField`（[packages/ui/core/molecules/FormField](../../packages/ui/core/molecules/FormField/FormField.tsx)）は **`error?: string` prop 実装済み**（赤枠 + エラーテキスト描画）。フォームが渡していないだけ。
- 対象フォーム（apps/web/components）:
  - `admin/UserForm.tsx` — 手書き必須チェック → 下部に 1 メッセージ
  - `admin/SurveyForm.tsx` / `admin/InterviewForm.tsx`
  - `survey/AnswerForm.tsx` — 設問駆動の動的フォーム（構造が他と異なる）
- domain スキーマ（[packages/domain/src](../../packages/domain/src)）: `CreateUserSchema`（`minLength(1)`/`email()`）等。**日本語メッセージ未設定**（valibot 既定は英語）。
- `v.safeParse` / `v.flatten` 利用可（valibot ^1.4.1）。`flatten(issues).nested` が `{ "code": ["msg"], ... }` を返す。
- サーバ `parseBody` は `v.parse` を try/catch し issues を捨てて汎用 400 を返す → domain にメッセージ追加してもサーバ挙動不変。

## 3. 実装ステップ

### Phase 1 — 共通ヘルパ + domain メッセージ + UserForm（パターン確立）

1. **domain スキーマに日本語メッセージ付与**（[packages/domain/src/user.ts](../../packages/domain/src/user.ts) 他、表示対象のフィールド）。例: `v.pipe(v.string(), v.minLength(1, "ユーザーコードは必須です"))`、`v.email("メールアドレスの形式が不正です")`。
2. **クライアント共通ヘルパ** `apps/web/lib/forms/field-errors.ts` を新設:
   - `fieldErrorsOf<S>(schema: S, value: unknown): Record<string, string>` — `v.safeParse` → 失敗時 `v.flatten(result.issues).nested` を「フィールド→先頭メッセージ」に圧縮。
   - unit test（vitest）: 必須欠落・email 不正で該当キーにメッセージが入る / 妥当な値で空。
3. **UserForm 改修**:
   - `fieldErrors` state（`Record<string,string>`）を追加。submit 時に `fieldErrorsOf(userId ? UpdateUserSchema : CreateUserSchema, payload)` を実行。
   - エラーがあれば各 `FormField` に `error={fieldErrors.code}` 等を渡し、送信を中断。
   - 既存の手書き必須チェック（集約メッセージ）は撤去。API エラー（保存失敗等）の集約 `error` 表示は残す（フィールド検証とは別レイヤ）。

### Phase 2 — SurveyForm（InterviewForm は対象外）

4. 同じパターンを SurveyForm に適用（`CreateSurveySchema`/`UpdateSurveySchema`、title が必須）。
   - **InterviewForm は対象外**: `RecordInterviewSchema` は全フィールド `optional/nullable`（必須・制約なし）でフィールド検証エラーが出ない＝配線しても no-op。よって今回は触らない。

### Phase 3 — AnswerForm（動的フォーム）

5. 設問駆動で構造が違うため、設問 ID 単位のエラーマップに合わせて適用（必要なら helper を配列/動的キー対応に拡張）。スコープが重い場合は別 PR / 別 Plan に切り出す。

## 4. 検証

- `pnpm --filter @waoon/web test` green（helper unit test 追加）。
- `pnpm -r typecheck` green。
- 手動確認（Docker 起動不要の範囲）: 各フォームで空 submit → 該当フィールド下に日本語エラー、妥当入力でエラー消失。
  - ※実 API 保存まで通す確認は Docker 起動が要るため範囲外（フィールド検証はクライアント完結なので起動なしで目視可能なら可）。

## 5. リスクと緩和

| リスク | 影響 | 緩和 |
|---|---|---|
| クライアント form（string）と schema（number 等）の型ズレ | 検証が誤判定 | 送信用 payload（Number 変換後）を検証対象にする。UserForm は既存の payload 構築をそのまま使う |
| domain メッセージ追加が他参照（サーバ/テスト）に影響 | 予期せぬ drift | parseBody は issues を捨てるためサーバ挙動不変。既存 domain テストがメッセージに依存していないか確認 |
| AnswerForm の動的構造で helper が合わない | Phase 3 肥大 | Phase 3 を独立 PR 化できる構成に。helper は静的スキーマ用と割り切り、動的は薄く拡張 |
| flatten のキーがネスト/配列で素直に取れない | マップ漏れ | 対象は浅いオブジェクトスキーマ。nested のトップレベルキーのみ扱い、配列・ネストは Phase 3 で対応 |

## 6. 判断ログ

| 日付 | 決定 | 理由 |
|---|---|---|
| 2026-06-17 | サーバ `parseBody` は変えず、クライアント検証で field 単位表示を実現 | UX 目的はクライアントで満たせる。サーバの issue 返却は影響範囲が広く別タスク。今回はサーバ挙動不変を保つ |
| 2026-06-17 | 日本語メッセージは domain スキーマに集約 | 単一ソース。client/server 双方が同じスキーマを使うため表示文言が一元化される |
| 2026-06-17 | submit 時検証（onChange 逐次にしない） | 最小スコープで価値を出す。逐次検証は体感を変えるので別途判断 |
| 2026-06-17 | AnswerForm（動的）は Phase 3 として分離可能に | 構造が他 3 フォームと異なり、無理に同一 helper へ寄せると複雑化 |

## 7. ステータス

- [x] Plan ドラフト完成（本ファイル）
- [x] 計画レビュー / 笹木さん承認（2026-06-17 承認）
- [x] Phase 1 実装（helper + domain メッセージ + UserForm）。helper unit test 4 件 green
- [x] Phase 2 実装（SurveyForm）。InterviewForm は検証フィールドなしで対象外
- [x] Phase 1+2 PR (#33) マージ済み
- [x] Phase 3 実装（AnswerForm 動的）。`requiredFieldErrors` helper を追加（unit test 3 件）し、設問駆動の必須未入力を設問ごとに表示
- [ ] Phase 3 PR マージ
- [ ] 親（dashboard）の見た目磨き込み #2 を消し込み
