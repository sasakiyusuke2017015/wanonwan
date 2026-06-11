"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { answerStatusLabel, healthLabel } from "@waoon/domain";
import { apiGet } from "@/lib/api/client";

type Row = {
  id: string;
  status: number;
  healthStatus: number | null;
  respondentName: string;
  surveyTitle: string;
  publicationTitle: string | null;
};

export default function AnswersListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answers"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/answers"),
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">回答・面談</h1>
      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">回答者</th>
              <th className="p-2">アンケート</th>
              <th className="p-2">状況</th>
              <th className="p-2">健康状態</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.data.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.respondentName}</td>
                <td className="p-2">{a.publicationTitle || a.surveyTitle}</td>
                <td className="p-2">{answerStatusLabel(a.status)}</td>
                <td className="p-2">{healthLabel(a.healthStatus)}</td>
                <td className="p-2 text-right">
                  <Link href={`/admin/answers/${a.id}`} className="text-blue-600 hover:underline">
                    面談記録
                  </Link>
                </td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  回答がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
