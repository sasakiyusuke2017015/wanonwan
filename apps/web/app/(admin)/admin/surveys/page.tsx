"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SURVEY_STATUSES } from "@waoon/domain";
import type { Column, TableRowData } from "@ui-catalog/core/organisms/InteractiveTable";
import { StatisticList } from "@ui-catalog/core/molecules";
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

// 集計パネルの status 別の色（dot=背景, label=文字）。
const STATUS_COLOR: Record<string, { dot: string; label: string }> = {
  draft: { dot: "bg-yellow-400", label: "text-yellow-700" },
  active: { dot: "bg-green-500", label: "text-green-700" },
  closed: { dot: "bg-gray-400", label: "text-gray-600" },
};

const SORTABLE = [
  { key: "title", label: "タイトル" },
  { key: "statusLabel", label: "状態" },
  { key: "publicationCount", label: "掲載数" },
];

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

const SEARCH_KEYS: (keyof Row & string)[] = ["title", "statusLabel"];

export default function SurveysListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiGet<{ data: SurveyRow[] }>("/api/v1/surveys"),
  });

  const source = data?.data ?? [];
  const rows: Row[] = source.map((s) => ({
    id: s.id,
    title: s.title,
    statusLabel: STATUS_LABEL[s.status] ?? s.status,
    capacityLabel: s.capacity == null ? "—" : String(s.capacity),
    publicationCount: s.publicationCount,
  }));

  const statusItems = SURVEY_STATUSES.map((st) => ({
    label: STATUS_LABEL[st],
    value: source.filter((s) => s.status === st).length,
    labelColor: STATUS_COLOR[st].label,
    dotColor: STATUS_COLOR[st].dot,
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

      {!isLoading && !isError && (
        <div className="mb-3">
          <StatisticList
            items={statusItems}
            totalLabel="アンケート"
            totalValue={rows.length}
            totalUnit="件"
          />
        </div>
      )}

      <AdminListTable
        columns={COLUMNS}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        emptyMessage="アンケートがありません"
        onRowClick={(row) => router.push(`/admin/surveys/${row.id}/edit`)}
        searchKeys={SEARCH_KEYS}
        sortable={SORTABLE}
      />
    </div>
  );
}
