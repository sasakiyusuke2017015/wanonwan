"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerType } from "@waoon/domain";
import { ApiError, apiSend } from "@/lib/api/client";

export type AnswerQuestion = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
};

type Values = Record<string, string | string[]>;

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
  const [values, setValues] = useState<Values>(initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setVal = (qid: string, val: string | string[]) =>
    setValues((prev) => ({ ...prev, [qid]: val }));

  function toggleCheckbox(qid: string, opt: string, checked: boolean) {
    const cur = Array.isArray(values[qid]) ? (values[qid] as string[]) : [];
    setVal(qid, checked ? [...cur, opt] : cur.filter((x) => x !== opt));
  }

  function renderInput(q: AnswerQuestion) {
    const val = values[q.id];
    switch (q.answerType) {
      case "radio":
        return (
          <div className="space-y-1">
            {q.choices.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={val === c}
                  onChange={() => setVal(q.id, c)}
                  required={q.required}
                />
                {c}
              </label>
            ))}
          </div>
        );
      case "select":
        return (
          <select
            className={cls}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setVal(q.id, e.target.value)}
            required={q.required}
          >
            <option value="">（選択してください）</option>
            {q.choices.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-1">
            {q.choices.map((c) => {
              const arr = Array.isArray(val) ? val : [];
              return (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={arr.includes(c)}
                    onChange={(e) => toggleCheckbox(q.id, c, e.target.checked)}
                  />
                  {c}
                </label>
              );
            })}
          </div>
        );
      case "textarea":
        return (
          <textarea
            className={cls}
            rows={3}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setVal(q.id, e.target.value)}
            required={q.required}
          />
        );
      default:
        return (
          <input
            className={cls}
            type={q.answerType === "tel" ? "tel" : "text"}
            value={typeof val === "string" ? val : ""}
            onChange={(e) => setVal(q.id, e.target.value)}
            required={q.required}
          />
        );
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      {questions.map((q, i) => (
        <div key={q.id}>
          <div className="text-sm font-medium">
            {i + 1}. {q.body}
            {q.required && <span className="ml-1 text-red-500">*</span>}
          </div>
          <div className="mt-2">{renderInput(q)}</div>
        </div>
      ))}
      {questions.length === 0 && <p className="text-sm text-gray-500">設問がありません。</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy || questions.length === 0}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "送信中..." : "回答を送信"}
      </button>
    </form>
  );
}

const cls = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
