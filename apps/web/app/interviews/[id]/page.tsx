"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { InterviewForm } from "@/components/admin/InterviewForm";

// 担当面談の詳細 + 面談記録。admin 画面と同じ answers API / InterviewForm を使うが、
// 担当者割り当て（admin 専用操作）は出さない。可視性は RLS（担当 or 本人 or 閲覧者 or admin）。
type Detail = {
  answer: {
    id: string;
    status: number;
    answerJson: Record<string, string | string[]>;
    respondentName: string;
    surveyTitle: string;
    publicationTitle: string | null;
    healthStatus: number | null;
    interviewMethod: number | null;
    interviewAt: string | null;
    interviewMemo: string | null;
    nextAction: string | null;
    urgencyId: number | null;
    evaluation: Record<string, number> | null;
    interviewerId: string | null;
  };
  questions: { id: string; body: string; answerType: string }[];
};

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answer", id],
    queryFn: () => apiGet<{ data: Detail }>(`/api/v1/answers/${id}`),
  });

  if (isLoading) return <p className="text-sm text-gray-500">読み込み中...</p>;
  if (isError || !data) {
    return (
      <div>
        <p className="text-sm text-red-600">{(error as Error)?.message ?? "読み込みに失敗しました"}</p>
        <Link href="/interviews" className="text-sm text-blue-600 underline">一覧へ</Link>
      </div>
    );
  }

  const { answer, questions } = data.data;
  const fmt = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));

  return (
    <div>
      <Link href="/interviews" className="text-sm text-blue-600 underline">← 一覧へ</Link>
      <h1 className="mt-2 text-xl font-bold">{answer.respondentName} さんの回答</h1>
      <p className="mb-6 text-sm text-gray-500">{answer.publicationTitle || answer.surveyTitle}</p>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-bold">回答内容</h2>
        <dl className="space-y-2 text-sm">
          {questions.map((q) => (
            <div key={q.id} className="rounded border border-gray-100 p-2">
              <dt className="text-gray-500">{q.body}</dt>
              <dd className="font-medium">{fmt(answer.answerJson?.[q.id]) || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">面談記録</h2>
        <InterviewForm answerId={id} initial={answer} />
      </section>
    </div>
  );
}
