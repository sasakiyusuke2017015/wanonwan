"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerType } from "@wanonwan/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { TextArea, Radio, Checkbox } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { useAppToast } from "@ui-catalog/core/providers";
import { ApiError, apiSend } from "@/lib/api/client";
import { requiredFieldErrors } from "@/lib/forms/field-errors";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { FormActions } from "@/components/admin/FormActions";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

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
  const { colors, shapes } = useTheme();
  const { showToast } = useAppToast();
  const [values, setValues] = useState<Values>(initial ?? {});
  const [baseline, setBaseline] = useState<Values>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useUnsavedChangesGuard(isDirtyPayload(values, baseline));

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
        // 旧 1on1 踏襲: 選択タイルのグリッド（選択時にテーマ色で塗る）。
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {q.choices.map((c) => {
              const selected = val === c;
              return (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                  style={{
                    borderRadius: shapes.inputRadius,
                    backgroundColor: selected ? colors.primaryBgColor : undefined,
                    color: selected ? colors.primaryContrastText : undefined,
                    borderColor: selected ? colors.primaryBgColor : colors.secondaryBorderColor,
                  }}
                >
                  <Radio
                    name={q.id}
                    value={c}
                    checked={selected}
                    onChange={() => setVal(q.id, c)}
                    size="small"
                  />
                  <span>{c}</span>
                </label>
              );
            })}
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
        // 旧 1on1 踏襲: 選択タイルのグリッド（複数選択、選択時にテーマ色で塗る）。
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {q.choices.map((c) => {
              const arr = Array.isArray(val) ? val : [];
              const checked = arr.includes(c);
              return (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                  style={{
                    borderRadius: shapes.inputRadius,
                    backgroundColor: checked ? colors.primaryBgColor : undefined,
                    color: checked ? colors.primaryContrastText : undefined,
                    borderColor: checked ? colors.primaryBgColor : colors.secondaryBorderColor,
                  }}
                >
                  <Checkbox
                    value={c}
                    checked={checked}
                    onChange={(e) => toggleCheckbox(q.id, c, e.target.checked)}
                    size="small"
                  />
                  <span>{c}</span>
                </label>
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
      setBaseline(values); // 送信成功で baseline をリセット（離脱ガードが暴発しないように）
      showToast("保存しました", { type: "success" });
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
    <form onSubmit={submit} className="space-y-4">
      <ContentBlock>
        <div className="space-y-6">
          {questions.map((q, i) => (
            <FormField
              key={q.id}
              variant="question"
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
