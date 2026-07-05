"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SurveyCard, SurveyCardSkeleton, StatisticList, Button } from "@ui-catalog/core/molecules";
import { EmptyState } from "@ui-catalog/core/organisms/EmptyState";
import { Icon } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet } from "@/lib/api/client";
import { fmtPeriod } from "@/lib/surveys/format";
import { answerState, deadlineInfo, type AnswerState } from "@/lib/surveys/status";

type Row = {
  publicationId: string;
  publicationTitle: string | null;
  surveyTitle: string;
  startAt: string | null;
  endAt: string | null;
  answerId: string | null;
  answerStatus: number | null;
};

// 回答状態ごとのカード表示（バッジ・ボタン導線）。draft は「続きから回答」に振り分ける。
const CARD_BY_STATE = {
  none: { status: "未回答", statusColor: "yellow", buttonVariant: "primary", buttonText: "回答する", buttonIcon: "arrow-in" },
  draft: { status: "下書き", statusColor: "orange", buttonVariant: "primary", buttonText: "続きから回答", buttonIcon: "arrow-in" },
  submitted: { status: "回答済み", statusColor: "green", buttonVariant: "outline", buttonText: "回答を見直す", buttonIcon: "eye" },
} as const satisfies Record<AnswerState, unknown>;

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export default function SurveysPage() {
  const router = useRouter();
  const { colors, shapes } = useTheme();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["me-surveys"],
    queryFn: () => apiGet<{ data: Row[] }>("/api/v1/me/surveys"),
  });

  const rows = data?.data ?? [];
  const states = rows.map((r) => answerState(r.answerId, r.answerStatus));
  const submitted = states.filter((s) => s === "submitted").length;
  const draft = states.filter((s) => s === "draft").length;
  const unanswered = rows.length - submitted - draft;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">実施中のアンケート</h1>

      {rows.length > 0 && (
        <div className="mb-4">
          <StatisticList
            items={[
              { label: "未回答", value: unanswered, dotColor: "bg-yellow-500", labelColor: "text-yellow-700" },
              ...(draft > 0
                ? [{ label: "下書き", value: draft, dotColor: "bg-orange-500", labelColor: "text-orange-700" }]
                : []),
              { label: "回答済", value: submitted, dotColor: "bg-green-500", labelColor: "text-green-700" },
            ]}
            totalLabel="実施中"
            totalValue={rows.length}
            totalUnit="件"
          />
        </div>
      )}

      {isLoading && (
        <div className={GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <SurveyCardSkeleton key={i} cardRadius={shapes.cardRadius} />
          ))}
        </div>
      )}

      {isError && (
        <div
          className="rounded border border-dashed border-red-300 p-6 text-center"
          style={{ borderRadius: shapes.cardRadius }}
        >
          <p className="text-sm text-red-600">{(error as Error).message}</p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => refetch()} borderRadius={shapes.buttonRadius}>
              再試行
            </Button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className={GRID}>
          {rows.map((r) => {
            const state = answerState(r.answerId, r.answerStatus);
            const card = CARD_BY_STATE[state];
            // 提出済みは締切を煽らない（未回答・下書きのみ訴求）。
            const deadline = state === "submitted" ? null : deadlineInfo(r.endAt);
            return (
              <SurveyCard
                key={r.publicationId}
                id={r.publicationId}
                title={r.publicationTitle || r.surveyTitle}
                description={r.publicationTitle ? r.surveyTitle : undefined}
                period={fmtPeriod(r.startAt, r.endAt)}
                status={card.status}
                statusColor={card.statusColor}
                deadlineLabel={deadline?.label}
                deadlineColor={deadline?.color}
                headerColor={colors.primaryBgColor}
                buttonVariant={card.buttonVariant}
                buttonText={card.buttonText}
                buttonIcon={card.buttonIcon}
                cardRadius={shapes.cardRadius}
                onClick={() => router.push(`/surveys/${r.publicationId}`)}
              />
            );
          })}
        </div>
      )}

      {data && rows.length === 0 && (
        <EmptyState
          icon={<Icon name="file" size={40} className="text-gray-300" />}
          title="実施中のアンケートはありません"
          description="新しいアンケートが公開されるとここに表示されます。"
          action={
            <Button variant="secondary" onClick={() => refetch()} borderRadius={shapes.buttonRadius}>
              再読み込み
            </Button>
          }
        />
      )}
    </div>
  );
}
