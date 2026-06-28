"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SurveyCard } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet } from "@/lib/api/client";

type Row = {
  publicationId: string;
  publicationTitle: string | null;
  surveyTitle: string;
  startAt: string | null;
  endAt: string | null;
  answerId: string | null;
  answerStatus: number | null;
};

const fmt = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) : "未設定";

const period = (start: string | null, end: string | null) => `${fmt(start)} 〜 ${fmt(end)}`;

export default function SurveysPage() {
  const router = useRouter();
  const { colors, shapes } = useTheme();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me-surveys"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/me/surveys"),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-4 text-xl font-bold">実施中のアンケート</h1>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data?.data.map((r) => {
          const answered = Boolean(r.answerId);
          return (
            <SurveyCard
              key={r.publicationId}
              id={r.publicationId}
              title={r.publicationTitle || r.surveyTitle}
              description={r.publicationTitle ? r.surveyTitle : undefined}
              period={period(r.startAt, r.endAt)}
              status={answered ? "回答済み" : "未回答"}
              statusColor={answered ? "green" : "yellow"}
              headerColor={colors.primaryBgColor}
              buttonVariant={answered ? "outline" : "primary"}
              buttonText={answered ? "回答を見直す" : "回答する"}
              buttonIcon={answered ? "eye" : "arrow-in"}
              cardRadius={shapes.cardRadius}
              onClick={() => router.push(`/surveys/${r.publicationId}`)}
            />
          );
        })}
      </div>

      {data && data.data.length === 0 && (
        <div className="rounded border border-dashed p-6 text-center text-sm text-gray-400">
          実施中のアンケートはありません
        </div>
      )}
    </div>
  );
}
