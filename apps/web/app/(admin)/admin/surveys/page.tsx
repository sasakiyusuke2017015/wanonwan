"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Column, TableRowData } from "@ui-catalog/core/organisms/InteractiveTable";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";

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

type Row = TableRowData & {
  id: string;
  title: string;
  statusLabel: string;
  capacityLabel: string;
  publicationCount: number;
};

const COLUMNS: Column[] = [
  { accessor: "title", label: "タイトル", proportion: 48, dataAlign: "left" },
  { accessor: "statusLabel", label: "状態", proportion: 16, dataAlign: "left" },
  { accessor: "capacityLabel", label: "定員", proportion: 16, dataAlign: "right" },
  { accessor: "publicationCount", label: "掲載数", proportion: 20, dataAlign: "right" },
];

export default function SurveysListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiGet<{ data: SurveyRow[] }>("/api/v1/surveys"),
  });

  const rows: Row[] = (data?.data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    statusLabel: STATUS_LABEL[s.status] ?? s.status,
    capacityLabel: s.capacity == null ? "—" : String(s.capacity),
    publicationCount: s.publicationCount,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">アンケート管理</h1>
        <Link
          href="/admin/surveys/new"
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
        emptyMessage="アンケートがありません"
        onRowClick={(row) => router.push(`/admin/surveys/${row.id}/edit`)}
      />
    </div>
  );
}
