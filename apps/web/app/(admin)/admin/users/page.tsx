"use client";

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
        subHeader={{
          title: "ユーザー管理",
          createHref: "/admin/users/new",
          onCreate: () => router.push("/admin/users/new"),
          createLabel: "ユーザーを追加",
        }}
      />
    </div>
  );
}
