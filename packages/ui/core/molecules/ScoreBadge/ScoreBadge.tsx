/**
 * スコアバッジコンポーネント
 * 数値スコアに基づいて色分けされたバッジを表示する
 */
import { FC } from 'react';

import { Badge } from '../../atoms/Badge'

type BadgeSize = 'small' | 'medium' | 'large';
type ScoreColor = 'blue' | 'green' | 'yellow' | 'orange' | 'red';

interface ScoreBadgeProps {
  score: number;
  size?: BadgeSize;
  showValue?: boolean;
  className?: string;
}

export const ScoreBadge: FC<ScoreBadgeProps> = ({
  score,
  size = 'small',
  showValue = true,
  className = '',
}) => {
  /**
   * スコアに基づいて色を決定
   * 4.5以上: 青（非常に良好）
   * 3.5以上: 緑（良好）
   * 2.5以上: 黄（普通）
   * 1.5以上: オレンジ（注意）
   * 1.5未満: 赤（要対応）
   */
  const getScoreColor = (value: number): ScoreColor => {
    if (value >= 4.5) return 'blue';
    if (value >= 3.5) return 'green';
    if (value >= 2.5) return 'yellow';
    if (value >= 1.5) return 'orange';
    return 'red';
  };

  return (
    <span data-component="score-badge">
      <Badge
        value={showValue ? score : ''}
        styleVariant="compact"
        color={getScoreColor(score)}
        size={size}
        className={className}
      />
    </span>
  );
};
