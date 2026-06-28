"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@ui-catalog/core/molecules";
import { apiGet } from "@/lib/api/client";
import { AnswerForm, type AnswerQuestion } from "@/components/survey/AnswerForm";

type Detail = {
  publication: {
    publicationId: string;
    publicationTitle: string | null;
    status: number;
    surveyTitle: string;
  };
  questions: AnswerQuestion[];
  answer: { id: string; status: number; answerJson: Record<string, string | string[]> } | null;
};

export default function AnswerPage({ params }: { params: Promise<{ publishId: string }> }) {
  const { publishId } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pub-detail", publishId],
    queryFn: () => apiGet<{ data: Detail }>(`/api/v1/publications/${publishId}/detail`),
  });

  if (isLoading) return <div className="text-sm text-gray-500">読み込み中...</div>;
  if (isError || !data) {
    return (
      <div className="space-y-3">
        <BackButton label="一覧へ戻る" onClick={() => router.push("/surveys")} />
        <p className="text-sm text-red-600">
          {(error as Error)?.message ?? "読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const d = data.data;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackButton label="一覧へ戻る" onClick={() => router.push("/surveys")} />
      <div>
        <h1 className="text-xl font-bold">
          {d.publication.publicationTitle || d.publication.surveyTitle}
        </h1>
        <p className="text-sm text-gray-500">{d.publication.surveyTitle}</p>
      </div>
      <AnswerForm
        publicationId={publishId}
        questions={d.questions}
        initial={d.answer?.answerJson}
      />
    </div>
  );
}
