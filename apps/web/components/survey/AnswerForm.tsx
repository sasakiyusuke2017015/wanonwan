"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerType } from "@waoon/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { Radio, Checkbox, TextArea } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError, apiSend } from "@/lib/api/client";
import { requiredFieldErrors } from "@/lib/forms/field-errors";
import { FormActions } from "@/components/admin/FormActions";

export type AnswerQuestion = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
};

type Values = Record<string, string | string[]>;

const isAnswered = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v.length > 0 : Boolean(v && v.trim());

export function AnswerForm({
  publicationId,
  questions,
  initial,
}: {
  publicationId: string;
  questions: AnswerQuestion[];
  initial?: Values;
}) {
  const router = useRouter();
  const { shapes } = useTheme();
  const [values, setValues] = useState<Values>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const setVal = (qid: string, val: string | string[]) =>
    setValues((prev) => ({ ...prev, [qid]: val }));

  function toggleCheckbox(qid: string, opt: string, checked: boolean) {
    const cur = Array.isArray(values[qid]) ? (values[qid] as string[]) : [];
    setVal(qid, checked ? [...cur, opt] : cur.filter((x) => x !== opt));
  }

  function renderInput(q: AnswerQuestion) {
    const val = values[q.id];
    const strVal = typeof val === "string" ? val : "";
    switch (q.answerType) {
      case "radio":
        return (
          <div className="space-y-1">
            {q.choices.map((c) => (
              <Radio
                key={c}
                name={q.id}
                label={c}
                checked={val === c}
                onChange={() => setVal(q.id, c)}
              />
            ))}
          </div>
        );
      case "select":
        return (
          <Select
            options={q.choices.map((c) => ({ value: c, label: c }))}
            value={strVal || undefined}
            onChange={(v) => setVal(q.id, v == null ? "" : String(v))}
            allowEmpty
            placeholder="（選択してください）"
            borderRadius={shapes.inputRadius}
          />
        );
      case "checkbox":
        return (
          <div className="space-y-1">
            {q.choices.map((c) => {
              const arr = Array.isArray(val) ? val : [];
              return (
                <Checkbox
                  key={c}
                  label={c}
                  checked={arr.includes(c)}
                  onChange={(e) => toggleCheckbox(q.id, c, e.target.checked)}
                />
              );
            })}
          </div>
        );
      case "textarea":
        return (
          <TextArea
            value={strVal}
            onChange={(e) => setVal(q.id, e.target.value)}
            borderRadius={shapes.inputRadius}
          />
        );
      default:
        return (
          <Input
            type={q.answerType === "tel" ? "tel" : "text"}
            value={strVal}
            onChange={(e) => setVal(q.id, e.target.value)}
            borderRadius={shapes.inputRadius}
          />
        );
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = requiredFieldErrors(questions, (q) => isAnswered(values[q.id]));
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError(null);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await apiSend(`/api/v1/publications/${publicationId}/answer`, "POST", { answers: values });
      router.push("/surveys");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "送信に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  if (questions.length === 0) {
    return <p className="text-sm text-gray-500">設問がありません。</p>;
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <ContentBlock title="設問">
        <div className="space-y-5">
          {questions.map((q, i) => (
            <FormField
              key={q.id}
              label={`${i + 1}. ${q.body}`}
              required={q.required}
              error={fieldErrors[q.id]}
            >
              {renderInput(q)}
            </FormField>
          ))}
        </div>
      </ContentBlock>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions submitLabel="回答を送信" pendingLabel="送信中..." pending={busy} />
    </form>
  );
}
