# Plan: 設問マスタ（設問バンク）＋ seed 選択肢の文言化

| 項目 | 値 |
|---|---|
| 概要 | 設問を `/admin/questions` のマスタに昇格＋アンケート編集はマスタ設問を「呼ぶ／外す」形へ（link/unlink API・eval_item 入力追加）。radio seed を同意度 5 段階で文言化。緊急度マスタは Phase2/別 Plan に分離（値域 code+label 確定） |
| ステータス | 🟢 マージ済み（検証中） |
| PR | PR-A: [#60](https://github.com/sasakiyusuke2017015/waoon/pull/60) / PR-B: [#61](https://github.com/sasakiyusuke2017015/waoon/pull/61) |
| Review | [計画(Claude)](../reviews/2026-06-29-1352-survey-question-master-review.md) / [計画(Codex)](../reviews/2026-06-29-1400-survey-question-master-review.md) / [再計画(Codex)](../reviews/2026-06-29-1410-survey-question-master-review.md) / [コード PR-A(Codex)](../reviews/2026-06-29-1438-survey-question-master-code-review.md) / [コード PR-B(agent)](../reviews/2026-06-29-1512-survey-question-master-code-review-prb.md) |

---

## 目的

旧 1on1 では設問・選択肢を **マスタ（設問バンク）** で持ち、複数アンケートから
使い回していた。waoon は DB レベルでは `questions`（マスタ）+ `survey_questions`（M:N）で
その構造を持つが、**UI が「アンケート編集内で毎回新規設問を作る」運用しかない**ため、
実質マスタとして機能していない。

これを、組織マスタ / 役職マスタと並ぶ **「設問マスタ」** として管理画面に昇格させ、
アンケート編集では **マスタ設問を「呼んで紐づける／外す」** 形にする。あわせてデモ seed の
radio 選択肢に文言を入れる。

> **緊急度マスタは本 Plan のスコープ外**（Phase 2 / 別 Plan）。計画レビュー 2 件で
> 「書き手 UI・値域が未確定のまま FK カラムを足すと dead column / 後戻り」と指摘されたため、
> 設問マスタの確定済み範囲を先に出し、緊急度は独立 Plan に切り出す（後述「Phase 2」）。

## スコープ

### やること（確定 / 本 Plan）

1. **設問マスタ画面（設問バンク）**
   - `/admin/questions` 一覧 / `/admin/questions/new` 新規 / `/admin/questions/[id]/edit` 編集・削除。
   - `GET /api/v1/questions`（マスタ一覧・認証済み select）/ `POST /api/v1/questions`
     （survey に紐づけないスタンドアロン作成・admin write）を新設。`PUT/DELETE /api/v1/questions/[id]`
     は既存を流用（**DELETE = マスタごと削除**。FK CASCADE で全 `survey_questions` リンクも消える）。
   - 設問フォームの項目: 質問文 / 回答形式（`QUESTION_TYPES` 7 種）/ 選択肢（choice 系のみ）/
     必須 / **評価項目（`eval_item`）**。
   - ナビに「設問マスタ」を追加（admin 限定、`navItems.ts`）。

2. **アンケート編集を「マスタ設問を呼ぶ／外す」形へ**
   - 既存 `QuestionsEditor` に **「マスタから設問を追加」** 導線（既存 `questions` を検索・選択 →
     `survey_questions` にリンク）。
   - **リンク API**: `POST /api/v1/surveys/[id]/questions/link`（`questionId` を受けて
     `survey_questions` に末尾 sort_order で INSERT。重複は PK 衝突 → 409 を `mapDbError` で）。
   - **リンク解除 API**: `DELETE /api/v1/surveys/[id]/questions/[questionId]`
     （`survey_questions` の 1 行のみ削除。`questions` 本体・他 survey のリンクは残す）。
   - 既存の「その場で新規作成して紐づける」`POST /api/v1/surveys/[id]/questions` は **当面残す**
     （マスタに無い設問をその場で足す導線。作成された設問は同じ `questions` 表なので自動でマスタにも載る）。
   - UI: アンケート編集の各設問行のアクションを **「このアンケートから外す（解除）」**= unlink API、
     **マスタごと削除は設問マスタ画面側に寄せる**（取り違え事故防止）。

3. **デモ seed の選択肢を文言化**
   - `questions.csv` に `choices` 列を追加（**CSV 内はカンマ衝突を避け `|` 区切り**、choice 系のみ値・他は空）。
   - `seed-from-csv.mjs:248` の `radio → ["1".."5"]` ハードコードを撤廃し、CSV の `choices` を
     `|` で分割して jsonb 配列にする。
   - radio のデフォルト文言は **同意度 5 段階**: `そう思う / ややそう思う / どちらともいえない /
     あまりそう思わない / そう思わない`（元データは Pleasanter 由来で復元不能のため新規採用）。

### やらないこと（スコープ外）

- **緊急度マスタ**（Phase 2 / 別 Plan。値域は code+label〈高/中/低〉で確定済み・後述）。
- AI プロンプト列（`surveys.base_prompt` 等）の編集 UI（Phase 2 / Coming Soon のまま）。
- 設問のバージョニング / 履歴管理（マスタ設問を編集すると過去アンケートにも波及する点は
  「現状仕様」として受容。スナップショット化は将来検討）。
- 回答集計ロジックの変更（レーダーは `answers.evaluation` 由来で選択肢文言と無関係）。
- アンケート概念の刷新（テンプレート / ひな形）。既存 `/admin/surveys` はそのまま使い、
  ナビ表記の整合のみ（下記）。

## 現状コンテキスト

- **DB**: `questions`（body / answer_type / choices(jsonb) / eval_item / weight / tags / required /
  has_extra_field / sort_order）+ `survey_questions`（survey_id, question_id, sort_order の M:N）が
  既存（[40_surveys.sql](../../packages/db/schema/40_surveys.sql)）。設問はマスタ前提の設計。
- **RLS**: [99_rls.sql](../../packages/db/schema/99_rls.sql) のマスタ系ループで `questions` /
  `survey_questions` は **select=認証済み / write=admin** が既に有効（ENABLE も済み）。本 Plan は
  新規テーブルを作らないので RLS 変更なし。
- **API（既存）**:
  - `GET/POST /api/v1/surveys/[id]/questions`（POST は新規作成＋リンク）
  - `PUT/DELETE /api/v1/questions/[id]`（**DELETE はマスタ削除＝ FK CASCADE で全リンク消去**）
  - `PUT /api/v1/surveys/[id]/questions/reorder`
  - **不足**: `GET /api/v1/questions`（マスタ一覧）, `POST /api/v1/questions`（非リンク作成）,
    `POST /api/v1/surveys/[id]/questions/link`（既存設問のリンク）,
    `DELETE /api/v1/surveys/[id]/questions/[questionId]`（**リンク解除**）。
  - master write は `withActiveUser + RLS WITH CHECK(admin)` で担保（既存 [positions/route.ts](../../apps/web/app/api/v1/positions/route.ts) と同一パターン。app 層に明示 admin チェックは置かない既存方針）。
- **UI（既存）**:
  - [QuestionsEditor.tsx](../../apps/web/components/admin/QuestionsEditor.tsx): 設問の追加 / 編集
    （選択肢「1 行 1 つ」）/ 並べ替え / 削除。内部に `QuestionForm` あり。
    **ただし現行 `QuestionForm` の Draft は `body/answerType/choicesText/required` のみで
    `eval_item` 入力が無い** → 設問マスタでは eval_item セレクタを追加する。
  - マスタ共通基盤 `MasterListView` + `MASTER_CONFIGS`（[master-config.ts](../../apps/web/lib/admin/master-config.ts)）。
    ただし code+name の単純マスタ専用（text/number のみ）。設問は選択肢（複数行）・回答形式（select）・
    評価項目を持つため **MasterConfig には収まらず専用フォーム**を使う。
- **ナビ**: [navItems.ts](../../apps/web/components/layout/navItems.ts) の admin 限定項目
  （ユーザー / アンケート / 回答・面談 / 組織 / 役職マスタ）に「設問マスタ」を追加。
- **seed**: `questions.csv` は `body,answer_type,eval_item,required,sort_order`（choices 列なし）。
  ローダが radio に一律 `["1".."5"]` を付与（文言なし）。

## 実装計画

PR 分割: **PR-A = seed 文言（即出し可・独立）** / **PR-B = 設問マスタ + リンク/解除導線**。
各段で `pnpm -r typecheck`、DB に触る段は `pnpm test:db`（pgTAP）。

### PR-A: seed の選択肢文言化

1. `questions.csv` に `choices` 列追加（`|` 区切り、radio に同意度 5 段階、textarea は空）。
2. `seed-from-csv.mjs` の questions ローダを CSV `choices` の `|` 分割参照に変更
   （radio ハードコード撤廃）。
3. `--demo` 再投入で回答画面のタイルが文言表示になることを確認。

### PR-B: 設問マスタ + アンケート編集のリンク/解除

1. **ドメイン**: `CreateQuestionSchema` を点検（`evalItem` / `choices` が含まれるか確認、
   不足なら追加）。設問マスタ一覧用の戻り型を整える。
2. **API**:
   - `GET /api/v1/questions`（認証済み select）/ `POST /api/v1/questions`（admin write、survey 非リンク作成）。
   - `POST /api/v1/surveys/[id]/questions/link`（既存設問を末尾 sort_order でリンク。重複 PK → 409）。
   - `DELETE /api/v1/surveys/[id]/questions/[questionId]`（`survey_questions` の該当 1 行のみ削除）。
3. **UI: 設問マスタ**:
   - `QuestionForm` を `components/admin/QuestionForm.tsx` に切り出し、**`eval_item` セレクタ
     （`EVAL_ITEMS` 由来）を追加**。QuestionsEditor と設問マスタ画面の双方で使う。
   - `/admin/questions`（一覧: `AdminListTable` 流用）/ `new` / `[id]/edit`。
   - `navItems.ts` に「設問マスタ」追加。アンケートのナビ表記を「アンケート」のまま据え置く
     （アンケートマスタ概念は導入しない）。
4. **UI: アンケート編集**:
   - QuestionsEditor に「マスタから追加」モード（設問検索 → 選択 → link API）。
   - 設問行のアクションを「このアンケートから外す（unlink API）」に変更。マスタ削除は設問マスタ画面へ。

## 検証

- `pnpm -r typecheck` / `pnpm --filter @waoon/web build`。
- `pnpm test:db`（pgTAP）: 既存 questions/survey_questions RLS の回帰のみ（新テーブルなし）。
- API 振る舞い（手動 or integration）:
  - `GET /api/v1/questions` は認証済みで 200 / `POST /api/v1/questions` は **非 admin で拒否**。
  - `/questions/link` の **重複リンクが 409**。
  - **リンク解除しても `questions` 本体と他 survey のリンクは残る**（unlink の局所性）。
  - **マスタ削除は設問マスタ画面からのみ**実行され、cascade で全リンクが消えることを把握した上で行う。
- ブラウザ手動:
  - 設問マスタ CRUD（**eval_item を選択**・選択肢の改行入力 → 回答画面で文言表示）。
  - アンケート編集でマスタ設問を検索・リンク・解除。
  - 非 admin で各マスタ画面がガードされること（`(admin)/layout.tsx` + RLS）。
- seed: `--demo` 再投入 → 回答画面の radio タイルが同意度 5 段階で表示。

## リスク

- **マスタ設問の編集波及**: マスタ設問を編集すると、それを使う全アンケート（および既存回答の
  設問表示）に波及する。MVP は「波及する仕様」で受容。スナップショット化は別 Plan。
- **「削除」の二義性**: アンケートからの「外す」（unlink）とマスタ削除を UI で取り違えると、
  他アンケートの設問を巻き込む事故になる。→ unlink 専用 API を用意し、マスタ削除導線は
  設問マスタ画面に隔離。ボタン文言・確認ダイアログで明確化。
- **MasterConfig の表現力**: 設問は code+name に収まらない。MasterListView を無理に拡張せず
  専用フォームにする（過度な汎用化を避ける）。

## 残課題（後追い・差し戻し不要）

- [NICE-TO-HAVE / 再計画レビュー(Codex)] アンケート編集内の inline「編集」も
  `PUT /api/v1/questions/[id]` 経由の **マスタ編集**で、その設問を使う他アンケートにも波及する。
  削除は「外す / マスタ削除」を分離済みだが、**編集についても UI 文言・確認ダイアログで
  「他アンケートにも反映される」旨を示す**と事故を減らせる。実装時に吸収する。

## Phase 2（別 Plan に切り出し）: 緊急度マスタ

本 Plan では実装しない。着手時に別 Plan を立てる。確定済み事項を記録:

- **値域は code+label（高/中/低）に確定**（例 1=低 / 2=中 / 3=高）。MasterListView に config 追加で載る。
- **緊急度は surveys / answers 両方から参照する共通マスタ**（笹木さん判断「両方に使う」）。
- スキーマ注意（着手時に必須）:
  - 新規 `urgency_levels` は **FK 順序のため 40 より前の番号**（例 `35_urgency.sql`）で作成。
  - **`ALTER TABLE public.urgency_levels ENABLE ROW LEVEL SECURITY;` を明示**（99_rls.sql は
    各テーブルを明示 ENABLE してから policy を作る構造。ループ配列追加だけでは ENABLE されず、
    `GRANT ON ALL TABLES` 下で任意認証ユーザーが書けてしまう）。pgTAP で「非 admin write 拒否」まで検証。
  - `surveys` / `answers` への列追加は冪等 ALTER:
    `ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);`
    （`CREATE TABLE` 編集は既存 DB に反映されない＝ silent no-op）。
  - **書き手（誰がどの画面で設定するか）を Phase 2 Plan で確定してから列を足す**（dead column 回避）。
    `answers` の write RLS は本人/面談者/viewer/admin。

## 未確定事項

- なし（本 Plan の確定範囲）。アンケートのテンプレート概念は導入せず、緊急度は Phase 2 に分離済み。

## 判断ログ

| 日付 | 判断 | 理由 |
|---|---|---|
| 2026-06-29 | 設問は MasterConfig 汎用ではなく専用フォームで実装 | 選択肢/回答形式/評価項目を持ち code+name に収まらない |
| 2026-06-29 | radio 選択肢の元文言は復元せず新規採用 | 旧文言は Pleasanter 側にあり旧ソースに無い（zip 全文検索で未検出） |
| 2026-06-29 | マスタ設問編集の波及は MVP で受容 | スナップショット化は影響大。別 Plan に切り出す |
| 2026-06-29 | 緊急度は共通マスタとし surveys / answers 両方から参照 | 笹木さん判断「両方に使う」 |
| 2026-06-29 | **緊急度マスタを本 Plan から外し Phase 2 / 別 Plan へ分離** | 計画レビュー 2 件が「書き手 UI・値域 未確定のまま FK カラム追加 = dead column / 後戻り」を BLOCKER 指摘。設問マスタの確定範囲を先に出す |
| 2026-06-29 | **緊急度の値域 = code+label（高/中/低）に確定** | 組織/役職マスタと同型で MasterListView に載るため。Phase 2 用に記録 |
| 2026-06-29 | **radio デフォルト = 同意度 5 段階** | 笹木さん選択。seed と新規設問のデフォルトに使う |
| 2026-06-29 | **リンク解除専用 API（unlink）を追加** | Codex 指摘: link のみで unlink が無く、既存 DELETE /questions/[id] はマスタ削除＋cascade。UI 文言だけだと他アンケートを巻き込む |
| 2026-06-29 | **QuestionForm に eval_item 入力を追加**（切り出しでなく拡張） | Claude 指摘: 現行フォームに eval_item が無く、radar 連携キーを設定できない |
| 2026-06-29 | **PR を A(seed 文言)/B(設問マスタ+リンク導線) に分割** | 1 Plan に機能過多。レビュー/ロールバック単位を小さく |

## ステータス

- [x] 緊急度の扱いを確定（Phase 2 / 別 Plan に分離・値域 code+label）
- [x] radio 文言を確定（同意度 5 段階）
- [x] 計画レビュー 2 件（Claude / Codex）の指摘を反映
- [x] 再計画レビュー（Codex）APPROVE
- [x] 笹木さん着手承認（app-shell #59 先行マージ → develop 同期済み）
- [x] PR-A: seed の choices 文言化（同意度 5 段階）→ コードレビュー APPROVE → [#60](https://github.com/sasakiyusuke2017015/waoon/pull/60)
- [x] PR-B: 設問マスタ UI（QuestionForm 切り出し + eval_item + 画面 + ナビ）
- [x] PR-B: API（questions 一覧・作成 / link / unlink）
- [x] PR-B: アンケート編集の「マスタから呼ぶ／外す」導線
- [x] PR-B: コードレビュー（code-reviewer / security-reviewer）APPROVE → [#61](https://github.com/sasakiyusuke2017015/waoon/pull/61)
- [x] 検証（typecheck / build / lint green）
- [x] 笹木さん #60 / #61 マージ承認（develop へマージ済み）
- [ ] マージ後検証（dev 実機）
  - [ ] クリーン再投入で回答画面の radio が同意度 5 段階で表示
  - [ ] 設問マスタ `/admin/questions` の CRUD（eval_item・選択肢の改行入力）
  - [ ] アンケート編集で「マスタから追加」「外す(unlink)」が効く（他アンケートを巻き込まない）
  - [ ] 非 admin で設問マスタ画面がガードされる（(admin)/layout.tsx + RLS）
