'use client'

/**
 * フィルタフィールドコンポーネント
 * 統一されたデザインでフィルタ入力を提供
 */
import { FC, ReactNode } from 'react';

import { Select } from '../../molecules/Select';
import { Input } from '../../molecules/Input';
import styles from './FilterField.module.scss';

import type {
  TextFilterProps,
  StatusFilterProps,
  ScoreFilterProps,
  DateFilterProps,
  DateRangeFilterProps,
  FilterFieldProps,
} from './types';

/**
 * フィルタフィールドラッパー
 */
const FilterFieldWrapper: FC<{
  label: string;
  disabled?: boolean;
  className?: string;
  filterType?: string;
  children: ReactNode;
}> = ({ label, disabled, className, filterType, children }) => {
  const wrapperClasses = [
    styles.filterField,
    disabled && styles['filterField--disabled'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClasses}
      data-component="filter-field"
      data-filter-type={filterType}
    >
      <label className={styles.filterField__label}>{label}</label>
      <div className={styles.filterField__content}>{children}</div>
    </div>
  );
};

/**
 * テキストフィルタ
 */
const TextFilter: FC<TextFilterProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}) => (
  <FilterFieldWrapper label={label} disabled={disabled} className={className} filterType="text">
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      size="small"
    />
  </FilterFieldWrapper>
);

/**
 * ステータスフィルタ（複数選択チェックボックス）
 * 共通 Select コンポーネントの multiple モードを使用
 */
const StatusFilter: FC<StatusFilterProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  className,
  borderRadius,
}) => (
  <FilterFieldWrapper label={label} disabled={disabled} className={className} filterType="status">
    <Select<string>
      multiple
      options={options}
      value={value}
      onChange={onChange}
      placeholder="-"
      disabled={disabled}
      size="small"
      width="w-full"
      allowEmpty={false}
      borderRadius={borderRadius}
    />
  </FilterFieldWrapper>
);

/**
 * スコアフィルタ（範囲入力）
 */
const ScoreFilter: FC<ScoreFilterProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  disabled,
  className,
}) => {
  const [minValue, maxValue] = value;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  return (
    <FilterFieldWrapper label={label} disabled={disabled} className={className} filterType="score">
      <div className={styles.filterField__rangeWrapper}>
        <Input
          type="number"
          value={String(minValue)}
          onChange={(e) => {
            const v = clamp(Number(e.target.value));
            onChange([v, Math.max(v, maxValue)]);
          }}
          disabled={disabled}
          size="small"
          className={styles.filterField__rangeInput}
          min={min}
          max={max}
        />
        <span className={styles.filterField__rangeSeparator}>〜</span>
        <Input
          type="number"
          value={String(maxValue)}
          onChange={(e) => {
            const v = clamp(Number(e.target.value));
            onChange([Math.min(minValue, v), v]);
          }}
          disabled={disabled}
          size="small"
          className={styles.filterField__rangeInput}
          min={min}
          max={max}
        />
      </div>
    </FilterFieldWrapper>
  );
};

/**
 * 日付フィルタ
 */
const DateFilter: FC<DateFilterProps> = ({
  label,
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled,
  className,
}) => (
  <FilterFieldWrapper label={label} disabled={disabled} className={className} filterType="date">
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      size="small"
    />
  </FilterFieldWrapper>
);

/**
 * 日付範囲フィルタ（単一選択ドロップダウン）
 * 共通 Select コンポーネントを使用
 */
const DateRangeFilter: FC<DateRangeFilterProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  className,
  borderRadius,
}) => (
  <FilterFieldWrapper label={label} disabled={disabled} className={className} filterType="dateRange">
    <Select
      options={options}
      value={value || undefined}
      onChange={(v) => onChange(v ?? '')}
      placeholder="-"
      disabled={disabled}
      size="small"
      width="w-full"
      allowEmpty={true}
      borderRadius={borderRadius}
    />
  </FilterFieldWrapper>
);

/**
 * フィルタフィールドコンポーネント
 * typeに応じて適切なフィルタUIを表示
 */
export const FilterField: FC<FilterFieldProps> = (props) => {
  switch (props.type) {
    case 'text':
      return <TextFilter {...props} />;
    case 'status':
      return <StatusFilter {...props} />;
    case 'score':
      return <ScoreFilter {...props} />;
    case 'date':
      return <DateFilter {...props} />;
    case 'dateRange':
      return <DateRangeFilter {...props} />;
    default:
      return null;
  }
};
