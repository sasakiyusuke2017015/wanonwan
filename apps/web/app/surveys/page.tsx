"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@ui-catalog/core/molecules";
import { Badge, Text } from "@ui-catalog/core/atoms";
import { apiGet } from "@/lib/api/client";

type Row = {
  publicationId: string;
  publicationTitle: string | null;
  surveyTitle: string;
  answerId: string | null;
  answerStatus: number | null;
};

export default function SurveysPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me-surveys"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/me/surveys"),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold">実施中のアンケート</h1>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.data.map((r) => {
          const answered = Boolean(r.answerId);
          return (
            <Card key={r.publicationId} onClick={() => router.push(`/surveys/${r.publicationId}`)}>
              <div className="flex h-full flex-col gap-2">
                <Text weight="bold">{r.publicationTitle || r.surveyTitle}</Text>
                <div className="mt-auto flex items-center justify-between">
                  <Badge
                    value={answered ? "回答済み" : "未回答"}
                    variant={answered ? "success" : "warning"}
                  />
                  <Text size="sm" variant="muted">
                    {answered ? "回答を見直す →" : "回答する →"}
                  </Text>
                </div>
              </div>
            </Card>
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
