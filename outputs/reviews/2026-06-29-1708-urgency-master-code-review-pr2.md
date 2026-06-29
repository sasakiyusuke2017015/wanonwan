# Review: 緊急度マスタ PR-2（配線 + 書き手 UI）コードレビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-29 17:08 JST |
| レビュアー | Claude Code エージェント（code-reviewer + security-reviewer 並列）統合 |
| 対象 Plan | [`plans/2026-06-29-1537-urgency-master.md`](../plans/2026-06-29-1537-urgency-master.md)（PR-2） |
| 対象ブランチ | `feature/urgency-wiring` |
| 対象コミット | `6bcb8a4`（実装）→ `56b6b56`（BLOCKER 修正） |
| レビュー種別 | コード |
| 備考 | Codex トークン枯渇のため code-reviewer / security-reviewer エージェントで実施 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE**（対応後） | code-reviewer の BLOCKER を修正・再検証 green。security はゼロ指摘 |
| 実装判定 | 初回 **NEEDS WORK** → 対応後 **APPROVE** | 下記 BLOCKER を `56b6b56` で解消 |
| 記録整理 | OK | — |

## 指摘事項

| 重大度 | 箇所 | 指摘 | 対応 |
|---|---|---|---|
| **BLOCKER**（初回） | `SurveyForm.tsx`（urgencyOptions / Select）+ `Select.tsx:157-166` | `urgencyOptions` が常に先頭空 option を含むため未ロード時も `options.length>0`。編集時に survey 詳細が先に解決し `urgencyId="3"` をセット → urgencies 未ロードだと Select の自動フォールバック（value が options に無い→先頭 `""` に onChange）が発火し、既存の緊急度が **null で上書き**（キャッシュミス時に間欠再現）。InterviewForm は空配列構築で安全 | **修正済み `56b6b56`**: 空 option を廃し `allowEmpty`+`placeholder="（なし）"`+`value={form.urgencyId || undefined}` に（InterviewForm と統一）。未ロード時 `options.length===0` で発火せず |
| NICE-TO-HAVE | GET 詳細の `urgencyId` 型 | `urgency_id` は bigint で postgres.js は文字列を返すため、実体 `string` と注釈 `number` がズレ（フォームは `String()` 正規化で実害なし） | **修正済み `56b6b56`**: surveys/[id]・answers/[id] の GET で `urgency_id::int as "urgencyId"` にキャストし number に統一 |
| INFO | interview PUT | `urgency_id = ${input.urgencyId ?? null}` は未送信時 null 上書きの全置換セマンティクス。既存 interview_memo / next_action と同じで PR-2 が導入した問題ではない | 対応不要 |

CRITICAL / HIGH（security）: **なし**

## 確認した観点（両エージェント）

- **migration**: `40_surveys.sql` / `60_answers.sql` ともに `ALTER TABLE ... ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id)`。`db-migrate` は昇順適用（35→40→60）で FK 先 `urgency_levels`（35, PR-1 で develop 済）が存在。CREATE 編集でなく冪等 ALTER。dev DB で両列追加を確認。
- **認可**: surveys の urgency 設定は `surveys_write=admin`（RLS）。answers の urgency は面談記録 PUT の既存 app 層ガード（`is_admin` か当該回答の面談者のみ・回答者は除外）+ `answers_update` RLS の内側で更新。緊急度設定主体の緩みなし。GET の urgencyId 露出は既存 select RLS に従う非機微値。
- **injection**: 全て tagged template（`${input.urgencyId ?? null}`）/ `tx(set)`。生補間なし。
- **入力検証**: `urgencyId: v.optional(v.nullable(v.number()))`（survey / interview）。Update は partial 継承。存在しない id → FK 23503 → `mapDbError` 400。
- **null 処理**: surveys PUT は `!== undefined` で set、POST/interview は `?? null`。未選択→null で保存/クリア可。
- **RLS 追加要否**: urgency_id は親テーブルの行レベル RLS で保護され、新規ポリシー不要。

## 検証

- 修正後 `pnpm --filter @waoon/web typecheck` / `lint` / `build` green。
- 実装時点で `pnpm test:db` 全 8 ファイル pass、dev DB に surveys/answers の `urgency_id` 追加を確認。
- 書き手 UI（SurveyForm / InterviewForm の緊急度セレクタ・null クリア・編集時保持）の runtime 実機確認は笹木さん dev で。

## verdict

**APPROVE**（対応後）— 初回 code-reviewer の BLOCKER（SurveyForm 自動クリア）を `56b6b56` で解消し再検証 green。security はゼロ指摘。
