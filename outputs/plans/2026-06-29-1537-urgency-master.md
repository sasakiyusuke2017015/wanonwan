# Plan: 緊急度マスタ（surveys / answers 共通）

| 項目 | 値 |
|---|---|
| ステータス | 🟣 マージ承認待ち — PR-1(#62) merged。PR-2(#63) 提出済み・コードレビュー APPROVE。笹木さん #63 マージ待ち |
| slug | `urgency-master` |
| 作成 | 2026-06-29 15:37 JST |
| 担当 | Claude Code + 笹木さん |
| ブランチ | PR-1 `feature/urgency-master`（merged）/ PR-2 `feature/urgency-wiring` |
| 関連 PR | PR-1: [#62](https://github.com/sasakiyusuke2017015/waoon/pull/62)（merged）/ PR-2: [#63](https://github.com/sasakiyusuke2017015/waoon/pull/63) |
| レビュー | [計画(Claude)](../reviews/2026-06-29-1612-urgency-master-review.md): **APPROVE** / [コード PR-1(agent)](../reviews/2026-06-29-1631-urgency-master-code-review-pr1.md): **APPROVE** / [コード PR-2(agent)](../reviews/2026-06-29-1708-urgency-master-code-review-pr2.md): **APPROVE**（BLOCKER 修正後） |
| 親 Plan | [設問マスタ Phase 2](2026-06-29-1327-survey-question-master.md)（本 Plan へ分離） |
| git repo | `https://github.com/sasakiyusuke2017015/waoon.git` |

---

## 目的

緊急度（高 / 中 / 低）を **マスタ**として管理し、**アンケート（surveys）** と
**回答・面談（answers）** の両方から参照できるようにする。組織マスタ / 役職マスタ /
設問マスタと同じく、管理者が CRUD できるマスタ画面を持つ。

親 Plan（設問マスタ）の Phase 2 として分離した経緯と確定事項:
- 緊急度は **surveys と answers 両方から参照する共通マスタ**（笹木さん判断「両方に使う」）。
- 値域は **code+label（高 / 中 / 低）**。組織 / 役職マスタと同型で `MasterListView` に載せる。
- 「書き手 UI を確定してから FK 列を足す」（dead column 回避）。本 Plan は書き手 UI を含める。

## スコープ

PR 分割（dead column を避けるため、列追加と書き手 UI を同じ PR に入れる）:

- **PR-1: 緊急度マスタ本体**（テーブル / RLS / API / マスタ画面 / ナビ / seed / pgTAP）
- **PR-2: 参照の配線**（surveys / answers への `urgency_id` 追加 + それぞれの書き手 UI）

### やること

**PR-1 緊急度マスタ**
1. `urgency_levels` テーブル新設（`35_urgency.sql`。`code int UNIQUE NOT NULL`〈並び順兼一意キー〉 +
   `name text NOT NULL`、組織 / 役職マスタと同型）。FK 順のため **40_surveys / 60_answers より前の番号**。
2. RLS: `99_rls.sql` に `ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY;` を**明示追加**し、
   マスタ系ループ配列に `urgency_levels` を足す（select=認証済み / write=admin）。
3. domain: `CreateUrgencySchema` / `UpdateUrgencySchema`（code:number, name:string）。
4. API: `GET/POST /api/v1/urgencies` + `GET/PUT/DELETE /api/v1/urgencies/[id]`（positions ルートの写し）。
   **DELETE は `mapDeleteError`（使用中＝ FK 参照あり → 409）** を使う（positions と同じ）。
5. UI: `MASTER_CONFIGS.urgency` を追加し `/admin/urgencies`（一覧 / 新規 / 編集）を `MasterListView` /
   `MasterForm` で実装。ナビに「緊急度マスタ」（admin 限定）。
6. seed: `urgency_levels.csv`（`code,name`: `1,低` / `2,中` / `3,高`）を `MASTER_TABLES` に追加。
7. pgTAP: `rls_urgency_levels.test.sql`（非 admin write 拒否 / 認証 select 可。`rls_positions` の写し）。

**PR-2 参照の配線**
8. スキーマ: `40_surveys.sql` に `ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);`、
   `60_answers.sql` に同様の `answers.urgency_id`（冪等 ALTER。house パターン = 30_users.role / 66 embedding と同じ）。
9. surveys 書き手: `CreateSurveySchema` / `UpdateSurveySchema` に `urgencyId`（optional nullable number）。
   surveys 作成 / 更新 / 詳細 API に `urgency_id` を通し、`SurveyForm`（status / capacity と並ぶ）に
   緊急度セレクタを追加（`/api/v1/urgencies` から選択肢取得）。
10. answers 書き手: `RecordInterviewSchema` に `urgencyId` を追加。面談記録 API に `urgency_id` を通し、
    `InterviewForm`（healthStatus / interviewMethod と並ぶ）に緊急度セレクタを追加。

### やらないこと

- 緊急度による一覧の絞り込み / 並び替え / 集計（ダッシュボード等）。設定・表示までで、分析は別 Plan。
- 緊急度の色 / アイコン等の装飾（label のみ）。
- 通知・エスカレーション連携（pgmq 等）。将来検討。
- answers 以外（schedules 等）への緊急度付与。

## 現状コンテキスト

- **マスタ基盤**: `MasterListView` + `MASTER_CONFIGS`（[master-config.ts](../../apps/web/lib/admin/master-config.ts)）+
  `MasterForm` は code+name の単純マスタを設定追加だけで生成できる（組織 / 役職で実績）。緊急度は
  この型に収まる。
- **API テンプレート**: [positions/route.ts](../../apps/web/app/api/v1/positions/route.ts) /
  `positions/[id]/route.ts` が GET一覧・POST・GET単体・PUT・DELETE の写し元。
  master write は `withActiveUser` + RLS `WITH CHECK app.is_admin()`。
- **スキーマ / RLS**: `db-migrate.mjs` が `packages/db/schema/*.sql` を昇順・冪等適用。
  既存表への列追加は `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`（[30_users.sql](../../packages/db/schema/30_users.sql) role /
  [66_answer_embeddings.sql](../../packages/db/schema/66_answer_embeddings.sql)）。RLS は
  [99_rls.sql](../../packages/db/schema/99_rls.sql) が各表を明示 ENABLE → マスタ系ループで select/write policy。
- **書き手の現状**:
  - surveys: [SurveyForm](../../apps/web/components/admin/SurveyForm.tsx) に status / capacity。
    `CreateSurveySchema` / `UpdateSurveySchema`（[survey.ts](../../packages/domain/src/survey.ts)）。
  - answers: [InterviewForm](../../apps/web/components/admin/InterviewForm.tsx) と
    `RecordInterviewSchema`（[interview.ts](../../packages/domain/src/interview.ts): interviewMethod /
    healthStatus / evaluation 等）。面談記録時に interviewer / admin が設定。
    answers の write RLS = 本人 / 面談者 / viewer / admin。緊急度は面談記録の一部として設定される想定。
- **seed**: `MASTER_TABLES`（[seed-from-csv.mjs](../../scripts/seed-from-csv.mjs):108）に urgency を追加。
- **pgTAP**: `packages/db/tests/rls_positions.test.sql` が RLS テストの写し元。

## 実装計画

各段で `pnpm -r typecheck`、DB 段は `pnpm test:db`（pgTAP）。

### PR-1: 緊急度マスタ
1. `35_urgency.sql`: `urgency_levels(id, code int unique, name text)` を新設。
2. `99_rls.sql`: ENABLE RLS 明示 + マスタ系ループ配列に `urgency_levels` 追加。
3. domain: `CreateUrgencySchema` / `UpdateUrgencySchema`。
4. API: `/api/v1/urgencies`（GET/POST）・`/api/v1/urgencies/[id]`（GET/PUT/DELETE）。
5. UI: `MASTER_CONFIGS.urgency` + `/admin/urgencies/{page,new,[id]/edit}` + ナビ「緊急度マスタ」。
6. seed: `urgency_levels.csv` + `MASTER_TABLES` 登録。
7. pgTAP: `rls_urgency_levels.test.sql`。

### PR-2: 参照の配線
8. `40_surveys.sql` / `60_answers.sql` に `urgency_id` の冪等 ALTER（FK → urgency_levels）。
9. surveys: domain（urgencyId）→ surveys API（作成/更新/詳細）→ `SurveyForm` にセレクタ。
10. answers: `RecordInterviewSchema`（urgencyId）→ 面談記録 API → `InterviewForm` にセレクタ。

## 検証

- `pnpm -r typecheck` / `pnpm --filter @waoon/web build` / lint。
- `pnpm test:db`: `rls_urgency_levels`（非 admin write 拒否 / 認証 select）。FK 追加後に既存 RLS 回帰。
- 手動（dev 実機）:
  - `/admin/urgencies` の CRUD（非 admin でガード）。
  - SurveyForm で緊急度を設定 → 保存 → 再表示で保持。
  - 面談記録（InterviewForm）で緊急度を設定 → 保存 → 保持。
  - 緊急度を未設定（null）でも保存できる（nullable）。
  - 使用中の緊急度行を削除しようとしたときの挙動（FK 参照 → `mapDeleteError` で 409）。

## リスク

- **FK 順序**: `urgency_levels` は surveys(40) / answers(60) より前（35）で作る。ALTER は各表作成後
  （40 / 60 内）に置く。順序を誤ると migration が落ちる。
- **冪等 ALTER の徹底**: `CREATE TABLE` 編集ではなく `ALTER ... ADD COLUMN IF NOT EXISTS` を使う
  （既存 DB に silent no-op で入らない事故の回避。親 Plan のレビュー指摘）。
- **使用中マスタの削除**: surveys / answers から参照中の緊急度を削除すると FK 違反。`ON DELETE` は
  既定（RESTRICT 相当）にして `mapDeleteError` で 409 を返す（役職マスタと同方針）。`SET NULL` は採らない。
- **answers の書き手範囲**: 緊急度を面談記録の一部にするため、設定できるのは面談者 / admin
  （answers の update RLS に従う）。回答者本人が自分の緊急度を上げ下げできるべきかは要確認（下記）。

## 未確定事項（実装前に確認）

1. **code の数値割り当て**: `1=低 / 2=中 / 3=高`（昇順＝緊急度高）で進める想定。逆順や 10/20/30 希望が
   あれば変更。
2. **answers の緊急度を誰が設定するか**: 面談記録フォーム（面談者 / admin）に置く想定。回答者本人にも
   出すか（例: 回答時に「相談したい度」）。本 Plan では面談側のみ。
3. **緊急度の表示**: 一覧（admin surveys / answers）に緊急度バッジを出すか。本 Plan は設定のみで一覧表示は
   スコープ外（必要なら別 Plan）。

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-29 | 緊急度は code+label の単純マスタとし MasterListView に載せる | 組織 / 役職と同型。専用フォーム不要 |
| 2026-06-29 | 列追加と書き手 UI を同 PR(PR-2) にまとめる | 親 Plan レビューの「書き手のない FK = dead column」指摘の回避 |
| 2026-06-29 | `urgency_levels` を 35 番、ALTER は 40/60 内に配置 | FK 順序（参照先が先に存在する必要） |
| 2026-06-29 | 使用中マスタ削除は 409（SET NULL 採らない） | 役職マスタと同方針。誤削除の検知を優先 |

## ステータス

- [x] code 割当（1=低/2=中/3=高）を採用
- [x] PR-1: urgency_levels テーブル + RLS（ENABLE 明示）+ pgTAP
- [x] PR-1: domain（Create/Update）+ API（urgencies CRUD）
- [x] PR-1: MASTER_CONFIGS + /admin/urgencies + ナビ + seed
- [x] PR-1: コードレビュー（code/security agent）APPROVE → [#62](https://github.com/sasakiyusuke2017015/waoon/pull/62)
- [x] answers 書き手範囲＝面談側のみ（面談者/admin）で実装 / 一覧表示は別 Plan
- [x] PR-2: surveys/answers の urgency_id 冪等 ALTER
- [x] PR-2: surveys 書き手（domain/API/SurveyForm）
- [x] PR-2: answers 書き手（RecordInterviewSchema/API/InterviewForm）
- [x] PR-2: コードレビュー（code BLOCKER→修正→APPROVE / security APPROVE）→ [#63](https://github.com/sasakiyusuke2017015/waoon/pull/63)
- [ ] 笹木さん #63 マージ承認
- [ ] マージ後検証（dev 実機: 緊急度マスタ CRUD / SurveyForm・InterviewForm で設定・保持・クリア / 非 admin ガード）
