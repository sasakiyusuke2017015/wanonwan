# Review: survey-question-master plan

| 項目 | 値 |
|---|---|
| レビュー種別 | 計画 |
| 対象 Plan | [2026-06-29-1327-survey-question-master.md](../plans/2026-06-29-1327-survey-question-master.md) |
| 作成 | 2026-06-29 14:00 JST |
| verdict | NEEDS WORK |

## 指摘

1. [BLOCKER] 緊急度マスタの RLS 適用手順が不足している
   - 対象: Plan lines 74-75, 83-84, 108-112, 144
   - Plan は `urgency_levels` を「既存マスタループに追加すれば足りる」としているが、現行 `99_rls.sql` は各テーブルに対して `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` を明示列挙してから、別途 DO ループで policy を作る構造。新規テーブルをループ配列に足すだけでは RLS が有効化されず、`GRANT ... ON ALL TABLES` の下で app_user の通常 DML が RLS によって絞られない。
   - 計画に `ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY;` を追加し、pgTAP では policy の存在だけでなく「非 admin write が拒否される」ことまで検証対象に入れる必要がある。

2. [BLOCKER] `surveys` / `answers` への `urgency_id` 追加と利用範囲が矛盾している
   - 対象: Plan lines 55-61, 108-120, 132-134, 163-167, 185-187
   - Plan は緊急度を `surveys` と `answers` の両方から参照することを「やること（確定）」に置き、DB カラム追加まで計画している。一方で、紐づけ先 UI は「確定後に別段」、値域も未確定のまま。これだと FK カラムだけが入って読み書き経路がない、または実装中に値域・UI・API payload が後戻りする。
   - 少なくとも本 Plan 内でやる範囲を明確化する必要がある。例: 「今回は master CRUD と nullable FK 追加のみで surveys/answers からは未使用」と明記して利用 UI/API をスコープ外にする、または `surveys` / `answers` の作成・編集・詳細 API/UI に `urgencyId` を通す段まで計画に含める。値域も schema/domain 作成前に確定が必要。

3. [BLOCKER] リンク解除の API/検証が計画されていない
   - 対象: Plan lines 40-49, 85-90, 128-130, 151-158
   - 既存 `DELETE /api/v1/questions/[id]` は `questions` を削除し、FK cascade で全 `survey_questions` リンクも消す挙動。Plan は「リンク解除」と「マスタごと削除」を分離するとしているが、追加 API は link のみで unlink がない。UI 文言だけでは、既存 DELETE を呼び続ける実装になった場合に他アンケートのリンクまで巻き込む。
   - `DELETE /api/v1/surveys/[surveyId]/questions/[questionId]` などのリンク解除 API、または既存 route の責務変更を明記し、検証に「リンク解除しても `questions` 本体と他 survey のリンクは残る」「マスタ削除は設問マスタ側からのみ実行される」を追加する必要がある。

4. [BLOCKER] 実装前に要確定の項目が、DB/API/seed に影響するまま残っている
   - 対象: Plan lines 63-67, 163-171, 183-187
   - 未確定事項のうち、緊急度の値域は `CreateUrgencySchema` / seed / 表示ラベル / 将来の `urgency_id` 利用に直結し、radio 標準文言は demo seed と新規設問デフォルトの仕様になる。アンケート「マスタ管理」の意味も、既存 `/admin/surveys` の整理だけで済むのかテンプレート概念を含めるのかで scope が変わる。
   - Plan のステータス上も「残る未確定事項を確定」が未完了なので、このまま APPROVE せず、値域・radio 文言・アンケートマスタ範囲を判断ログに確定してから着手すべき。

5. [NICE-TO-HAVE] 既存テーブルへのカラム追加は house pattern を明記するとよい
   - 対象: Plan lines 108-110
   - リポジトリの migration モデルでは、既存テーブルへの追加は `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` が house pattern。Plan は `surveys` / `answers` への `urgency_id` 追加を述べているが、冪等な ALTER と FK 名・index 有無までは書いていない。
   - BLOCKER 2 の整理後、実装手順に `ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);` 相当を明記すると、既存環境への適用ミスを減らせる。

## verdict

NEEDS WORK
