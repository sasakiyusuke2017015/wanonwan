/**
 * FilterField 型定義
 */

/** フィルタタイプ */
export type FilterFieldType = 'text' | 'status' | 'score' | 'date' | 'dateRange';

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
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
  /** ドロップダウンの角丸 - Layout から props で渡す */
  dropdownRadius?: string;
}

/** テキストフィルタProps */
export interface TextFilterProps extends FilterFieldBaseProps {
  type: 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** ステータスフィルタProps（複数選択チェックボックス） */
export interface StatusFilterProps extends FilterFieldBaseProps {
  type: 'status';
  value: string[];
  onChange: (value: string[]) => void;
  options: FilterOption[];
}

/** スコアフィルタProps（範囲） */
export interface ScoreFilterProps extends FilterFieldBaseProps {
  type: 'score';
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

/** 日付フィルタProps */
export interface DateFilterProps extends FilterFieldBaseProps {
  type: 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** 日付範囲フィルタProps（単一選択） */
export interface DateRangeFilterProps extends FilterFieldBaseProps {
  type: 'dateRange';
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export type FilterFieldProps =
  | TextFilterProps
  | StatusFilterProps
  | ScoreFilterProps
  | DateFilterProps
  | DateRangeFilterProps;
