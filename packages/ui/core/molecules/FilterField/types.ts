/**
 * FilterField 型定義
 */
import type { KeyboardEvent } from 'react';

import type { IconName } from '../../constants';

/** フィルタタイプ */
export type FilterFieldType = 'text' | 'select' | 'multiSelect' | 'numberRange' | 'date';

/** 選択肢オプション */
export interface FilterOption {
  value: string;
  label: string;
}

/** 共通Props */
export interface FilterFieldBaseProps {
  /** フィールドラベル */
  label: string;
  /** 無効化 */
  disabled?: boolean;
  /** カスタムクラス */
  className?: string;
}

/** テキストフィルタProps */
export interface TextFilterProps extends FilterFieldBaseProps {
  type: 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 入力左に出すアイコン (検索カード等) */
  icon?: IconName;
  /** Enter 送信など、入力へのキーイベント */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

/** 単一選択フィルタProps（ドロップダウン） */
export interface SelectFilterProps extends FilterFieldBaseProps {
  type: 'select';
  /** 未選択は '' */
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  /** 先頭に空(未選択)選択肢を出す (default: true) */
  allowEmpty?: boolean;
  /** 空(未選択)オプションのラベル */
  emptyLabel?: string;
}

/** 複数選択フィルタProps（チェックボックス付きドロップダウン） */
export interface MultiSelectFilterProps extends FilterFieldBaseProps {
  type: 'multiSelect';
  value: string[];
  onChange: (value: string[]) => void;
  options: FilterOption[];
  /** 全解除の空(すべて)選択肢を出す (default: false) */
  allowEmpty?: boolean;
  /** 空(すべて)オプションのラベル */
  emptyLabel?: string;
}

/** 数値範囲フィルタProps */
export interface NumberRangeFilterProps extends FilterFieldBaseProps {
  type: 'numberRange';
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

/** 日付フィルタProps（YYYY-MM-DD テキスト入力） */
export interface DateFilterProps extends FilterFieldBaseProps {
  type: 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export type FilterFieldProps =
  | TextFilterProps
  | SelectFilterProps
  | MultiSelectFilterProps
  | NumberRangeFilterProps
  | DateFilterProps;
