'use client'

/**
 * フィルタフィールドコンポーネント
 * 「ラベル + 入力」のカード 1 枚でフィルタ入力を提供する。
 * text / select (単一) / multiSelect (複数) / numberRange (範囲) / date の 5 タイプ。
 */
import { FC, ReactNode, useId } from 'react';

import { Select } from '../../molecules/Select';
import { Input } from '../../molecules/Input';
import styles from './FilterField.module.scss';

import type {
  TextFilterProps,
  SelectFilterProps,
  MultiSelectFilterProps,
  NumberRangeFilterProps,
  DateFilterProps,
  FilterFieldProps,
} from './types';

/**
 * フィルタフィールドラッパー。
 * `controlId` を label の htmlFor に紐付ける (各タイプが useId で採番して入力側にも渡す)。
 */
const FilterFieldWrapper: FC<{
  label: string;
  controlId: string;
  disabled?: boolean;
  className?: string;
  filterType?: string;
  children: ReactNode;
}> = ({ label, controlId, disabled, className, filterType, children }) => {
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
      <label className={styles.filterField__label} htmlFor={controlId}>
        {label}
      </label>
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
  icon,
  onKeyDown,
  disabled,
  className,
}) => {
  const id = useId();
  return (
    <FilterFieldWrapper
      label={label}
      controlId={id}
      disabled={disabled}
      className={className}
      filterType="text"
    >
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        icon={icon}
        iconPosition="left"
        disabled={disabled}
        size="small"
      />
    </FilterFieldWrapper>
  );
};

/**
 * 複数選択フィルタ（チェックボックス付きドロップダウン）
 */
const MultiSelectFilter: FC<MultiSelectFilterProps> = ({
  label,
  value,
  onChange,
  options,
  allowEmpty = false,
  emptyLabel,
  disabled,
  className,
}) => {
  const id = useId();
  return (
    <FilterFieldWrapper
      label={label}
      controlId={id}
      disabled={disabled}
      className={className}
      filterType="multiSelect"
    >
      <Select<string>
        id={id}
        multiple
        options={options}
        value={value}
        onChange={onChange}
        placeholder="-"
        disabled={disabled}
        size="small"
        width="w-full"
        allowEmpty={allowEmpty}
        emptyLabel={emptyLabel}
      />
    </FilterFieldWrapper>
  );
};

/**
 * 数値範囲フィルタ
 */
const NumberRangeFilter: FC<NumberRangeFilterProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 5,
  disabled,
  className,
}) => {
  const id = useId();
  const [minValue, maxValue] = value;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  return (
    <FilterFieldWrapper
      label={label}
      controlId={id}
      disabled={disabled}
      className={className}
      filterType="numberRange"
    >
      <div className={styles.filterField__rangeWrapper}>
        <Input
          id={id}
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
          aria-label={`${label} (最大)`}
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
}) => {
  const id = useId();
  return (
    <FilterFieldWrapper
      label={label}
      controlId={id}
      disabled={disabled}
      className={className}
      filterType="date"
    >
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        size="small"
      />
    </FilterFieldWrapper>
  );
};

/**
 * 単一選択フィルタ（ドロップダウン）
 */
const SelectFilter: FC<SelectFilterProps> = ({
  label,
  value,
  onChange,
  options,
  allowEmpty = true,
  emptyLabel,
  disabled,
  className,
}) => {
  const id = useId();
  return (
    <FilterFieldWrapper
      label={label}
      controlId={id}
      disabled={disabled}
      className={className}
      filterType="select"
    >
      <Select
        id={id}
        options={options}
        value={value || undefined}
        onChange={(v) => onChange(v ?? '')}
        placeholder="-"
        disabled={disabled}
        size="small"
        width="w-full"
        allowEmpty={allowEmpty}
        emptyLabel={emptyLabel}
      />
    </FilterFieldWrapper>
  );
};

/**
 * フィルタフィールドコンポーネント
 * typeに応じて適切なフィルタUIを表示
 */
export const FilterField: FC<FilterFieldProps> = (props) => {
  switch (props.type) {
    case 'text':
      return <TextFilter {...props} />;
    case 'select':
      return <SelectFilter {...props} />;
    case 'multiSelect':
      return <MultiSelectFilter {...props} />;
    case 'numberRange':
      return <NumberRangeFilter {...props} />;
    case 'date':
      return <DateFilter {...props} />;
    default:
      return null;
  }
};
