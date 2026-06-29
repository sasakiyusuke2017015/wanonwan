"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUESTION_TYPES, type AnswerType } from "@waoon/domain";
import { apiGet, apiSend } from "@/lib/api/client";
import {
  QuestionForm,
  EMPTY_QUESTION,
  questionDraftToPayload,
} from "@/components/admin/QuestionForm";

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

type MasterQuestion = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
  hasExtraField: boolean;
  evalItem: string | null;
};

const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.value === t)?.label ?? t;

export function QuestionsEditor({ surveyId }: { surveyId: string }) {
  const qc = useQueryClient();
  const key = ["survey-questions", surveyId];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => apiGet<{ data: Question[] }>(`/api/v1/surveys/${surveyId}/questions`),
  });
  // マスタから追加する候補（既にリンク済みは除外）。
  const { data: master } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiGet<{ data: MasterQuestion[] }>(`/api/v1/questions`),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickId, setPickId] = useState<string>("");
  const questions = data?.data ?? [];
  const linkedIds = new Set(questions.map((q) => q.id));
  const masterOptions = (master?.data ?? []).filter((m) => !linkedIds.has(m.id));

  const reorder = useMutation({
    mutationFn: (order: number[]) => apiSend(`/api/v1/surveys/${surveyId}/questions/reorder`, "PUT", { order }),
    onSuccess: invalidate,
  });
  // アンケートから「外す」= リンク解除（マスタ本体・他アンケートは残る）。
  const unlink = useMutation({
    mutationFn: (id: string) => apiSend(`/api/v1/surveys/${surveyId}/questions/${id}`, "DELETE"),
    onSuccess: invalidate,
  });
  const link = useMutation({
    mutationFn: (questionId: number) =>
      apiSend(`/api/v1/surveys/${surveyId}/questions/link`, "POST", { questionId }),
    onSuccess: () => {
      setPickId("");
      invalidate();
    },
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
      <h2 className="mb-1 text-lg font-bold">設問</h2>
      <p className="mb-3 text-xs text-gray-500">
        「編集」はマスタ設問の編集です（この設問を使う他アンケートにも反映されます）。
        このアンケートだけから外したいときは「外す」を使ってください。
      </p>
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
                  evalItem: q.evalItem ?? "",
                }}
                submitLabel="更新"
                onCancel={() => setEditingId(null)}
                onSubmit={async (draft) => {
                  await apiSend(`/api/v1/questions/${q.id}`, "PUT", questionDraftToPayload(draft));
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
                  <button onClick={() => unlink.mutate(q.id)} className="text-red-600">外す</button>
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
        <h3 className="mb-2 text-sm font-semibold">マスタから追加</h3>
        {masterOptions.length === 0 ? (
          <p className="text-xs text-gray-400">追加できるマスタ設問がありません。</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              value={pickId}
              onChange={(e) => setPickId(e.target.value)}
            >
              <option value="">（設問を選択）</option>
              {masterOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.body}（{typeLabel(m.answerType)}）
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!pickId || link.isPending}
              onClick={() => pickId && link.mutate(Number(pickId))}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              追加
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 rounded border border-gray-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">新規作成して追加</h3>
        <p className="mb-2 text-xs text-gray-500">作成した設問はマスタにも登録されます。</p>
        <QuestionForm
          initial={EMPTY_QUESTION}
          submitLabel="追加"
          onSubmit={async (draft) => {
            await apiSend(`/api/v1/surveys/${surveyId}/questions`, "POST", questionDraftToPayload(draft));
            invalidate();
          }}
        />
      </div>
    </section>
  );
}
