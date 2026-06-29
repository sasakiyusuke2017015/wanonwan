# Review: survey-seed-choices code

| 項目 | 値 |
|---|---|
| レビュー種別 | コード |
| 対象ブランチ | `feature/survey-seed-choices` |
| 対象コミット | `f3dba89` feat: デモ seed の radio 選択肢を文言化（同意度 5 段階） |
| 対象 Plan | [2026-06-29-1327-survey-question-master.md](../plans/2026-06-29-1327-survey-question-master.md) PR-A |
| 作成 | 2026-06-29 14:38 JST |
| verdict | APPROVE |

## 指摘

なし。

## 確認内容

- `packages/db/seed/csv/questions.csv` は `body,answer_type,choices,eval_item,required,sort_order` のヘッダに更新され、`scripts/seed-from-csv.mjs` の `seedDemoTable("questions", ["body", "answer_type", "choices", "eval_item", "required", "sort_order"], ...)` と整合している。
- `csv-parse` は `columns:true, trim:true` で、radio 行の `choices` は `|` 区切り文字列として、textarea 行は空文字として読めることを確認した。
- `jsonbStringArray()` は空配列を `'[]'::jsonb` にし、値ありの場合は各要素を既存 `sqlStr()` で single-quote エスケープして `to_jsonb(ARRAY[...]::text[])` を生成している。日本語、カンマ、シングルクォート、バックスラッシュは SQL 文字列要素として扱われ、jsonb 文字列配列になる。
- radio 以外で `choices` が空の場合は `[]` になり、現行 `questions.choices jsonb NOT NULL DEFAULT '[]'::jsonb` と整合する。将来 select/checkbox に `choices` が入っても同じロジックで投入される。
- 既存の非空テーブルスキップ挙動は変わっていないため、文言化は新規投入またはクリーン再投入で反映される。Plan の PR-A 節と整合している。

## verdict

APPROVE
