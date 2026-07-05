"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@ui-catalog/core/atoms";
import { BackButton, Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet } from "@/lib/api/client";
import { fmtDate } from "@/lib/surveys/format";
import { answerState, deadlineInfo } from "@/lib/surveys/status";
import { AnswerForm, type AnswerQuestion } from "@/components/survey/AnswerForm";

type Detail = {
  publication: {
    publicationId: string;
    publicationTitle: string | null;
    status: number;
    startAt: string | null;
    endAt: string | null;
    surveyTitle: string;
  };
  questions: AnswerQuestion[];
  answer: { id: string; status: number; answerJson: Record<string, string | string[]> } | null;
};

export default function AnswerPage({ params }: { params: Promise<{ publishId: string }> }) {
  const { publishId } = use(params);
  const router = useRouter();
  const { shapes } = useTheme();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["pub-detail", publishId],
    queryFn: () => apiGet<{ data: Detail }>(`/api/v1/publications/${publishId}/detail`),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <BackButton label="一覧へ戻る" onClick={() => router.push("/surveys")} />
        <div className="space-y-2" aria-hidden="true">
          <div className="h-7 w-2/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-64 animate-pulse bg-gray-100" style={{ borderRadius: shapes.cardRadius }} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <BackButton label="一覧へ戻る" onClick={() => router.push("/surveys")} />
        <div
          className="rounded border border-dashed border-red-300 p-6 text-center"
          style={{ borderRadius: shapes.cardRadius }}
        >
          <p className="text-sm text-red-600">
            {(error as Error)?.message ?? "読み込みに失敗しました"}
          </p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => refetch()} borderRadius={shapes.buttonRadius}>
              再試行
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const d = data.data;
  const state = answerState(d.answer?.id ?? null, d.answer?.status ?? null);
  const deadline = state === "submitted" ? null : deadlineInfo(d.publication.endAt);
  return (
    <div className="space-y-4">
      <BackButton label="一覧へ戻る" onClick={() => router.push("/surveys")} />
      <div className="space-y-1">
        <h1 className="text-xl font-bold">
          {d.publication.publicationTitle || d.publication.surveyTitle}
        </h1>
        <p className="text-sm text-gray-500">{d.publication.surveyTitle}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-gray-500">
            期間: {fmtDate(d.publication.startAt)} 〜 {fmtDate(d.publication.endAt)}
          </span>
          {deadline && <Badge value={deadline.label} color={deadline.color} size="small" appearance="status" />}
          {state === "submitted" && <Badge value="回答済み" color="green" size="small" appearance="status" />}
          {state === "draft" && <Badge value="下書き" color="orange" size="small" appearance="status" />}
        </div>
      </div>
      <AnswerForm
        publicationId={publishId}
        questions={d.questions}
        initial={d.answer?.answerJson}
      />
    </div>
  );
}
