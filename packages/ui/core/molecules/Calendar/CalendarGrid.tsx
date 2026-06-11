'use client'

/**
 * カレンダーグリッド（日付表示部分）
 */
import { FC, memo, useMemo } from 'react';

import { WEEKDAYS } from './constants';

interface Props {
  viewDate: Date;
  selectedDate: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  primaryBgColor: string;
  borderRadius: string;
  onSelect: (date: Date) => void;
}

/** 日付が範囲内かチェック */
const isDateInRange = (date: Date, minDate: Date | null, maxDate: Date | null): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};

export const CalendarGrid: FC<Props> = memo(({
  viewDate, selectedDate, minDate, maxDate, primaryBgColor, borderRadius, onSelect,
}) => {
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [viewDate]);

  return (
    <div className="p-3">
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map((day, index) => (
          <div key={day} className={`text-center text-fluid-xs font-medium py-1 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = new Date().toDateString() === date.toDateString();
          const isDisabled = !isDateInRange(date, minDate, maxDate);
          const dayOfWeek = date.getDay();
          return (
            <button
              key={index}
              type="button"
              onClick={() => !isDisabled && onSelect(date)}
              disabled={isDisabled}
              className={`w-8 h-8 text-fluid-xs font-medium transition-all ${
                isSelected ? 'text-white' : isCurrentMonth
                  ? isDisabled ? 'text-gray-300 cursor-not-allowed'
                  : dayOfWeek === 0 ? 'text-red-500 hover:bg-gray-100'
                  : dayOfWeek === 6 ? 'text-blue-500 hover:bg-gray-100'
                  : 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300'
              } ${isToday && !isSelected ? 'font-bold ring-1 ring-inset' : ''}`}
              style={{
                borderRadius,
                backgroundColor: isSelected ? primaryBgColor : undefined,
                ...(isToday && !isSelected ? { ringColor: primaryBgColor, color: primaryBgColor } : {}),
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
});

CalendarGrid.displayName = 'CalendarGrid';
