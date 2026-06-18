"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ANSWER_STATUSES, answerStatusLabel, healthLabel } from "@waoon/domain";
import type { Column, TableRowData } from "@ui-catalog/core/organisms/InteractiveTable";
import { StatisticList } from "@ui-catalog/core/molecules";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";

type AnswerRow = {
  id: string;
  status: number;
  healthStatus: number | null;
  respondentName: string;
  surveyTitle: string;
  publicationTitle: string | null;
};

type Row = TableRowData & {
  id: string;
  respondentName: string;
  surveyLabel: string;
  statusLabel: string;
  healthLabel: string;
};

const COLUMNS: Column[] = [
  { accessor: "respondentName", label: "回答者", proportion: 24, dataAlign: "left" },
  { accessor: "surveyLabel", label: "アンケート", proportion: 40, dataAlign: "left" },
  { accessor: "statusLabel", label: "状況", proportion: 18, dataAlign: "left" },
  { accessor: "healthLabel", label: "健康状態", proportion: 18, dataAlign: "left" },
];

const SEARCH_KEYS: (keyof Row & string)[] = ["respondentName", "surveyLabel", "statusLabel"];
const SORTABLE = [
  { key: "respondentName", label: "回答者" },
  { key: "surveyLabel", label: "アンケート" },
  { key: "statusLabel", label: "状況" },
];

// 回答状況の status 別の色。
const STATUS_COLOR: Record<number, { dot: string; label: string }> = {
  100: { dot: "bg-gray-400", label: "text-gray-600" }, // 未回答
  200: { dot: "bg-blue-600", label: "text-blue-700" }, // 回答済
  400: { dot: "bg-yellow-400", label: "text-yellow-700" }, // 面談調整済
  900: { dot: "bg-green-500", label: "text-green-700" }, // 完了
};

export default function AnswersListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answers"],
    queryFn: () => apiGet<{ data: AnswerRow[] }>("/api/v1/answers"),
  });

  const source = data?.data ?? [];
  const rows: Row[] = source.map((a) => ({
    id: a.id,
    respondentName: a.respondentName,
    surveyLabel: a.publicationTitle || a.surveyTitle,
    statusLabel: answerStatusLabel(a.status),
    healthLabel: healthLabel(a.healthStatus),
  }));

  const statusItems = ANSWER_STATUSES.map((st) => ({
    label: st.label,
    value: source.filter((a) => a.status === st.value).length,
    labelColor: STATUS_COLOR[st.value].label,
    dotColor: STATUS_COLOR[st.value].dot,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">回答・面談</h1>

      {!isLoading && !isError && (
        <div className="mb-3">
          <StatisticList
            items={statusItems}
            totalLabel="回答"
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
        emptyMessage="回答がありません"
        onRowClick={(row) => router.push(`/admin/answers/${row.id}`)}
        searchKeys={SEARCH_KEYS}
        sortable={SORTABLE}
      />
    </div>
  );
}
