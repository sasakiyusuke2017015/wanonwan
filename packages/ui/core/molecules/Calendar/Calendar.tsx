'use client'

/**
 * Calendar コンポーネント
 *
 * 日付/月選択カレンダー。単体でも DatePicker 内でも利用可能。
 * 上下ナビゲーション＋ページめくりアニメーションで統一。
 */
import { FC, useState, useCallback, useMemo } from 'react';
import { Icon } from '../../atoms/Icon';

import { CalendarGrid } from './CalendarGrid';
import { MonthGrid } from './MonthGrid';
import { DEFAULTS, ANIMATION_DURATION } from './constants';
import type { CalendarProps } from './types';

export const Calendar: FC<CalendarProps> = ({
  mode = 'date',
  viewDate: initialViewDate,
  selectedDate = null,
  minDate = null,
  maxDate = null,
  primaryBgColor = DEFAULTS.PRIMARY_BG_COLOR,
  borderRadius = DEFAULTS.BORDER_RADIUS,
  highlightedMonths,
  onSelect,
  onNavigate,
  className,
}) => {
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (initialViewDate) return initialViewDate;
    if (selectedDate) return selectedDate;
    return new Date();
  });

  // ナビゲーション用
  const [flipDirection, setFlipDirection] = useState<'up' | 'down' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [targetViewDate, setTargetViewDate] = useState<Date | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // 有効な範囲
  const { minYear, maxYear, minMonth, maxMonth } = useMemo(() => ({
    minYear: minDate ? minDate.getFullYear() : 1900,
    maxYear: maxDate ? maxDate.getFullYear() : 2099,
    minMonth: minDate ? minDate.getFullYear() * 12 + minDate.getMonth() : 1900 * 12,
    maxMonth: maxDate ? maxDate.getFullYear() * 12 + maxDate.getMonth() : 2099 * 12 + 11,
  }), [minDate, maxDate]);

  const currentMonth = viewYear * 12 + viewMonth;

  // dateモード: 月単位でナビゲート可能か
  const canNavigateMonth = useCallback((direction: 'prev' | 'next'): boolean => {
    return direction === 'prev' ? currentMonth > minMonth : currentMonth < maxMonth;
  }, [currentMonth, minMonth, maxMonth]);

  // monthモード: 年単位でナビゲート可能か
  const canNavigateYear = useCallback((direction: 'prev' | 'next'): boolean => {
    return direction === 'prev' ? viewYear > minYear : viewYear < maxYear;
  }, [viewYear, minYear, maxYear]);

  // 月ナビゲーション（dateモード）- ページめくりアニメーション付き
  const handleMonthNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!canNavigateMonth(direction) || isFlipping) return;
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setFlipDirection(direction === 'prev' ? 'up' : 'down');
    setTargetViewDate(newDate);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsFlipping(true)));
    setTimeout(() => {
      setViewDate(newDate);
      onNavigate?.(newDate);
      setIsFlipping(false);
      setFlipDirection(null);
      setTargetViewDate(null);
    }, ANIMATION_DURATION);
  }, [canNavigateMonth, isFlipping, viewDate, onNavigate]);

  // 年ナビゲーション（monthモード）- ページめくりアニメーション付き
  const handleYearNavigate = useCallback((direction: 'prev' | 'next') => {
    if (!canNavigateYear(direction) || isFlipping) return;
    const newDate = new Date(viewDate);
    newDate.setFullYear(viewYear + (direction === 'prev' ? -1 : 1));
    setFlipDirection(direction === 'prev' ? 'up' : 'down');
    setTargetViewDate(newDate);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsFlipping(true)));
    setTimeout(() => {
      setViewDate(newDate);
      onNavigate?.(newDate);
      setIsFlipping(false);
      setFlipDirection(null);
      setTargetViewDate(null);
    }, ANIMATION_DURATION);
  }, [canNavigateYear, isFlipping, viewYear, viewDate, onNavigate]);

  const handleSelect = useCallback((date: Date) => {
    onSelect?.(date);
  }, [onSelect]);

  const containerStyle = useMemo(() => ({
    borderRadius,
  }), [borderRadius]);

  // 共通のページめくりアニメーション用スタイル
  const getFlipStyle = (isTarget: boolean) => ({
    zIndex: isTarget ? 1 : 2,
    transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity ${ANIMATION_DURATION}ms ease-out`,
    transformOrigin: 'left bottom',
    transform: flipDirection === 'up'
      ? (isTarget ? 'rotate(0deg) translateX(0)' : (isFlipping ? 'rotate(-120deg) translateX(-30%)' : 'rotate(0deg) translateX(0)'))
      : (isTarget ? (isFlipping ? 'rotate(0deg) translateX(0)' : 'rotate(-120deg) translateX(-30%)') : 'rotate(0deg) translateX(0)'),
    opacity: flipDirection === 'up'
      ? (isTarget ? 1 : (isFlipping ? 0 : 1))
      : (isTarget ? (isFlipping ? 1 : 0) : 1),
  });

  // 共通のナビゲーションボタン
  const canNavigate = mode === 'date' ? canNavigateMonth : canNavigateYear;
  const handleNavigate = mode === 'date' ? handleMonthNavigate : handleYearNavigate;
  const prevLabel = mode === 'date' ? '前月' : '前年';
  const nextLabel = mode === 'date' ? '次月' : '次年';

  // ヘッダーテキスト
  const getHeaderText = (date: Date) => {
    return mode === 'date'
      ? `${date.getFullYear()}年${date.getMonth() + 1}月`
      : `${date.getFullYear()}年`;
  };

  // グリッドコンポーネント
  const renderGrid = (date: Date) => {
    return mode === 'date' ? (
      <CalendarGrid
        viewDate={date}
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        primaryBgColor={primaryBgColor}
        borderRadius={borderRadius}
        onSelect={handleSelect}
      />
    ) : (
      <MonthGrid
        year={date.getFullYear()}
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        primaryBgColor={primaryBgColor}
        borderRadius={borderRadius}
        highlightedMonths={highlightedMonths}
        onSelect={handleSelect}
      />
    );
  };

  return (
    <div
      className={`bg-white border border-gray-200 shadow-lg overflow-hidden ${className || ''}`}
      style={containerStyle}
      data-component="calendar"
      data-mode={mode}
    >
      {/* 上ナビゲーションボタン */}
      <button
        type="button"
        onClick={() => handleNavigate('prev')}
        disabled={!canNavigate('prev')}
        className={`w-full py-2 flex items-center justify-center transition-colors ${canNavigate('prev') ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        aria-label={prevLabel}
      >
        <Icon name="chevron-up" size={20} />
      </button>

      {/* コンテンツ（ページめくりアニメーション） */}
      <div className="relative overflow-hidden" style={{ minHeight: mode === 'date' ? '280px' : '180px' }}>
        {flipDirection === 'up' ? (
          <>
            {/* ターゲット（めくり先）が下に固定表示 */}
            {targetViewDate && (
              <div className="absolute inset-0 bg-white" style={{ zIndex: 1 }}>
                <div className="text-center text-fluid-sm font-bold py-2 text-white" style={{ backgroundColor: primaryBgColor }}>
                  {getHeaderText(targetViewDate)}
                </div>
                {renderGrid(targetViewDate)}
              </div>
            )}
            {/* 現在のページがめくれて上に消える */}
            <div className="relative bg-white" style={getFlipStyle(false)}>
              <div className="text-center text-fluid-sm font-bold py-2 text-white" style={{ backgroundColor: primaryBgColor }}>
                {getHeaderText(viewDate)}
              </div>
              {renderGrid(viewDate)}
            </div>
          </>
        ) : flipDirection === 'down' ? (
          <>
            {/* 現在のページが下に固定表示 */}
            <div className="absolute inset-0 bg-white" style={{ zIndex: 1 }}>
              <div className="text-center text-fluid-sm font-bold py-2 text-white" style={{ backgroundColor: primaryBgColor }}>
                {getHeaderText(viewDate)}
              </div>
              {renderGrid(viewDate)}
            </div>
            {/* ターゲットがめくれて上から現れる */}
            {targetViewDate && (
              <div className="relative bg-white" style={getFlipStyle(true)}>
                <div className="text-center text-fluid-sm font-bold py-2 text-white" style={{ backgroundColor: primaryBgColor }}>
                  {getHeaderText(targetViewDate)}
                </div>
                {renderGrid(targetViewDate)}
              </div>
            )}
          </>
        ) : (
          <>
            {/* 通常表示（アニメーションなし） */}
            <div className="text-center text-fluid-sm font-bold py-2 text-white" style={{ backgroundColor: primaryBgColor }}>
              {getHeaderText(viewDate)}
            </div>
            {renderGrid(viewDate)}
          </>
        )}
      </div>

      {/* 下ナビゲーションボタン */}
      <button
        type="button"
        onClick={() => handleNavigate('next')}
        disabled={!canNavigate('next')}
        className={`w-full py-2 flex items-center justify-center transition-colors ${canNavigate('next') ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
        aria-label={nextLabel}
      >
        <Icon name="chevron-down" size={20} />
      </button>
    </div>
  );
};
