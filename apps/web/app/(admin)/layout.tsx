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

  // ヘッダー / ナビは AppLayout シェルが提供する。ここは admin ガードのみ担う。
  return <>{children}</>;
}
