'use client'

// SurveyCard - アンケートカードコンポーネント
import { FC } from 'react';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { type IconName } from '../../constants';

import styles from './SurveyCard.module.scss';

export interface SurveyCardProps {
  id: string;
  title: string;
  description?: string;
  period: string;
  status: string;
  statusColor: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange';
  headerColor: string;
  buttonVariant: 'primary' | 'danger' | 'outline';
  buttonText: string;
  buttonIcon?: IconName;
  onClick?: () => void;
  /** カードの角丸 - Layout から props で渡す */
  cardRadius?: string;
}

/**
 * アンケートカードコンポーネント
 * アンケート一覧で使用する再利用可能なカード
 */
export const SurveyCard: FC<SurveyCardProps> = ({
  id: _id,
  title,
  description,
  period,
  status,
  statusColor,
  headerColor,
  buttonVariant,
  buttonText,
  buttonIcon,
  onClick,
  cardRadius = '0.5rem',
}) => {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <div className={styles.col} data-component="survey-card">
      <div className={styles.card} style={{ borderRadius: cardRadius }}>
        {/* 期間ヘッダー */}
        <div className={`${styles.header} ${headerColor}`}>
          期間: {period}
        </div>

        {/* カード本体 */}
        <div className={styles.body}>
          {/* ステータスバッジ */}
          <div className={styles.statusWrap}>
            <Badge
              value={status}
              color={statusColor}
              size="small"
              appearance="status"
            />
          </div>

          {/* タイトル */}
          <Text as="h5" weight="semibold" className={styles.title}>
            <Icon
              name={'file'}
              size={20}
              className={styles.titleIcon}
            />
            <span className={styles.titleText}>{title}</span>
          </Text>

          {/* 掲載内容 */}
          {description && (
            <Text as="p" variant="muted" className={styles.description}>{description}</Text>
          )}
        </div>

        {/* フッター（ボタン） */}
        <div className={styles.footer}>
          <Button
            variant={buttonVariant}
            size="small"
            rightIcon={buttonIcon}
            onClick={handleClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
