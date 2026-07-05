"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Column } from "@ui-catalog/core/organisms/DataTable";
import { StatisticList } from "@ui-catalog/core/molecules";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";

type Row = {
  id: string;
  code: string;
  name: string;
  email: string;
};

const COLUMNS: Column<Row>[] = [
  { key: "code", label: "コード", width: "16%", align: "left" },
  { key: "name", label: "名前", width: "28%", align: "left" },
  { key: "email", label: "メール", width: "56%", align: "left" },
];

const SORTABLE = ["code", "name", "email"];

export default function UsersListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/users"),
  });

  const rows: Row[] = (data?.data ?? []).map((u) => ({ ...u }));

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

      {!isLoading && !isError && (
        <div className="mb-3">
          <StatisticList items={[]} totalLabel="ユーザー" totalValue={rows.length} totalUnit="名" />
        </div>
      )}

      <AdminListTable
        columns={COLUMNS}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        onRetry={() => refetch()}
        emptyMessage="ユーザーがいません"
        onRowClick={(row) => router.push(`/admin/users/${row.id}/edit`)}
        sortable={SORTABLE}
      />
    </div>
  );
}
