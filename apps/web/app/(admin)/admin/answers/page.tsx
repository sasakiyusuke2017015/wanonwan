"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ANSWER_STATUSES, answerStatusLabel, healthLabel } from "@wanonwan/domain";
import type { Column } from "@ui-catalog/core/organisms/DataTable";
import { StatisticList } from "@ui-catalog/core/molecules";
import { Badge } from "@ui-catalog/core/atoms";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { UNSET_URGENCY_CODE, urgencyBadgeColor } from "@/lib/urgency/color";

type AnswerRow = {
  id: string;
  status: number;
  healthStatus: number | null;
  urgencyName: string | null;
  urgencyCode: number | null;
  respondentName: string;
  surveyTitle: string;
  publicationTitle: string | null;
};

type UrgencyLevel = { id: string; code: number; name: string };

type Row = {
  id: string;
  respondentName: string;
  surveyLabel: string;
  statusLabel: string;
  urgencyName: string | null;
  urgencyCode: number;
  healthLabel: string;
};

// 緊急度列の key は urgencyCode（数値）。DataTable は列の生値でソート/検索するため、
// 数値にしておくことで緊急度順（低→高）の数値ソートが効く（表示は render の Badge）。
const SORTABLE = ["respondentName", "surveyLabel", "statusLabel", "urgencyCode"];

// 回答状況の status 別の色。
const STATUS_COLOR: Record<number, { dot: string; label: string }> = {
  100: { dot: "bg-gray-400", label: "text-gray-600" }, // 未回答
  200: { dot: "bg-blue-600", label: "text-blue-700" }, // 回答済
  400: { dot: "bg-yellow-400", label: "text-yellow-700" }, // 面談調整済
  900: { dot: "bg-green-500", label: "text-green-700" }, // 完了
};

export default function AnswersListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["answers"],
    queryFn: () => apiGet<{ data: AnswerRow[] }>("/api/v1/answers"),
  });
  const { data: urgencyData } = useQuery({
    queryKey: ["urgencies"],
    queryFn: () => apiGet<{ data: UrgencyLevel[] }>("/api/v1/urgencies"),
  });

  // Badge の色は code の絶対値でなくマスタ全体での相対順位で決める。
  const sortedCodes = useMemo(
    () => (urgencyData?.data ?? []).map((u) => u.code).sort((a, b) => a - b),
    [urgencyData],
  );

  const source = data?.data ?? [];
  const rows: Row[] = source.map((a) => ({
    id: a.id,
    respondentName: a.respondentName,
    surveyLabel: a.publicationTitle || a.surveyTitle,
    statusLabel: answerStatusLabel(a.status),
    urgencyName: a.urgencyName ?? null,
    urgencyCode: a.urgencyCode ?? UNSET_URGENCY_CODE,
    healthLabel: healthLabel(a.healthStatus),
  }));

  const columns = useMemo<Column<Row>[]>(
    () => [
      { key: "respondentName", label: "回答者", width: "20%", align: "left" },
      { key: "surveyLabel", label: "アンケート", width: "34%", align: "left" },
      { key: "statusLabel", label: "状況", width: "16%", align: "left" },
      {
        key: "urgencyCode",
        label: "緊急度",
        width: "14%",
        align: "left",
        render: (row) =>
          row.urgencyName == null ? (
            <span className="text-gray-400">—</span>
          ) : (
            <Badge
              value={row.urgencyName}
              color={urgencyBadgeColor(row.urgencyCode, sortedCodes)}
              appearance="status"
              size="small"
            />
          ),
      },
      { key: "healthLabel", label: "健康状態", width: "16%", align: "left" },
    ],
    [sortedCodes],
  );

  const statusItems = ANSWER_STATUSES.map((st) => ({
    label: st.label,
    value: source.filter((a) => a.status === st.value).length,
    labelColor: STATUS_COLOR[st.value].label,
    dotColor: STATUS_COLOR[st.value].dot,
  }));

  return (
    <div>
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
        columns={columns}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        onRetry={() => refetch()}
        emptyMessage="回答がありません"
        onRowClick={(row) => router.push(`/admin/answers/${row.id}`)}
        sortable={SORTABLE}
        subHeader={{ title: "回答・面談" }}
      />
    </div>
  );
}
