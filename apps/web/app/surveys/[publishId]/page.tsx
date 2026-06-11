"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { AnswerForm, type AnswerQuestion } from "@/components/survey/AnswerForm";

type Detail = {
  publication: { publicationId: string; publicationTitle: string | null; status: number; surveyTitle: string };
  questions: AnswerQuestion[];
  answer: { id: string; status: number; answerJson: Record<string, string | string[]> } | null;
};

export default function AnswerPage({ params }: { params: Promise<{ publishId: string }> }) {
  const { publishId } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pub-detail", publishId],
    queryFn: () => apiGet<{ data: Detail }>(`/api/v1/publications/${publishId}/detail`),
  });

  if (isLoading) return <main className="p-6 text-sm text-gray-500">読み込み中...</main>;
  if (isError || !data) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-600">{(error as Error)?.message ?? "読み込みに失敗しました"}</p>
        <Link href="/surveys" className="text-sm text-blue-600 underline">一覧へ</Link>
      </main>
    );
  }

  const d = data.data;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/surveys" className="text-sm text-blue-600 underline">← 一覧へ</Link>
      <h1 className="mt-2 text-xl font-bold">{d.publication.publicationTitle || d.publication.surveyTitle}</h1>
      <p className="mb-6 text-sm text-gray-500">{d.publication.surveyTitle}</p>
      <AnswerForm publicationId={publishId} questions={d.questions} initial={d.answer?.answerJson} />
    </main>
  );
}
