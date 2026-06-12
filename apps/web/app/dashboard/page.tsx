"use client";

import { useQuery } from "@tanstack/react-query";
import { ANSWER_STATUSES, EVAL_ITEMS, healthLabel } from "@waoon/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { RadarChart } from "@ui-catalog/core/organisms/RadarChart";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet } from "@/lib/api/client";

type Dashboard = {
  total: number;
  interviewed: number;
  byStatus: Record<string, number>;
  health: { status: number; count: number }[];
  evaluation: Record<string, number | null>;
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<{ data: Dashboard }>("/api/v1/dashboard"),
  });
  const { colors, shapes } = useTheme();

  if (isLoading) return <p className="text-sm text-gray-500">読み込み中...</p>;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {(error as Error)?.message ?? "読み込みに失敗しました"}
      </p>
    );
  }

  const d = data.data;
  const answered = d.total - (d.byStatus["100"] ?? 0);
  const rate = (n: number) => (d.total === 0 ? 0 : Math.round((n / d.total) * 100));

  const radar = EVAL_ITEMS.map((it) => ({ label: it.label, value: d.evaluation[it.key] ?? 0 }));
  const hasEval = EVAL_ITEMS.some((it) => d.evaluation[it.key] != null);

  const Bar = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 text-gray-600">{label}</span>
      <div
        className="h-4 flex-1 overflow-hidden rounded bg-gray-100"
        style={{ borderRadius: shapes.badgeRadius }}
      >
        <div
          className="h-full"
          style={{
            width: `${max === 0 ? 0 : (count / max) * 100}%`,
            backgroundColor: colors.primaryBgColor,
          }}
        />
      </div>
      <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
    </div>
  );

  const statusMax = Math.max(1, ...ANSWER_STATUSES.map((s) => d.byStatus[String(s.value)] ?? 0));
  const healthMax = Math.max(1, ...d.health.map((h) => h.count));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-bold">ダッシュボード</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="回答総数" value={d.total} />
        <Stat label="回答済" value={answered} sub={`${rate(answered)}%`} />
        <Stat label="面談実施" value={d.interviewed} sub={`${rate(d.interviewed)}%`} />
        <Stat
          label="完了"
          value={d.byStatus["900"] ?? 0}
          sub={`${rate(d.byStatus["900"] ?? 0)}%`}
        />
      </div>

      <ContentBlock title="回答状況の内訳">
        <div className="space-y-2">
          {ANSWER_STATUSES.map((s) => (
            <Bar
              key={s.value}
              label={s.label}
              count={d.byStatus[String(s.value)] ?? 0}
              max={statusMax}
            />
          ))}
        </div>
      </ContentBlock>

      <ContentBlock title="健康状態の分布">
        {d.health.length === 0 ? (
          <p className="text-sm text-gray-400">データがありません</p>
        ) : (
          <div className="space-y-2">
            {d.health.map((h) => (
              <Bar key={h.status} label={healthLabel(h.status)} count={h.count} max={healthMax} />
            ))}
          </div>
        )}
      </ContentBlock>

      <ContentBlock title="評価平均（0〜5）">
        {hasEval ? (
          <div className="flex justify-center py-2">
            <RadarChart
              data={radar}
              maxValue={5}
              size={280}
              strokeColor={colors.primaryBgColor}
              fillColor={colors.primaryBgColor}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">評価データがありません</p>
        )}
      </ContentBlock>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded border border-gray-200 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
