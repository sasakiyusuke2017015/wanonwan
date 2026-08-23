import * as v from "valibot";

// 面談（answers の面談系カラム）。

// 面談方式
export const INTERVIEW_METHODS = [
  { value: 1, label: "対面" },
  { value: 2, label: "Web" },
  { value: 3, label: "電話" },
] as const;

// 健康状態（100-999）
export const HEALTH_STATUSES = [
  { value: 100, label: "未判定" },
  { value: 200, label: "非常に良好" },
  { value: 300, label: "良好" },
  { value: 400, label: "要観察" },
  { value: 500, label: "環境課題あり" },
  { value: 600, label: "不満あり" },
  { value: 700, label: "疲労あり" },
  { value: 800, label: "要注意" },
  { value: 900, label: "過重負荷" },
  { value: 999, label: "要緊急対応" },
] as const;
export const healthLabel = (s: number | null) =>
  s == null ? "—" : HEALTH_STATUSES.find((x) => x.value === s)?.label ?? String(s);

// 評価（固定 5 項目、各 0-5 想定）
export const EVAL_ITEMS = [
  { key: "satisfaction", label: "満足度" },
  { key: "workload", label: "業務負荷" },
  { key: "environment", label: "職場環境" },
  { key: "relationship", label: "人間関係" },
  { key: "stress", label: "ストレス" },
] as const;

// 回答状況
export const ANSWER_STATUSES = [
  { value: 100, label: "未回答" },
  { value: 200, label: "回答済" },
  { value: 400, label: "面談調整済" },
  { value: 900, label: "完了" },
] as const;
export const answerStatusLabel = (s: number | null) =>
  s == null ? "—" : ANSWER_STATUSES.find((x) => x.value === s)?.label ?? String(s);

// 面談担当の指名/解除（answers.interviewer_id）。null は担当解除。
export const AssignInterviewerSchema = v.object({
  interviewerId: v.nullable(v.number("interviewerId は数値です")),
});
export type AssignInterviewer = v.InferOutput<typeof AssignInterviewerSchema>;

export const RecordInterviewSchema = v.object({
  interviewAt: v.optional(v.nullable(v.string())),
  interviewMethod: v.optional(v.nullable(v.picklist([1, 2, 3]))),
  healthStatus: v.optional(v.nullable(v.number())),
  evaluation: v.optional(
    v.record(
      v.string(),
      v.pipe(
        v.number(),
        v.minValue(0, "評価は 0〜5 で入力してください"),
        v.maxValue(5, "評価は 0〜5 で入力してください"),
      ),
    ),
  ),
  interviewMemo: v.optional(v.nullable(v.string())),
  nextAction: v.optional(v.nullable(v.string())),
  // 緊急度マスタ(urgency_levels)への参照。未設定/クリアは null。
  urgencyId: v.optional(v.nullable(v.number())),
  // 記録後の回答状況（既定 900 完了）
  status: v.optional(v.number()),
});
export type RecordInterview = v.InferOutput<typeof RecordInterviewSchema>;
