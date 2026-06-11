"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

type SurveyRow = {
  id: string;
  title: string;
  status: string;
  capacity: number | null;
  publicationCount: number;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  active: "公開",
  closed: "終了",
};

export default function SurveysListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiGet<{ data: SurveyRow[] }>("/api/v1/surveys"),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">アンケート管理</h1>
        <Link href="/admin/surveys/new" className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white">
          新規作成
        </Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">タイトル</th>
              <th className="p-2">状態</th>
              <th className="p-2">定員</th>
              <th className="p-2">掲載数</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.data.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.title}</td>
                <td className="p-2">{STATUS_LABEL[s.status] ?? s.status}</td>
                <td className="p-2">{s.capacity ?? "—"}</td>
                <td className="p-2">{s.publicationCount}</td>
                <td className="p-2 text-right">
                  <Link href={`/admin/surveys/${s.id}/edit`} className="text-blue-600 hover:underline">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  アンケートがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
