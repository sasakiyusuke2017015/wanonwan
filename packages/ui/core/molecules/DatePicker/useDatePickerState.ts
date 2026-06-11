/**
 * DatePicker 状態管理フック
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateDateRange, isDateInRange } from './validation';
import { parseDate, formatDateDisplay } from './format';
import type { PickerMode } from './types';

interface UseDatePickerStateProps {
  value: string;
  pickerMode: PickerMode;
  minDate?: string;
  maxDate?: string;
  recentMonths?: number;
  onChange?: (value: string) => void;
  onPeriodChange?: (period: string) => void;
}

export const useDatePickerState = ({
  value,
  pickerMode,
  minDate,
  maxDate,
  recentMonths,
  onChange,
  onPeriodChange,
}: UseDatePickerStateProps) => {
  const [selectedDate, setSelectedDate] = useState(value);
  const [previousValidValue, setPreviousValidValue] = useState(value);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const effectiveDateRange = useMemo(
    () => calculateDateRange(recentMonths, pickerMode, minDate, maxDate),
    [recentMonths, pickerMode, minDate, maxDate]
  );

  const parsedSelectedDate = useMemo(() => parseDate(selectedDate, pickerMode), [selectedDate, pickerMode]);
  const minDateObj = useMemo(() => parseDate(effectiveDateRange.minDate, pickerMode), [effectiveDateRange.minDate, pickerMode]);
  const maxDateObj = useMemo(() => parseDate(effectiveDateRange.maxDate, pickerMode), [effectiveDateRange.maxDate, pickerMode]);

  const isInRange = useCallback(
    (dateStr: string) => isDateInRange(dateStr, effectiveDateRange.minDate, effectiveDateRange.maxDate),
    [effectiveDateRange]
  );

  const updateDate = useCallback((newValue: string, updatePrevious = true) => {
    setSelectedDate(newValue);
    if (updatePrevious && (newValue === '' || isInRange(newValue))) {
      setPreviousValidValue(newValue);
    }
    onChange?.(newValue);
    if (pickerMode === 'month' && onPeriodChange) {
      const period = formatDateDisplay(newValue);
      if (period) onPeriodChange(period);
    }
  }, [onChange, onPeriodChange, pickerMode, isInRange]);

  useEffect(() => {
    if (selectedDate) {
      const match = selectedDate.match(/(\d{4})-(\d{2})/);
      if (match) {
        setViewYear(parseInt(match[1], 10));
        setViewDate(new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, 1));
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    if (value !== selectedDate) {
      setSelectedDate(value);
      if (value === '' || isInRange(value)) setPreviousValidValue(value);
    }
  }, [value, selectedDate, isInRange]);

  return {
    selectedDate,
    previousValidValue,
    effectiveDateRange,
    parsedSelectedDate,
    minDateObj,
    maxDateObj,
    viewYear,
    viewDate,
    setViewYear,
    setViewDate,
    updateDate,
    isInRange,
  };
};
