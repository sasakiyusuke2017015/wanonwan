"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SURVEY_STATUSES } from "@waoon/domain";
import type { Column } from "@ui-catalog/core/organisms/DataTable";
import { StatisticList } from "@ui-catalog/core/molecules";
import { Badge } from "@ui-catalog/core/atoms";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";
import { UNSET_URGENCY_CODE, urgencyBadgeColor } from "@/lib/urgency/color";

type SurveyRow = {
  id: string;
  title: string;
  status: string;
  capacity: number | null;
  urgencyName: string | null;
  urgencyCode: number | null;
  publicationCount: number;
};

type UrgencyLevel = { id: string; code: number; name: string };

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

// 緊急度列の key は urgencyCode（数値）。DataTable は列の生値でソート/検索するため、
// 数値にしておくことで緊急度順（低→高）の数値ソートが効く（表示は render の Badge）。
const SORTABLE = ["title", "statusLabel", "urgencyCode", "publicationCount"];

type Row = {
  id: string;
  title: string;
  statusLabel: string;
  urgencyName: string | null;
  urgencyCode: number;
  capacityLabel: string;
  publicationCount: number;
};

export default function SurveysListPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["surveys"],
    queryFn: () => apiGet<{ data: SurveyRow[] }>("/api/v1/surveys"),
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
  const rows: Row[] = source.map((s) => ({
    id: s.id,
    title: s.title,
    statusLabel: STATUS_LABEL[s.status] ?? s.status,
    urgencyName: s.urgencyName ?? null,
    urgencyCode: s.urgencyCode ?? UNSET_URGENCY_CODE,
    capacityLabel: s.capacity == null ? "—" : String(s.capacity),
    publicationCount: s.publicationCount,
  }));

  const columns = useMemo<Column<Row>[]>(
    () => [
      { key: "title", label: "タイトル", width: "40%", align: "left" },
      { key: "statusLabel", label: "状態", width: "14%", align: "left" },
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
      { key: "capacityLabel", label: "定員", width: "14%", align: "right" },
      { key: "publicationCount", label: "掲載数", width: "18%", align: "right" },
    ],
    [sortedCodes],
  );

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
        columns={columns}
        data={rows}
        loading={isLoading}
        error={isError ? (error as Error).message : null}
        onRetry={() => refetch()}
        emptyMessage="アンケートがありません"
        onRowClick={(row) => router.push(`/admin/surveys/${row.id}/edit`)}
        sortable={SORTABLE}
      />
    </div>
  );
}
