/**
 * 日付フォーマット関数
 */
import type { PickerMode } from './types';

/** 日付を表示用フォーマットに変換（固定幅） */
export const formatDisplayValue = (dateStr: string, mode: PickerMode = 'month'): { year: string; month: string; day?: string; isEmpty: boolean } => {
  if (!dateStr) {
    return mode === 'month'
      ? { year: '0000', month: '00', isEmpty: true }
      : { year: '0000', month: '00', day: '00', isEmpty: true };
  }
  const match = dateStr.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) {
    return mode === 'month'
      ? { year: '0000', month: '00', isEmpty: true }
      : { year: '0000', month: '00', day: '00', isEmpty: true };
  }
  const [, year, month, day] = match;
  return mode === 'month'
    ? { year, month, isEmpty: false }
    : { year, month, day, isEmpty: false };
};

/** 日付を期間表示用にフォーマット */
export const formatDateDisplay = (dateStr: string): string => {
  const match = dateStr.match(/(\d{4})-(\d{2})/);
  if (!match) return dateStr;
  const [, year, month] = match;
  return `${year}年${parseInt(month, 10)}月`;
};

/** Date を YYYY-MM または YYYY-MM-DD 形式に変換 */
export const formatDateValue = (date: Date, mode: PickerMode = 'month'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  if (mode === 'month') return `${year}-${month}`;
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** 文字列から Date オブジェクトに変換 */
export const parseDate = (dateStr: string, mode: PickerMode = 'month'): Date | null => {
  if (!dateStr) return null;
  if (mode === 'month') {
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 2) return null;
    return new Date(parts[0], parts[1] - 1, 1);
  }
  return new Date(dateStr);
};
