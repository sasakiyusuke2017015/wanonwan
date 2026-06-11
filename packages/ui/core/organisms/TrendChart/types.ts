/**
 * TrendChart 型定義
 */

export interface Dataset {
  label: string;
  data: (number | null)[];
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface DataPointClickData {
  label: string; // 「満足度」「ストレス」など
  value: number; // データの値
  month: string; // 「2025/4」など
  allData: Record<string, unknown>; // その月の全データ
}

export interface TrendChartProps {
  data: ChartData;
  height?: number;
  className?: string;
  animationDuration?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  maxValue?: number | null;
  minValue?: number;
  showParticles?: boolean;
  onDataPointClick?: (data: DataPointClickData) => void;
  onMonthClick?: (month: string) => void;
  currentMonth?: string;
  /** カードの角丸 - Layout から props で渡す */
  cardRadius?: string;
}

/** 系列の表示状態 */
export type DatasetState = 'normal' | 'bold' | 'hidden';
