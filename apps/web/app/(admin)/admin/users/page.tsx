"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Column, TableRowData } from "@ui-catalog/core/organisms/InteractiveTable";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";

type UserRow = {
  id: string;
  code: string;
  name: string;
  email: string;
};

type Row = TableRowData & UserRow;

const COLUMNS: Column[] = [
  { accessor: "code", label: "コード", proportion: 16, dataAlign: "left" },
  { accessor: "name", label: "名前", proportion: 28, dataAlign: "left" },
  { accessor: "email", label: "メール", proportion: 56, dataAlign: "left" },
];

export default function UsersListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<{ data: UserRow[] }>("/api/v1/users"),
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

      <AdminListTable
        columns={COLUMNS}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        emptyMessage="ユーザーがいません"
        onRowClick={(row) => router.push(`/admin/users/${row.id}/edit`)}
      />
    </div>
  );
}
