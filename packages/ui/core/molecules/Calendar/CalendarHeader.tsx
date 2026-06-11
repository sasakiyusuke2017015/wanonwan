'use client'

/**
 * カレンダーヘッダー（年月表示 + ナビゲーション）
 */
import { FC, memo } from 'react';
import { Icon } from '../../atoms/Icon';

interface Props {
  viewDate: Date;
  primaryBgColor: string;
  borderRadius: string;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const CalendarHeader: FC<Props> = memo(({
  viewDate, primaryBgColor, borderRadius, onNavigate,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-3" style={{ backgroundColor: primaryBgColor }}>
      <button
        type="button"
        onClick={() => onNavigate('prev')}
        className="p-1.5 hover:bg-white/20 transition-colors"
        style={{ borderRadius }}
        aria-label="前月"
      >
        <Icon name={'chevron-left'} size={16} stroke="white" />
      </button>
      <span className="text-white font-semibold text-fluid-base">
        {`${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`}
      </span>
      <button
        type="button"
        onClick={() => onNavigate('next')}
        className="p-1.5 hover:bg-white/20 transition-colors"
        style={{ borderRadius }}
        aria-label="次月"
      >
        <Icon name={'chevron-right'} size={16} stroke="white" />
      </button>
    </div>
  );
});

CalendarHeader.displayName = 'CalendarHeader';
