"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

type Row = {
  publicationId: string;
  publicationTitle: string | null;
  surveyTitle: string;
  answerId: string | null;
  answerStatus: number | null;
};

export default function SurveysPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me-surveys"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/me/surveys"),
  });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">実施中のアンケート</h1>
        <Link href="/" className="text-sm text-blue-600 underline">ホーム</Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      <ul className="space-y-2">
        {data?.data.map((r) => (
          <li key={r.publicationId} className="flex items-center justify-between rounded border border-gray-200 p-3">
            <div>
              <div className="text-sm font-medium">{r.publicationTitle || r.surveyTitle}</div>
              <div className="text-xs text-gray-500">{r.answerId ? "回答済み" : "未回答"}</div>
            </div>
            <Link
              href={`/surveys/${r.publicationId}`}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
            >
              {r.answerId ? "回答を見直す" : "回答する"}
            </Link>
          </li>
        ))}
        {data && data.data.length === 0 && (
          <li className="rounded border border-dashed p-4 text-center text-sm text-gray-400">
            実施中のアンケートはありません
          </li>
        )}
      </ul>
    </main>
  );
}
