"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserRole } from "@wanonwan/domain";
import { apiGet, apiSend } from "@/lib/api/client";

type Me = { isAdmin: boolean; name: string | null; roles?: UserRole[]; activeRole?: UserRole };

// 管理画面のガード。誤操作防止の表示ガードであり、認可は API + RLS が保有ロールで担保する。
// admin 保有者がメンバー等の視点に切り替えている場合は、視点の切り替えを案内する。
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/api/v1/auth/me"),
  });

  const switchToAdmin = useMutation({
    mutationFn: () => apiSend("/api/v1/auth/active-role", "PUT", { role: "admin" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">読み込み中...</div>;
  }
  if (isError || !data?.roles?.includes("admin")) {
    return (
      <div className="p-8">
        <p className="text-sm">この画面は管理者のみ利用できます。</p>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">
          ダッシュボードへ戻る
        </Link>
      </div>
    );
  }
  if (data.activeRole !== "admin") {
    return (
      <div className="space-y-3 p-8">
        <p className="text-sm">
          管理画面を使うには管理者視点に切り替えてください（現在は別の視点で表示中です）。
        </p>
        <button
          type="button"
          onClick={() => switchToAdmin.mutate()}
          disabled={switchToAdmin.isPending}
          className="text-sm text-blue-600 underline"
        >
          {switchToAdmin.isPending ? "切り替え中..." : "管理者視点に切り替える"}
        </button>
      </div>
    );
  }

  // ヘッダー / ナビは AppLayout シェルが提供する。ここは表示ガードのみ担う。
  return <>{children}</>;
}
