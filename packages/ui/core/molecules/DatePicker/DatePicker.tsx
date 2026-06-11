'use client'

/**
 * DatePicker メインコンポーネント
 */
import { FC, useRef, useState, useEffect, useCallback } from 'react';
import { Icon } from '../../atoms/Icon';

import { useOperationLog } from '../../../infra/devtools';

import { useDatePickerState } from './useDatePickerState';
import { NavigationButton } from './NavigationButton';
import { Calendar } from '../Calendar';
import { formatDisplayValue, formatDateValue } from './format';
import {
  SIZE_STYLES, VARIANT_STYLES, ICON_SIZES,
  POPUP_WIDTH,
} from './constants';
import type { DatePickerProps } from './types';

export const DatePicker: FC<DatePickerProps> = ({
  id,
  name: _name,
  pickerMode = 'date',
  variant = 'default',
  size = 'medium',
  showNavigation = false,
  borderRadius = '0.375rem',
  menuAlign = 'left',
  primaryBgColor = '#3b82f6',
  dropdownRadius = '0.5rem',
  allowClear = false,
  highlightedMonths,
  className,
  value = '',
  minDate,
  maxDate,
  recentMonths,
  onChange,
  onPeriodChange,
  onFocus: _onFocus,
  onBlur: _onBlur,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const log = useOperationLog('DatePicker');

  const {
    selectedDate, parsedSelectedDate,
    minDateObj, maxDateObj, viewDate,
    setViewDate, updateDate, isInRange,
  } = useDatePickerState({ value, pickerMode, minDate, maxDate, recentMonths, onChange, onPeriodChange });

  // 外部クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };
    if (isPopupOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopupOpen]);

  // ナビゲーション（空欄時・範囲外は disabled）
  const canNavigate = useCallback((direction: 'prev' | 'next'): boolean => {
    if (pickerMode !== 'month') return false;
    if (!selectedDate) return false;
    const [year, month] = selectedDate.split('-').map(Number);
    let newYear = year, newMonth = direction === 'prev' ? month - 1 : month + 1;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    else if (newMonth > 12) { newMonth = 1; newYear += 1; }
    const newValue = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    return isInRange(newValue);
  }, [pickerMode, selectedDate, isInRange]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    if (!canNavigate(direction) || !selectedDate) return;
    const [year, month] = selectedDate.split('-').map(Number);
    let newYear = year, newMonth = direction === 'prev' ? month - 1 : month + 1;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    else if (newMonth > 12) { newMonth = 1; newYear += 1; }
    const newValue = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    updateDate(newValue);
  }, [canNavigate, selectedDate, updateDate]);

  const handlePopupSelect = useCallback((date: Date) => {
    const newValue = formatDateValue(date, pickerMode);
    log('select', { pickerMode, value: newValue });
    updateDate(newValue, true);
    setIsPopupOpen(false);
  }, [pickerMode, updateDate, log]);

  const handleCalendarNavigate = useCallback((newDate: Date) => {
    setViewDate(newDate);
  }, [setViewDate]);

  const handleClear = useCallback(() => {
    log('clear', { pickerMode });
    updateDate('');
  }, [updateDate, log, pickerMode]);

  const handleTogglePopup = useCallback(() => {
    const newState = !isPopupOpen;
    log(newState ? 'open' : 'close', { pickerMode });
    setIsPopupOpen(newState);
  }, [isPopupOpen, log, pickerMode]);

  return (
      <div
        id={id}
        ref={containerRef}
        className={`relative inline-flex items-center gap-2 ${className || ''}`}
        data-component="date-picker"
        data-picker-mode={pickerMode}
        {...props}
      >
        {showNavigation && pickerMode === 'month' && (
          <NavigationButton direction="prev" size={size} borderRadius={borderRadius} disabled={!canNavigate('prev')} onClick={() => navigateMonth('prev')} />
        )}

        <div className="relative">
          <div
            className={`text-left transition-all duration-200 focus:outline-none focus:ring-2 shadow-sm hover:shadow-md backdrop-blur-sm font-mono tabular-nums ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]}`}
            style={{ borderRadius }}
          >
            {(() => {
              const display = formatDisplayValue(selectedDate, pickerMode);
              const numClass = display.isEmpty ? 'text-transparent' : '';
              return pickerMode === 'month' ? (
                <><span className={numClass}>{display.year}</span>年<span className={numClass}>{display.month}</span>月</>
              ) : (
                <><span className={numClass}>{display.year}</span>年<span className={numClass}>{display.month}</span>月<span className={numClass}>{display.day}</span>日</>
              );
            })()}
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {allowClear && selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                className={`p-0.5 rounded-full transition-colors ${
                  variant === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="日付をクリア"
              >
                <Icon name={'x'} size={ICON_SIZES[size] - 2} hover="pop" />
              </button>
            )}
            <button
              type="button"
              onClick={handleTogglePopup}
              className={`transition-colors ${
                variant === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="カレンダーを開く"
            >
              <Icon name={'calendar'} size={ICON_SIZES[size]} hover="pop" />
            </button>
          </div>

          {isPopupOpen && (
            <div
              className={`absolute top-full mt-2 z-50 ${menuAlign === 'right' ? 'right-0' : 'left-0'}`}
              style={{ width: POPUP_WIDTH[pickerMode] }}
            >
              <Calendar
                mode={pickerMode}
                viewDate={viewDate}
                selectedDate={parsedSelectedDate}
                minDate={minDateObj}
                maxDate={maxDateObj}
                primaryBgColor={primaryBgColor}
                borderRadius={dropdownRadius}
                highlightedMonths={highlightedMonths}
                onSelect={handlePopupSelect}
                onNavigate={handleCalendarNavigate}
              />
            </div>
          )}
        </div>

        {showNavigation && pickerMode === 'month' && (
          <NavigationButton direction="next" size={size} borderRadius={borderRadius} disabled={!canNavigate('next')} onClick={() => navigateMonth('next')} />
        )}
      </div>
  );
};
