"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

type Me = { isAdmin: boolean; name: string | null };

// 管理画面の admin ガード。RLS が最終防御だが、UI でも非 admin を弾く。
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/api/v1/auth/me"),
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">読み込み中...</div>;
  }
  if (isError || !data?.isAdmin) {
    return (
      <div className="p-8">
        <p className="text-sm">この画面は管理者のみ利用できます。</p>
        <Link href="/" className="text-sm text-blue-600 underline">
          ホームへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-6 border-b px-6 py-3">
        <strong className="text-sm">waoon 管理</strong>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/users" className="hover:underline">
            ユーザー管理
          </Link>
          <Link href="/admin/surveys" className="hover:underline">
            アンケート管理
          </Link>
          <Link href="/admin/answers" className="hover:underline">
            回答・面談
          </Link>
        </nav>
        <span className="ml-auto text-sm text-gray-500">{data.name}</span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
