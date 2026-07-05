"use client";

import { useState } from "react";
import {
  CHOICE_TYPES,
  CreateQuestionSchema,
  EVAL_ITEMS,
  QUESTION_TYPES,
  type AnswerType,
} from "@waoon/domain";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { TextArea, Checkbox } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError } from "@/lib/api/client";
import { fieldErrorsOf } from "@/lib/forms/field-errors";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { FormActions } from "@/components/admin/FormActions";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

export type QuestionDraft = {
  body: string;
  answerType: AnswerType;
  choicesText: string;
  required: boolean;
  evalItem: string; // "" = 評価項目なし
};

export const EMPTY_QUESTION: QuestionDraft = {
  body: "",
  answerType: "text",
  choicesText: "",
  required: false,
  evalItem: "",
};

// Draft を API ペイロード（CreateQuestionSchema）へ。choice 系以外は choices を空配列にする。
// evalItem は未選択("")なら送らず、API 側で null になる。
export function questionDraftToPayload(d: QuestionDraft) {
  const choices = CHOICE_TYPES.includes(d.answerType)
    ? d.choicesText.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    body: d.body,
    answerType: d.answerType,
    choices,
    required: d.required,
    evalItem: d.evalItem || undefined,
  };
}

const TYPE_OPTIONS = QUESTION_TYPES.map((t) => ({ value: t.value, label: t.label }));
const EVAL_OPTIONS = EVAL_ITEMS.map((it) => ({ value: it.key, label: it.label }));

// 設問の作成 / 編集フォーム。設問マスタ画面とアンケート編集内の双方で使う共通部品。
export function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: QuestionDraft;
  submitLabel: string;
  onSubmit: (draft: QuestionDraft) => Promise<void>;
  onCancel?: () => void;
}) {
  const { shapes } = useTheme();
  const [draft, setDraft] = useState<QuestionDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const needChoices = CHOICE_TYPES.includes(draft.answerType);

  useUnsavedChangesGuard(isDirtyPayload(draft, initial));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const errs = fieldErrorsOf(CreateQuestionSchema, questionDraftToPayload(draft));
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
          setError(null);
          return;
        }
        setError(null);
        setBusy(true);
        try {
          await onSubmit(draft);
          if (!onCancel) setDraft(initial); // 追加フォームはクリア
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "保存に失敗しました");
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-3"
    >
      <FormField label="質問文" required error={fieldErrors.body}>
        <Input
          value={draft.body}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          borderRadius={shapes.inputRadius}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="回答形式">
          <Select
            options={TYPE_OPTIONS}
            value={draft.answerType}
            onChange={(v) => setDraft((d) => ({ ...d, answerType: (v ?? "text") as AnswerType }))}
            borderRadius={shapes.inputRadius}
          />
        </FormField>
        <FormField label="評価項目">
          <Select
            options={EVAL_OPTIONS}
            value={draft.evalItem || undefined}
            onChange={(v) => setDraft((d) => ({ ...d, evalItem: v == null ? "" : String(v) }))}
            allowEmpty
            emptyLabel="評価項目なし"
            placeholder="評価項目なし"
            borderRadius={shapes.inputRadius}
          />
        </FormField>
      </div>
      <Checkbox
        label="必須"
        checked={draft.required}
        onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
      />
      {needChoices && (
        <FormField label="選択肢（1 行に 1 つ）">
          <TextArea
            value={draft.choicesText}
            onChange={(e) => setDraft((d) => ({ ...d, choicesText: e.target.value }))}
            rows={3}
            borderRadius={shapes.inputRadius}
          />
        </FormField>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <FormActions submitLabel={submitLabel} pending={busy} onCancel={onCancel} />
    </form>
  );
}
