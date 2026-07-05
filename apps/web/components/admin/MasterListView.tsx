"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";
import type { MasterConfig, MasterRow } from "@/lib/admin/master-config";

// マスタ一覧の汎用ビュー。config に従って一覧 + 新規作成リンクを描画する。
export function MasterListView({ config }: { config: MasterConfig }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [config.key],
    queryFn: () => apiGet<{ data: MasterRow[] }>(config.endpoint),
  });

  const rows: MasterRow[] = (data?.data ?? []).map((r) => ({ ...r }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{config.title}管理</h1>
        <Link
          href={`${config.listPath}/new`}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
        >
          新規作成
        </Link>
      </div>
      <AdminListTable
        columns={config.columns}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        onRetry={() => refetch()}
        emptyMessage={`${config.title}がありません`}
        onRowClick={(row) => router.push(`${config.listPath}/${row.id}/edit`)}
      />
    </div>
  );
}
