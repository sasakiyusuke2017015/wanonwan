"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EVAL_ITEMS, QUESTION_TYPES, type AnswerType } from "@waoon/domain";
import type { Column } from "@ui-catalog/core/organisms/DataTable";
import { apiGet } from "@/lib/api/client";
import { AdminListTable } from "@/components/admin/AdminListTable";

type MasterQuestion = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
  evalItem: string | null;
};

const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.value === t)?.label ?? t;
const evalLabel = (k: string | null) =>
  k == null ? "—" : EVAL_ITEMS.find((x) => x.key === k)?.label ?? k;

type Row = {
  id: string;
  body: string;
  typeLabel: string;
  evalLabel: string;
  requiredLabel: string;
  choiceCount: number;
};

const COLUMNS: Column<Row>[] = [
  { key: "body", label: "質問文", width: "48%", align: "left" },
  { key: "typeLabel", label: "種別", width: "16%", align: "left" },
  { key: "evalLabel", label: "評価項目", width: "16%", align: "left" },
  { key: "requiredLabel", label: "必須", width: "8%", align: "center" },
  { key: "choiceCount", label: "選択肢", width: "12%", align: "right" },
];

const SORTABLE = ["body", "typeLabel", "evalLabel"];

export default function QuestionsMasterPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiGet<{ data: MasterQuestion[] }>("/api/v1/questions"),
  });

  const rows: Row[] = (data?.data ?? []).map((q) => ({
    id: q.id,
    body: q.body,
    typeLabel: typeLabel(q.answerType),
    evalLabel: evalLabel(q.evalItem),
    requiredLabel: q.required ? "必須" : "—",
    choiceCount: q.choices.length,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">設問マスタ</h1>
        <Link
          href="/admin/questions/new"
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
        onRetry={() => refetch()}
        emptyMessage="設問がありません"
        onRowClick={(row) => router.push(`/admin/questions/${row.id}/edit`)}
        sortable={SORTABLE}
      />
    </div>
  );
}
