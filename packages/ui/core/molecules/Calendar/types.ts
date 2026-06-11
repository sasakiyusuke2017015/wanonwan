/**
 * Calendar 型定義
 */

export type CalendarMode = 'date' | 'month';

/** ハイライト月の指定（複数色対応） */
export interface HighlightedMonth {
  month: string; // YYYY-MM形式
  colors: string[]; // Tailwindカラー名 (red, blue, green等) またはカラーコード (#ff0000等) の配列
}

export interface CalendarProps {
  /** 選択モード */
  mode?: CalendarMode;
  /** 表示する年月 */
  viewDate?: Date;
  /** 選択中の日付 */
  selectedDate?: Date | null;
  /** 選択可能な最小日付 */
  minDate?: Date | null;
  /** 選択可能な最大日付 */
  maxDate?: Date | null;
  /** ヘッダー背景色 */
  primaryBgColor?: string;
  /** 角丸 */
  borderRadius?: string;
  /** ハイライト表示する月の配列（monthモードのみ） */
  highlightedMonths?: HighlightedMonth[];
  /** 日付/月選択時のコールバック */
  onSelect?: (date: Date) => void;
  /** 月/年変更時のコールバック */
  onNavigate?: (date: Date) => void;
  /** 追加のクラス名 */
  className?: string;
}
