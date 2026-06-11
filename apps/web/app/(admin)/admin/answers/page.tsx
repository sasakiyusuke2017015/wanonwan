"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { answerStatusLabel, healthLabel } from "@waoon/domain";
import type { Column, TableRowData } from "@ui-catalog/core/organisms/InteractiveTable";
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

export default function AnswersListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["answers"],
    queryFn: () => apiGet<{ data: AnswerRow[] }>("/api/v1/answers"),
  });

  const rows: Row[] = (data?.data ?? []).map((a) => ({
    id: a.id,
    respondentName: a.respondentName,
    surveyLabel: a.publicationTitle || a.surveyTitle,
    statusLabel: answerStatusLabel(a.status),
    healthLabel: healthLabel(a.healthStatus),
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">回答・面談</h1>

      <AdminListTable
        columns={COLUMNS}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        emptyMessage="回答がありません"
        onRowClick={(row) => router.push(`/admin/answers/${row.id}`)}
      />
    </div>
  );
}
