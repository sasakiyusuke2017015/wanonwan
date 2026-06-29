"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ANSWER_STATUSES, EVAL_ITEMS, healthLabel } from "@waoon/domain";
import { RadarChart } from "@ui-catalog/core/organisms/RadarChart";
import { NumberTicker, Badge } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet } from "@/lib/api/client";

type Dashboard = {
  total: number;
  interviewed: number;
  byStatus: Record<string, number>;
  health: { status: number; count: number }[];
  evaluation: Record<string, number | null>;
};

// 旧 1on1 Dashboard 踏襲: 番号付きセクションの白カードを縦に積む。
const SECTION_BADGE: Record<number, string> = {
  1: "bg-gradient-to-r from-rose-500 to-pink-500",
  2: "bg-gradient-to-r from-violet-500 to-purple-500",
  3: "bg-gradient-to-r from-amber-500 to-orange-500",
  4: "bg-gradient-to-r from-indigo-500 to-blue-500",
};

function Section({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200/50 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:p-6">
      <h2 className="mb-3 flex items-center text-lg font-bold text-gray-800">
        <span
          className={`mr-3 flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white shadow ${SECTION_BADGE[no]}`}
        >
          {no}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const EVAL_COLOR: Record<string, "blue" | "green" | "orange"> = {
  satisfaction: "blue",
  workload: "green",
  environment: "blue",
  relationship: "blue",
  stress: "orange",
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
  const responseRate = d.total === 0 ? 0 : Math.round((answered / d.total) * 100);
  const hasEval = EVAL_ITEMS.some((it) => d.evaluation[it.key] != null);
  const radar = EVAL_ITEMS.map((it) => ({ label: it.label, value: d.evaluation[it.key] ?? 0 }));

  const Bar = ({ label, count, max }: { label: string; count: number; max: number }) => (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-28 shrink-0 text-gray-600">{label}</span>
      <div
        className="h-4 flex-1 overflow-hidden rounded bg-gray-100"
        style={{ borderRadius: shapes.badgeRadius }}
      >
        <div
          className="h-full"
          style={{ width: `${max === 0 ? 0 : (count / max) * 100}%`, backgroundColor: colors.primaryBgColor }}
        />
      </div>
      <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
    </div>
  );

  const statusMax = Math.max(1, ...ANSWER_STATUSES.map((s) => d.byStatus[String(s.value)] ?? 0));
  const healthMax = Math.max(1, ...d.health.map((h) => h.count));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ダッシュボード</h1>

      <Section no={1} title="全社サマリー">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg bg-green-50 p-4 md:col-span-1">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">回答率</h3>
            <div className="flex items-baseline">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent">
                <NumberTicker value={responseRate} suffix="%" delay={0.2} />
              </span>
              <span className="ml-2 text-xs text-gray-600">
                ({answered}件/{d.total}件)
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 md:col-span-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">評価平均</h3>
            <div className="flex flex-wrap items-center gap-3">
              {EVAL_ITEMS.map((it) => (
                <div key={it.key} className="flex items-center rounded-lg bg-white/70 px-3 py-1.5">
                  <span className="mr-2 text-sm font-medium">{it.label}:</span>
                  <Badge
                    value={d.evaluation[it.key] != null ? d.evaluation[it.key]!.toFixed(1) : "—"}
                    appearance="metric"
                    styleVariant="gradient"
                    color={EVAL_COLOR[it.key]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section no={2} title="回答状況の内訳">
          <div className="space-y-2">
            {ANSWER_STATUSES.map((s) => (
              <Bar key={s.value} label={s.label} count={d.byStatus[String(s.value)] ?? 0} max={statusMax} />
            ))}
          </div>
        </Section>

        <Section no={3} title="健康状態の分布">
          {d.health.length === 0 ? (
            <p className="text-sm text-gray-400">データがありません</p>
          ) : (
            <div className="space-y-2">
              {d.health.map((h) => (
                <Bar key={h.status} label={healthLabel(h.status)} count={h.count} max={healthMax} />
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section no={4} title="評価平均（レーダー）">
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
      </Section>
    </div>
  );
}
