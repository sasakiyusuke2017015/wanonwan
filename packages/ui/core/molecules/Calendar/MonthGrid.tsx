'use client'

/**
 * 月選択グリッド
 */
import { FC, memo, useMemo } from 'react';

import { MONTHS } from './constants';
import type { HighlightedMonth } from './types';

/** 月が範囲内かどうかをチェック */
const isMonthInRange = (year: number, month: number, minDate: Date | null, maxDate: Date | null): boolean => {
  const date = new Date(year, month, 1);
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) return false;
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) return false;
  return true;
};

/** Tailwindカラー名をbg-xxx-500形式に変換 */
const getColorStyle = (color: string): { className?: string; style?: React.CSSProperties } => {
  if (color.startsWith('#')) {
    return { style: { backgroundColor: color } };
  }
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
  };
  return { className: colorMap[color] || 'bg-red-500' };
};

interface Props {
  year: number;
  selectedDate: Date | null;
  minDate: Date | null;
  maxDate: Date | null;
  primaryBgColor: string;
  borderRadius: string;
  highlightedMonths?: HighlightedMonth[];
  onSelect: (date: Date) => void;
}

export const MonthGrid: FC<Props> = memo(({
  year, selectedDate, minDate, maxDate, primaryBgColor, borderRadius, highlightedMonths, onSelect,
}) => {
  const highlightedMap = useMemo(() => {
    const map = new Map<string, string[]>();
    (highlightedMonths || []).forEach(({ month, colors }) => map.set(month, colors));
    return map;
  }, [highlightedMonths]);

  return (
    <div className="grid grid-cols-4 gap-1 p-3 bg-white">
      {MONTHS.map((monthLabel, monthIndex) => {
        const isSelected = selectedDate && year === selectedDate.getFullYear() && monthIndex === selectedDate.getMonth();
        const isDisabled = !isMonthInRange(year, monthIndex, minDate, maxDate);
        const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        const highlightColors = highlightedMap.get(monthKey) || [];
        return (
          <button
            key={monthLabel}
            type="button"
            onClick={() => !isDisabled && onSelect(new Date(year, monthIndex, 1))}
            disabled={isDisabled}
            className={`relative py-2 text-fluid-sm font-medium transition-colors ${
              isSelected ? 'text-white shadow-md' : isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ borderRadius, backgroundColor: isSelected ? primaryBgColor : undefined }}
          >
            {monthLabel}
            {highlightColors.length > 0 && !isDisabled && (
              <span className="absolute top-1 right-1 flex gap-0.5">
                {highlightColors.map((color, idx) => {
                  const colorStyle = getColorStyle(color);
                  return (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${colorStyle.className || ''}`}
                      style={colorStyle.style}
                      title="データあり"
                    />
                  );
                })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

MonthGrid.displayName = 'MonthGrid';
