import React from 'react';

import styles from './StatisticItem.module.scss';

export interface StatisticItemProps {
  /** 丸印の背景色（CSSカラー値またはクラス名） */
  dotColor: string;
  /** ラベルテキスト */
  label: string;
  /** ラベルのテキスト色（CSSカラー値またはクラス名） */
  labelColor: string;
  /** 表示する値 */
  value: string | number;
  /** 単位（例: "名", "件"）（オプション） */
  unit?: string;
}

/**
 * 統計情報の個別項目を表示するコンポーネント
 * 丸印 + ラベル + 値 + 単位 の形式で表示
 */
export const StatisticItem: React.FC<StatisticItemProps> = ({
  dotColor,
  label,
  labelColor,
  value,
  unit,
}) => {
  return (
    <span className={styles.root} data-component="statistic-item">
      <span className={`${styles.dot} ${dotColor}`}></span>
      <span className={`${styles.label} ${labelColor}`}>{label}</span>
      <span className={styles.value}>
        {value}
        {unit}
      </span>
    </span>
  );
};
