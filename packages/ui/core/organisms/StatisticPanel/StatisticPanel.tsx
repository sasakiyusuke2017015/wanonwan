'use client'

import React, { useMemo } from 'react';

import { LoadingZone, PieChart } from '../../organisms';
import { StatisticList } from '../../molecules/StatisticList/StatisticList';
import type { StatisticListProps } from '../../molecules/StatisticList/StatisticList';
import type { LoadingPreset } from '../../atoms/Icon';
import styles from './StatisticPanel.module.scss';

// ===========================
// ステータス色定義（デフォルト）
// ===========================

/**
 * デフォルトのステータス色マップ
 * gray, green, blue, yellow, orange, red をサポート
 */
const DEFAULT_COLOR_MAP = {
  gray: { bg: 'bg-gray-400', text: 'text-gray-600', hex: '#9CA3AF' },
  green: { bg: 'bg-green-500', text: 'text-green-700', hex: '#10B981' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-700', hex: '#2563EB' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-700', hex: '#FBBF24' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', hex: '#F97316' },
  red: { bg: 'bg-red-500', text: 'text-red-700', hex: '#EF4444' },
} as const;

export type StatusColorKey = keyof typeof DEFAULT_COLOR_MAP;
export type StatusColorValue = { bg: string; text: string; hex: string };

/**
 * デフォルトの色解決関数
 */
const defaultGetStatusColor = (colorKey: string): StatusColorValue => {
  return DEFAULT_COLOR_MAP[colorKey as StatusColorKey] || DEFAULT_COLOR_MAP.gray;
};

// ===========================
// 型定義
// ===========================

/** ステータス定義の型 */
export interface StatusDefinition {
  value: number;
  color: string;
  label: string;
  shortLabel: string;
}

/** 統計パネルアイテムの型 */
export interface StatisticPanelItem {
  statusDef: StatusDefinition;
  value: number;
  /** ラベル上書き（指定しない場合はstatusDefのshortLabelを使用） */
  label?: string;
}

export interface StatisticPanelProps {
  /** 統計アイテム配列 */
  items?: StatisticPanelItem[];
  /** PieChartのデータ（オプション、後方互換性のため残す） */
  pieChartData?: Array<{ name: string; value: number; color: string }>;
  /** 統計項目のリスト（後方互換性のため残す） */
  statisticsItems?: StatisticListProps['items'];
  /** 合計のラベル（例: "全"）（オプション） */
  totalLabel?: string;
  /** 合計の値（オプション） */
  totalValue?: number;
  /** 合計の単位（例: "名", "件"）（オプション） */
  totalUnit?: string;
  /** items使用時の各項目の単位（デフォルト: "名"） */
  unit?: string;
  /** ローディング状態 */
  loading?: boolean;
  /** ローディングプリセット */
  loadingPreset?: LoadingPreset;
  /** ローディングアイコンのサイズ */
  loadingIconSize?: number;
  /** ローディングアイコンの色 */
  loadingIconColor?: string;
  /** データがない場合のメッセージ */
  emptyMessage?: string;
  /** カスタム色解決関数（デフォルトの色マップを上書き） */
  getStatusColor?: (colorKey: string) => StatusColorValue;
}

/**
 * 統計情報パネルコンポーネント
 * PieChart（オプション）+ StatisticList を表示し、ローディング状態も管理
 */
export const StatisticPanel: React.FC<StatisticPanelProps> = ({
  items,
  pieChartData: pieChartDataProp,
  statisticsItems: statisticsItemsProp,
  totalLabel,
  totalValue,
  totalUnit,
  unit = '名',
  loading = false,
  loadingPreset,
  loadingIconSize = 40,
  loadingIconColor,
  emptyMessage = '該当データなし',
  getStatusColor = defaultGetStatusColor,
}) => {
  // itemsが渡された場合、pieChartDataとstatisticsItemsを自動生成
  // 値が0の項目は表示しない
  const pieChartData = useMemo(() => {
    if (items) {
      return items
        .filter(({ value }) => value > 0)
        .map(({ statusDef, value, label }) => ({
          name: label ?? statusDef.shortLabel,
          value,
          color: getStatusColor(statusDef.color).hex,
        }));
    }
    return pieChartDataProp;
  }, [items, pieChartDataProp, getStatusColor]);

  const statisticsItems = useMemo(() => {
    if (items) {
      return items
        .filter(({ value }) => value > 0)
        .map(({ statusDef, value, label }) => {
          const colorMap = getStatusColor(statusDef.color);
          return {
            dotColor: colorMap.bg,
            label: label ?? statusDef.label,
            labelColor: colorMap.text,
            value,
            unit,
          };
        });
    }
    return statisticsItemsProp;
  }, [items, statisticsItemsProp, unit, getStatusColor]);

  const hasData = totalValue !== undefined && totalValue > 0;

  return (
    <LoadingZone
      loading={loading}
      variant="inline"
      preset={loadingPreset}
      size={loadingIconSize}
      fill={loadingIconColor}
    >
      {hasData ? (
        <div className={styles.root} data-component="statistic-panel" data-testid="statistics-panel">
          {pieChartData && <PieChart data={pieChartData} unit={unit} />}
          {statisticsItems && (
            <StatisticList
              items={statisticsItems}
              totalLabel={totalLabel}
              totalValue={totalValue}
              totalUnit={totalUnit}
            />
          )}
        </div>
      ) : (
        <span>{emptyMessage}</span>
      )}
    </LoadingZone>
  );
};

