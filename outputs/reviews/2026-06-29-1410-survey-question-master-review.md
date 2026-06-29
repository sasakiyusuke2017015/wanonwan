# Review: survey-question-master plan rereview

| 項目 | 値 |
|---|---|
| レビュー種別 | 計画（再レビュー / 2 周目） |
| 対象 Plan | [2026-06-29-1327-survey-question-master.md](../plans/2026-06-29-1327-survey-question-master.md) |
| 前回レビュー | [Codex 2026-06-29-1400](2026-06-29-1400-survey-question-master-review.md) / [Claude 2026-06-29-1352](2026-06-29-1352-survey-question-master-review.md) |
| 作成 | 2026-06-29 14:10 JST |
| verdict | APPROVE |

## 前回 Codex 指摘の確認

1. [BLOCKER] 緊急度マスタの RLS 適用手順が不足
   - 判定: 解消
   - 本 Plan から緊急度実装が外れ、Phase 2 記録に `ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY;` と非 admin write 拒否 pgTAP が明記された（Plan lines 157-167）。本 Plan は新規テーブルなし・RLS 変更なしになったため、当初の BLOCKER はスコープ外化かつ Phase 2 注意として回収済み。

2. [BLOCKER] `surveys` / `answers` への `urgency_id` 追加と利用範囲が矛盾
   - 判定: 解消
   - FK カラム追加は本 Plan から外れ、Phase 2 側に「書き手を確定してから列を足す」と明記された（Plan lines 65, 157-172）。dead column 化の懸念は本 Plan では解消。

3. [BLOCKER] リンク解除の API/検証が計画されていない
   - 判定: 解消
   - `DELETE /api/v1/surveys/[id]/questions/[questionId]` が追加され、`questions` 本体・他 survey リンクを残す責務が明記された（Plan lines 47-54, 118-121）。検証にも unlink の局所性が入っている（Plan lines 136-140）。

4. [BLOCKER] 実装前に要確定の項目が DB/API/seed に影響するまま残っている
   - 判定: 解消
   - radio 文言は同意度 5 段階に確定（Plan lines 56-61, 187-188）。アンケートテンプレート概念は導入しないと明記（Plan lines 70-71, 174-176）。緊急度は Phase 2 に分離済み。

5. [NICE-TO-HAVE] 既存テーブルへのカラム追加 house pattern 明記
   - 判定: 解消
   - 本 Plan ではカラム追加なし。Phase 2 記録には `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` の注意が明記された（Plan lines 168-170）。

## 前回 Claude 指摘の確認

- `urgency_id` migration 方式 / FK 順序: 解消。本 Plan 外へ分離し、Phase 2 注意として `35_urgency.sql` 例・冪等 ALTER が記録済み（Plan lines 163-170）。
- 緊急度の書き手 UI 未定: 解消。本 Plan 外へ分離し、Phase 2 Plan で確定してから列追加と明記（Plan line 171）。
- `QuestionForm` の `eval_item` 入力不足: 解消。`eval_item` セレクタ追加が PR-B に明記済み（Plan lines 92-93, 122-124）。
- PR 過大: 解消。PR-A seed / PR-B 設問マスタに分割済み（Plan lines 102-130）。
- アンケートマスタ運用の曖昧さ: 解消。テンプレート概念は導入せず、ナビ表記も据え置きと明記（Plan lines 70-71, 126-127）。
- API 認可境界の検証不足: 解消。非 admin write 拒否、重複 link 409、unlink 局所性が検証に入った（Plan lines 136-140）。

## 新規指摘

1. [NICE-TO-HAVE] アンケート編集内の「編集」がマスタ設問編集であることを UI 上も明確にするとよい
   - 対象: Plan lines 128-130, 147-153, 180-184
   - Plan はマスタ設問編集の波及を MVP 仕様として受容している。一方、アンケート編集内に既存の inline edit を残す場合、その編集も `PUT /api/v1/questions/[id]` 経由のマスタ編集になる。削除は「外す」と「マスタ削除」を分離できているので、編集についてもボタン文言や確認で「この設問を使う他アンケートにも反映される」ことを示すと事故を減らせる。
   - 差し戻し不要。実装時の UI 文言・確認ダイアログで吸収可能。

## verdict

APPROVE
