# Review: 設問マスタ機能（PR-B）コードレビュー

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-29 15:12 JST |
| レビュアー | Claude Code エージェント（code-reviewer + security-reviewer 並列）統合 |
| 対象 Plan | [`plans/2026-06-29-1327-survey-question-master.md`](../plans/2026-06-29-1327-survey-question-master.md)（PR-B） |
| 対象ブランチ | `feature/survey-question-master` |
| 対象コミット | `51db089`（+ レビュー反映の追従修正） |
| レビュー種別 | コード |
| 備考 | Codex がトークン枯渇のため、`code-reviewer` / `security-reviewer` エージェントで代替実施 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **APPROVE** | BLOCKER / CRITICAL / HIGH なし。NICE-TO-HAVE は反映済み or 任意 |
| Plan 判定 | N/A | 本 Review は実装レビュー |
| 実装判定 | **APPROVE** | 認可・injection・入力検証・IDOR いずれも問題なし |
| 記録整理 | OK | — |

## 指摘事項

| 重大度 | 箇所 | 指摘 | 対応 |
|---|---|---|---|
| NICE-TO-HAVE | `admin/questions/[id]/edit/page.tsx` / `QuestionsEditor.tsx` の PUT 後 | queryKey invalidate の整合: 編集後に `["question", id]`（詳細）やマスタ一覧 `["questions"]` を invalidate しておらず、同一セッションで古いキャッシュを見うる（遷移するため実害は軽微） | **反映済み**: 編集ページで `["question", id]` を、QuestionsEditor の マスタ設問 PUT 後に `["questions"]` を invalidate 追加 |
| NICE-TO-HAVE | `questions/[id]/route.ts` ほか `Number(id)` 箇所 | 非数値パスで `NaN` → SQL 0 件 → 404。安全側だが「不正 id を 400 でなく 404」で意味は不正確。既存ルート（reorder 等）と同じ慣習 | 任意・現状維持（既存慣習に合わせる。セキュリティ影響なし） |
| INFO | 全 state-changing ルート | Cookie `SameSite=Lax`・CSRF トークンなしは PR-B が導入/後退させたものでなく、アプリ全体の既存設計。スコープ外 | 本 PR では対応不要（アプリ全体課題として別途） |

CRITICAL / HIGH / MEDIUM / BLOCKER: **なし**

## 確認した観点（両エージェント一致）

- **認可境界**: 新規 5 ハンドラすべて `withActiveUser` 経由。write 系は `withUser(claims.sub, …)` で RLS コンテキストを注入し、`99_rls.sql` の `questions_write` / `survey_questions_write = app.is_admin()`（USING + WITH CHECK）が最終ガード。非 admin の write は `42501` → 403 でフェイルクローズ。ラッパ付け忘れなし。app 層に明示 admin チェックを置かない既存方針（`positions/route.ts`）と一致。
- **リンク解除 DELETE** `/surveys/[id]/questions/[questionId]`: 複合 PK 一致の 1 行のみ削除。`questions` 本体・他アンケートのリンクは無傷（巻き込みなし）。
- **link 重複**: `23505` をローカルで捕捉し 409 + 適切な日本語文言（`mapDbError` の汎用文言に流れない）。存在しない survey/question は FK `23503` → 400。
- **入力検証**: `CreateQuestionSchema` / `LinkQuestionSchema` を `parseBody` 経由。`LinkQuestionSchema.questionId` は `v.number()`。SQL は全て tagged template + `tx.json` でパラメータ化、injection なし。id は `Number()` 変換後に補間（生 id 補間なし）。
- **原子性**: `withUser` が `sql.begin` で tx を張り、link の「max(sort_order) 取得 → insert」は単一 tx 内で原子的。
- **eval_item**: `questionDraftToPayload` で `evalItem: d.evalItem || undefined` → API `?? null`。choice 系以外は `choices: []`。
- **品質**: `console.log` / TODO / any なし。各ファイル 200 行未満・高凝集。`QuestionForm` の共通部品化は ui-catalog 方針と整合。

## 検証

- `pnpm -r typecheck` green（レビュー反映後も）
- `pnpm --filter @waoon/web build` green（新ルート `/admin/questions{,/new,/[id]/edit}`・`/api/v1/questions{,/[id]}`・`/surveys/[id]/questions/{link,[questionId]}` 生成確認）
- `pnpm --filter @waoon/web lint` green
- DB 振る舞い（非 admin write 拒否 / 重複 link 409 / unlink 局所性）は RLS + ルート実装で担保。runtime 実機確認は笹木さん dev 環境で。

## verdict

**APPROVE** — BLOCKER なし。NICE-TO-HAVE（queryKey 整合）は反映済み、残りは任意/スコープ外。
