"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

type UserRow = {
  id: string;
  code: string;
  name: string;
  email: string;
};

export default function UsersListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<{ data: UserRow[] }>("/api/v1/users"),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">ユーザー管理</h1>
        <Link
          href="/admin/users/new"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
        >
          新規作成
        </Link>
      </div>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">コード</th>
              <th className="p-2">名前</th>
              <th className="p-2">メール</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.data.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.code}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 text-right">
                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  ユーザーがいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
