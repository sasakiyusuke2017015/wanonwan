"use client";

import dynamic from "next/dynamic";

// カレンダー(MonthView/EventModal)が依存する @ui-catalog の atoms は、モジュール
// 評価時に window.location を読むため SSR で落ちる。クライアント専用で読み込む。
const ScheduleCalendar = dynamic(() => import("@/components/schedule/ScheduleCalendar"), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">読み込み中...</p>,
});

export default function SchedulePage() {
  return <ScheduleCalendar />;
}
