"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { answerStatusLabel, healthLabel } from "@waoon/domain";
import type { Column } from "@ui-catalog/core/organisms/DataTable";
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

const SORTABLE = ["respondentName", "surveyLabel", "statusLabel", "urgencyCode"];

// 自分が面談担当の回答一覧（?mine=1）。RLS + 明示フィルタで担当分だけが返る。
// 表示は視点（アクティブロール）に依らず、担当が割り当てられていなければ空になるだけなので
// 追加ガードは張らない（認可は API + RLS）。
export default function InterviewsListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["answers", "mine"],
    queryFn: () => apiGet<{ data: AnswerRow[] }>("/api/v1/answers?mine=1"),
  });
  const { data: urgencyData } = useQuery({
    queryKey: ["urgencies"],
    queryFn: () => apiGet<{ data: UrgencyLevel[] }>("/api/v1/urgencies"),
  });

  const sortedCodes = useMemo(
    () => (urgencyData?.data ?? []).map((u) => u.code).sort((a, b) => a - b),
    [urgencyData],
  );

  const rows: Row[] = (data?.data ?? []).map((a) => ({
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

  return (
    <AdminListTable
      columns={columns}
      data={rows}
      loading={isLoading}
      error={isError ? (error as Error).message : null}
      onRetry={() => refetch()}
      emptyMessage="担当する面談はありません（管理者が回答に面談担当を割り当てると表示されます）"
      onRowClick={(row) => router.push(`/interviews/${row.id}`)}
      sortable={SORTABLE}
      subHeader={{ title: "担当面談" }}
    />
  );
}
