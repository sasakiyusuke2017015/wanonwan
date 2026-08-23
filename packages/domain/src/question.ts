import * as v from "valibot";

// questions（DDL: packages/db/migrations/0001_initial.sql）。回答形式は 7 種。
export const QUESTION_TYPES = [
  { value: "radio", label: "ラジオボタン" },
  { value: "select", label: "セレクトボックス" },
  { value: "checkbox", label: "チェックボックス" },
  { value: "text", label: "テキストボックス" },
  { value: "textarea", label: "テキストエリア" },
  { value: "tel", label: "電話番号" },
  { value: "postal", label: "郵便番号" },
] as const;

export const QUESTION_TYPE_VALUES = [
  "radio",
  "select",
  "checkbox",
  "text",
  "textarea",
  "tel",
  "postal",
] as const;

export const AnswerTypeSchema = v.picklist(QUESTION_TYPE_VALUES);
export type AnswerType = v.InferOutput<typeof AnswerTypeSchema>;

// 選択肢が必要な形式
export const CHOICE_TYPES: AnswerType[] = ["radio", "select", "checkbox"];

export const QuestionSchema = v.object({
  id: v.number(),
  body: v.string(),
  answerType: AnswerTypeSchema,
  choices: v.array(v.string()),
  required: v.boolean(),
  hasExtraField: v.boolean(),
  evalItem: v.nullable(v.string()),
  sortOrder: v.number(),
});
export type Question = v.InferOutput<typeof QuestionSchema>;

export const CreateQuestionSchema = v.object({
  body: v.pipe(v.string(), v.minLength(1)),
  answerType: AnswerTypeSchema,
  choices: v.optional(v.array(v.string())),
  required: v.optional(v.boolean()),
  hasExtraField: v.optional(v.boolean()),
  evalItem: v.optional(v.string()),
});
export type CreateQuestion = v.InferOutput<typeof CreateQuestionSchema>;

export const UpdateQuestionSchema = v.partial(CreateQuestionSchema);
export type UpdateQuestion = v.InferOutput<typeof UpdateQuestionSchema>;

export const ReorderQuestionsSchema = v.object({
  // 並び替え後の question id 順
  order: v.array(v.number()),
});

// 既存のマスタ設問をアンケートへリンクする（survey_questions に追加）。
export const LinkQuestionSchema = v.object({
  questionId: v.number(),
});
export type LinkQuestion = v.InferOutput<typeof LinkQuestionSchema>;
