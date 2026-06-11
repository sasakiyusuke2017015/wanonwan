import React from 'react';

import { type StatisticItemProps } from '../../atoms/StatisticItem/StatisticItem';
import styles from './StatisticList.module.scss';

export interface StatisticListProps {
  /** 統計項目のリスト */
  items: StatisticItemProps[];
  /** 合計のラベル（例: "全"）（オプション） */
  totalLabel?: string;
  /** 合計の値（オプション） */
  totalValue?: number;
  /** 合計の単位（例: "名", "件"）（オプション） */
  totalUnit?: string;
}

/**
 * 統計情報のリストを表示するコンポーネント
 * StatisticItem を複数並べ、オプションで合計も表示
 */
export const StatisticList: React.FC<StatisticListProps> = ({
  items,
  totalLabel,
  totalValue,
  totalUnit,
}) => {
  return (
    <div className={styles.root} data-component="statistic-list">
      {/* 左側: 統計項目をグリッドで並べる */}
      <div className={styles.grid}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span className={`${styles.dot} ${item.dotColor}`}></span>
            <span className={`${styles.label} ${item.labelColor}`}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
            <span className={styles.unit}>{item.unit}</span>
          </React.Fragment>
        ))}
      </div>

      {/* 合計表示 */}
      {totalLabel !== undefined && totalValue !== undefined && (
        <>
          {items.length > 0 && <span className={styles.divider}>|</span>}
          <span className={styles.total}>
            <span className={styles.totalLabel}>{totalLabel}</span>
            <span className={styles.totalValue}>
              {totalValue}
              {totalUnit}
            </span>
          </span>
        </>
      )}
    </div>
  );
};
