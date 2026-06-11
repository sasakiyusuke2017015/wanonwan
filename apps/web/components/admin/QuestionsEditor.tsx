"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CHOICE_TYPES, QUESTION_TYPES, type AnswerType } from "@waoon/domain";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

type Question = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
  hasExtraField: boolean;
  evalItem: string | null;
  sortOrder: number;
};

type Draft = {
  body: string;
  answerType: AnswerType;
  choicesText: string;
  required: boolean;
};

const EMPTY: Draft = { body: "", answerType: "text", choicesText: "", required: false };
const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.value === t)?.label ?? t;

function draftToPayload(d: Draft) {
  const choices = CHOICE_TYPES.includes(d.answerType)
    ? d.choicesText.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  return { body: d.body, answerType: d.answerType, choices, required: d.required };
}

export function QuestionsEditor({ surveyId }: { surveyId: string }) {
  const qc = useQueryClient();
  const key = ["survey-questions", surveyId];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => apiGet<{ data: Question[] }>(`/api/v1/surveys/${surveyId}/questions`),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [editingId, setEditingId] = useState<string | null>(null);
  const questions = data?.data ?? [];

  const reorder = useMutation({
    mutationFn: (order: number[]) => apiSend(`/api/v1/surveys/${surveyId}/questions/reorder`, "PUT", { order }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiSend(`/api/v1/questions/${id}`, "DELETE"),
    onSuccess: invalidate,
  });

  function move(index: number, dir: -1 | 1) {
    const next = [...questions];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    reorder.mutate(next.map((q) => Number(q.id)));
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">設問</h2>
      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}

      <ol className="space-y-2">
        {questions.map((q, i) => (
          <li key={q.id} className="rounded border border-gray-200 p-3">
            {editingId === q.id ? (
              <QuestionForm
                initial={{
                  body: q.body,
                  answerType: q.answerType,
                  choicesText: q.choices.join("\n"),
                  required: q.required,
                }}
                submitLabel="更新"
                onCancel={() => setEditingId(null)}
                onSubmit={async (draft) => {
                  await apiSend(`/api/v1/questions/${q.id}`, "PUT", draftToPayload(draft));
                  setEditingId(null);
                  invalidate();
                }}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-sm text-gray-400">{i + 1}.</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{q.body}</div>
                  <div className="text-xs text-gray-500">
                    {typeLabel(q.answerType)}
                    {q.required && " ・必須"}
                    {q.choices.length > 0 && ` ・選択肢 ${q.choices.length}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === questions.length - 1} className="disabled:opacity-30">↓</button>
                  <button onClick={() => setEditingId(q.id)} className="text-blue-600">編集</button>
                  <button onClick={() => remove.mutate(q.id)} className="text-red-600">削除</button>
                </div>
              </div>
            )}
          </li>
        ))}
        {questions.length === 0 && !isLoading && (
          <li className="rounded border border-dashed p-4 text-center text-sm text-gray-400">設問がありません</li>
        )}
      </ol>

      <div className="mt-4 rounded border border-gray-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">設問を追加</h3>
        <QuestionForm
          initial={EMPTY}
          submitLabel="追加"
          onSubmit={async (draft) => {
            await apiSend(`/api/v1/surveys/${surveyId}/questions`, "POST", draftToPayload(draft));
            invalidate();
          }}
        />
      </div>
    </section>
  );
}

function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (draft: Draft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needChoices = CHOICE_TYPES.includes(draft.answerType);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
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
      className="space-y-2"
    >
      <input
        className={cls}
        placeholder="質問文"
        value={draft.body}
        onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
        required
      />
      <div className="flex gap-2">
        <select
          className={cls}
          value={draft.answerType}
          onChange={(e) => setDraft((d) => ({ ...d, answerType: e.target.value as AnswerType }))}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
          />
          必須
        </label>
      </div>
      {needChoices && (
        <textarea
          className={cls}
          rows={3}
          placeholder="選択肢（1 行に 1 つ）"
          value={draft.choicesText}
          onChange={(e) => setDraft((d) => ({ ...d, choicesText: e.target.value }))}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">
          {busy ? "..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded border px-3 py-1.5 text-sm">
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}

const cls = "w-full rounded border border-gray-300 px-3 py-2 text-sm";
