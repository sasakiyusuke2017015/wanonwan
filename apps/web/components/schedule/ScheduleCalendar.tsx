"use client";

import { useEffect, useMemo } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MonthView } from "@ui-catalog/core/organisms/MonthView";
import { EventModal } from "@ui-catalog/core/organisms/EventModal";
import { selectedDateAtom, eventsAtom } from "@ui-catalog/core/calendar/state";
import type { CalendarEvent } from "@ui-catalog/core/types";
import { Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { apiGet, apiSend } from "@/lib/api/client";

type Schedule = {
  id: string;
  title: string | null;
  body: string | null;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  color: string | null;
  icon: string | null;
  eventType: string | null;
};

const DEFAULT_COLOR = "#4f46e5";

// 予定(API, ISO) ↔ カレンダーイベント(Date)。Date は絶対時刻なので tz 変換は不要
// （ブラウザのローカル=JST で表示・入力される）。
const toEvent = (s: Schedule): CalendarEvent => ({
  id: String(s.id),
  title: s.title ?? "(無題)",
  startTime: new Date(s.startAt),
  endTime: new Date(s.endAt ?? s.startAt),
  color: s.color ?? DEFAULT_COLOR,
  description: s.body ?? undefined,
  icon: s.icon ?? undefined,
  allDay: s.allDay,
});

const toPayload = (e: CalendarEvent) => ({
  title: e.title,
  startAt: e.startTime.toISOString(),
  endAt: e.endTime.toISOString(),
  allDay: e.allDay ?? false,
  color: e.color,
  body: e.description ?? null,
  icon: e.icon ?? null,
});

export default function ScheduleCalendar() {
  const qc = useQueryClient();
  const { shapes } = useTheme();
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const setEvents = useSetAtom(eventsAtom);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => apiGet<{ data: Schedule[] }>("/api/v1/schedules"),
  });

  const events = useMemo(() => (data?.data ?? []).map(toEvent), [data]);

  // EventModal は編集対象の解決に eventsAtom を読むため、取得結果を同期する。
  useEffect(() => {
    setEvents(events);
  }, [events, setEvents]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["schedules"] });

  // MonthView/EventModal からの保存。既存 id なら更新、無ければ新規。
  const persistEvent = async (e: CalendarEvent) => {
    const exists = (data?.data ?? []).some((s) => String(s.id) === e.id);
    if (exists) await apiSend(`/api/v1/schedules/${e.id}`, "PUT", toPayload(e));
    else await apiSend("/api/v1/schedules", "POST", toPayload(e));
    await invalidate();
  };
  const removeEvent = async (id: string) => {
    await apiSend(`/api/v1/schedules/${id}`, "DELETE");
    await invalidate();
  };

  const monthLabel = `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`;
  const shiftMonth = (n: number) =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + n, 1));

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">スケジュール</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => shiftMonth(-1)}
            borderRadius={shapes.buttonRadius}
          >
            前月
          </Button>
          <span className="w-24 text-center text-sm font-medium">{monthLabel}</span>
          <Button
            variant="secondary"
            onClick={() => shiftMonth(1)}
            borderRadius={shapes.buttonRadius}
          >
            翌月
          </Button>
          <Button onClick={() => setSelectedDate(new Date())} borderRadius={shapes.buttonRadius}>
            今日
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      {data && (
        <>
          <MonthView events={events} persistEvent={persistEvent} removeEvent={removeEvent} />
          <EventModal persistEvent={persistEvent} removeEvent={removeEvent} />
        </>
      )}
    </div>
  );
}
