import * as v from "valibot";

// surveys（DDL 40_surveys.sql）に対応するドメイン型 + バリデータ。
export const SURVEY_STATUSES = ["draft", "active", "closed"] as const;
export const SurveyStatusSchema = v.picklist(SURVEY_STATUSES);
export type SurveyStatus = v.InferOutput<typeof SurveyStatusSchema>;

export const SurveySchema = v.object({
  id: v.number(),
  title: v.string(),
  status: SurveyStatusSchema,
  capacity: v.nullable(v.number()),
  requiresAuth: v.boolean(),
  usesAi: v.boolean(),
  urgencyId: v.nullable(v.number()),
});
export type Survey = v.InferOutput<typeof SurveySchema>;

export const CreateSurveySchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, "タイトルは必須です")),
  status: v.optional(SurveyStatusSchema),
  capacity: v.optional(v.pipe(v.number(), v.minValue(1, "定員は 1 以上で入力してください"))),
  requiresAuth: v.optional(v.boolean()),
  usesAi: v.optional(v.boolean()),
  urgencyId: v.optional(v.nullable(v.number())),
});
export type CreateSurvey = v.InferOutput<typeof CreateSurveySchema>;

export const UpdateSurveySchema = v.partial(CreateSurveySchema);
export type UpdateSurvey = v.InferOutput<typeof UpdateSurveySchema>;
