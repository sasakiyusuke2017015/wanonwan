# Review: 設問マスタ / アンケートのマスタ運用化 + 緊急度マスタ（計画レビュー）

| 項目 | 値 |
|---|---|
| 作成日時 | 2026-06-29 13:52 JST |
| レビュアー | Claude Code |
| 対象 Plan | [`plans/2026-06-29-1327-survey-question-master.md`](../plans/2026-06-29-1327-survey-question-master.md) |
| ブランチ | `feature/survey-question-master`（TBD） |
| 関連 PR | TBD |
| レビュー種別 | 計画 |

## 判定

| 項目 | 判定 | スコープ / 意味 |
|---|---|---|
| 最終判定 | **NEEDS WORK** | BLOCKER 1 件（緊急度カラム追加の migration 方式）＋ 詰めるべき MEDIUM 複数。修正後 APPROVE 相当へ |
| Plan 判定 | **NEEDS WORK** | 方向性は妥当。スキーマ追加方式・スコープ分割・フォーム差分の明文化が必要 |
| 実装判定 | N/A | 本 Review では実装は見ない |
| 記録整理 | OK | Plan 本体の文書構造・判断ログは整っている |

## 指摘事項

| 重大度 | Plan 内位置 | 指摘 | 推奨修正 |
|---|---|---|---|
| **BLOCKER** | `## 実装計画` 1（スキーマ） | `surveys` と `answers` に `urgency_id` を「追加」とあるが追加方式が未指定。schema は `db-migrate.mjs` が `*.sql` を昇順・**冪等**適用するモデルで、既存 `CREATE TABLE IF NOT EXISTS` を編集しても**既存 DB（stg/prod や再構築しない dev）には反映されない**（IF NOT EXISTS でスキップ）。silent no-op で本番にカラムが入らない事故になる | 房 house パターンに合わせ **`ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id)`**（answers も同様）を明記。実例: [30_users.sql:24](../../packages/db/schema/30_users.sql#L24) / [66_answer_embeddings.sql:5](../../packages/db/schema/66_answer_embeddings.sql#L5) |
| **BLOCKER** | `## 実装計画` 1（スキーマ） | FK 順序の指定漏れ。`urgency_levels` は `surveys`(40) / `answers`(60) より**前**に作られていないと FK 参照で落ちる。`packages/db/schema/ に追加` だけでは番号順が不定 | `urgency_levels` を **40 より前の番号**（例 `35_urgency.sql`）で新設、と Plan に明記。ALTER も同ファイル末尾か `>60` の番号で urgency_levels 作成後に流す順序にする |
| MEDIUM | `## スコープ` 4 / `## 実装計画` 5 | `answers.urgency_id` / `surveys.urgency_id` を追加するが、**値を設定する UI・経路が「別段で」と全面後回し**。書き手のないカラム＝当面 dead schema。さらに `answers` の write RLS は本人/面談者/viewer/admin で、緊急度を誰がいつ設定するか（面談時に面談者/admin 等）が未定義 | (a) 最低どちらか一方に set-urgency UI をスコープに含める、または (b) FK カラム追加自体を「書き手 UI を作る段」まで遅らせる（dead column を merge しない）。どちらにせよ「誰がどの画面で設定するか」を 1 行で確定 |
| MEDIUM | `## スコープ` 1 / `## 実装計画` 3 | 「既存 `QuestionForm` を切り出して再利用」とあるが、現行 `QuestionForm` の Draft は `body/answerType/choicesText/required` のみで **`eval_item` 入力が無い**（[QuestionsEditor.tsx](../../apps/web/components/admin/QuestionsEditor.tsx)）。設問マスタの目玉である評価項目（radar 連携キー）が設定できない | 「切り出し」ではなく **`eval_item` セレクタ（`EVAL_ITEMS` 由来）を新規追加**する旨を明記。`hasExtraField` の扱いも要否を判断 |
| MEDIUM | 全体 | 1 Plan に 4 機能（設問マスタ UI / アンケート編集リンク導線 / 緊急度マスタ＋2 テーブル schema 変更 / seed 文言）が同梱。`git-workflow` の「1 テーマ = 1 PR」に対し過大。レビュー・ロールバック単位が大きい | Plan に **PR 分割方針**を明記。推奨: ①seed 文言（即出し）/ ②設問マスタ＋リンク導線 / ③緊急度マスタ。`## 実装計画` の段をそのまま PR 境界にできる |
| NICE-TO-HAVE | `## スコープ` 3 | 「アンケートのマスタ一覧運用」が「整理が主・大きな新規実装は不要」と曖昧。具体的な変更（ナビ表記？導線？）が読めず「やる/やらない」で揉める余地 | 具体差分（例: ナビラベルを「アンケート」→「アンケートマスタ」等）を列挙、もしくは本スコープから外して別管理 |
| NICE-TO-HAVE | `## 検証` | API の認可境界テストが未記載。`GET /api/v1/questions` は認証済みで可・`POST` は非 admin で RLS 拒否、`/questions/link` の重複 PK→409 など、振る舞いの検証項目が無い | pgTAP かつ手動で「非 admin の write 拒否」「重複リンク 409」を検証項目に追加 |
| NICE-TO-HAVE | `## 未確定事項` | 未確定 3 点（緊急度値域 / radio 文言 / アンケートマスタ意味）が残ったまま。これらは実装の各段の入力になる | 着手前に最低 ①緊急度値域 と ②radio 文言 を確定（schema とデフォルト値に直結）。③は段 5 着手時で可 |

## 妥当性レビュー

- **要件適合**: ユーザー要望（設問・アンケートをマスタ運用、緊急度マスタ追加）に方向性は合致。「DB は既にマスタ構造、UI が無いだけ」という現状把握は [40_surveys.sql](../../packages/db/schema/40_surveys.sql) / [99_rls.sql](../../packages/db/schema/99_rls.sql) と照合して正確。RLS が既に `questions`/`survey_questions` を admin-write 済みという記述も確認でき、スコープ外（RLS 新規設計不要）の判断は妥当。
- **スコープ境界**: 「やらないこと」（AI プロンプト UI / バージョニング / 集計変更）は明確。一方で **緊急度の書き手 UI** と **アンケートマスタ運用の具体**が曖昧側に倒れており、ここが NEEDS WORK の主因。
- **影響範囲の見落とし**: 最大の穴は **schema migration 方式**（BLOCKER）。冪等適用モデルでの「カラム追加」は ALTER ADD COLUMN IF NOT EXISTS が必須で、house に前例があるのに Plan が踏襲を明記していない。API/認可/ナビ/seed の影響は概ね拾えている。
- **API 設計**: `withActiveUser + RLS WITH CHECK` で admin-write を担保する方式は既存 [positions/route.ts](../../apps/web/app/api/v1/positions/route.ts) と一致。app 層の明示 admin チェックを置かない点は既存マスタと同じ（本 PR で新たに作る逸脱ではない）ので所与とする。`/questions/link` の重複 PK→409 を `mapDbError` で返す設計も既存パターンに沿う。

## 過去事例からの教訓

- **[seed-csv-master-admin（2026-06-25）](../plans/2026-06-25-1025-seed-csv-master-admin.md)** が直接の先行 Plan。`MasterListView` + `MASTER_CONFIGS` + CSV seed + 順序ローダーの基盤はそこで確立済み。緊急度マスタは **その config-driven パターンに素直に乗せる**のが正解で、本 Plan の方針（urgency を MASTER_CONFIGS に追加）は教訓を踏襲できている。設問マスタだけは code+name に収まらず専用フォームにする、という線引きも妥当。
- **[separate-role-from-position（2026-06-25）](../plans/2026-06-25-1558-separate-role-from-position.md)**: 「権限(認可)と HR 概念を混ぜない」教訓。緊急度を `surveys`（アンケート優先度）と `answers`（面談緊急度）で**意味が違う 1 マスタに共用**する点は、同種の「別概念を 1 テーブルに寄せる」リスクを孕む。ユーザー判断「両方に使う」で受容済みだが、値域確定時に両者で破綻しないラベル設計か再確認すること（判断ログに追記推奨）。
- 撤回済み Plan（deploy-infra / auth-gotrue-sync / seed-csv-master-admin の一部撤回記述）と本テーマの重複・矛盾は無し。

## 検証（この Review 自体の）

- [x] 対象 Plan を全文 Read 済み
- [x] 関連ファイル grep 済み（schema 適用方式 = db-migrate.mjs / ALTER 前例 = 30_users・66_answer_embeddings / RLS = 99_rls / API = positions・questions・surveys questions / MasterForm・MASTER_CONFIGS / QuestionsEditor の Draft / answers schema）
- [x] 撤回された Plan との被り確認済み（被りなし）

## フォローアップ（Plan 側へ反映してほしい修正）

- [ ] **[BLOCKER]** スキーマ: `urgency_id` 追加を `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` で明記
- [ ] **[BLOCKER]** スキーマ: `urgency_levels` を 40 より前の番号で新設（FK 順序）
- [ ] [MEDIUM] 緊急度: 値を設定する画面・担当（誰がいつ）を確定、または FK カラム追加を書き手 UI の段まで遅らせる
- [ ] [MEDIUM] 設問マスタ: `QuestionForm` に `eval_item` 入力を追加する旨を明記（単純な切り出しではない）
- [ ] [MEDIUM] PR 分割方針を Plan に明記（①seed 文言 / ②設問マスタ＋リンク導線 / ③緊急度マスタ）
- [ ] [NICE] アンケートマスタ運用の具体差分を列挙 or スコープ外へ
- [ ] [NICE] 検証に認可境界（非 admin write 拒否 / 重複リンク 409）を追加
- [ ] [NICE] 着手前に緊急度値域・radio 文言を確定
