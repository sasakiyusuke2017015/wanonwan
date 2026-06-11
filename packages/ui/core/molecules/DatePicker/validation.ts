/**
 * 日付バリデーション関数
 */
import { DATE_RANGE_DEFAULTS } from './constants';
import type { DateRange, PickerMode } from './types';

/** 日付範囲を計算 */
export const calculateDateRange = (
  recentMonths: number | undefined,
  pickerMode: PickerMode,
  minDate?: string,
  maxDate?: string
): DateRange => {
  if (!recentMonths || pickerMode !== 'month') {
    return {
      minDate: minDate || (pickerMode === 'month' ? DATE_RANGE_DEFAULTS.MONTH_MIN : DATE_RANGE_DEFAULTS.DATE_MIN),
      maxDate: maxDate || (pickerMode === 'month' ? DATE_RANGE_DEFAULTS.MONTH_MAX : DATE_RANGE_DEFAULTS.DATE_MAX),
    };
  }
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const calculatedMaxDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  let minYear = currentYear;
  let minMonth = currentMonth - (recentMonths - 1);
  while (minMonth <= 0) { minMonth += 12; minYear -= 1; }
  const calculatedMinDate = `${minYear}-${String(minMonth).padStart(2, '0')}`;
  return { minDate: minDate || calculatedMinDate, maxDate: maxDate || calculatedMaxDate };
};

/** 日付が範囲内かどうかをチェック */
export const isDateInRange = (dateStr: string, minDate: string, maxDate: string): boolean => {
  if (!dateStr) return false;
  return !(minDate && dateStr < minDate) && !(maxDate && dateStr > maxDate);
};

/** 月が範囲内かどうかをチェック */
export const isMonthInRange = (year: number, month: number, minDate: Date | null, maxDate: Date | null): boolean => {
  const date = new Date(year, month, 1);
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) return false;
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) return false;
  return true;
};

/** 日付が範囲内かどうかをチェック（Date型） */
export const isDateObjInRange = (date: Date, minDate: Date | null, maxDate: Date | null): boolean => {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
};
