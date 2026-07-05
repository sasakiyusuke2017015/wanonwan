'use client'

// SurveyCardSkeleton - SurveyCard のローディングプレースホルダ
import { FC } from 'react';

import styles from './SurveyCard.module.scss';

export interface SurveyCardSkeletonProps {
  /** カードの角丸 - Layout から props で渡す */
  cardRadius?: string;
}

/**
 * アンケートカードのスケルトン
 * 一覧のローディング中に SurveyCard と同じ枠組みで表示する
 */
export const SurveyCardSkeleton: FC<SurveyCardSkeletonProps> = ({ cardRadius = '0.5rem' }) => (
  <div className={styles.col} data-component="survey-card-skeleton" aria-hidden="true">
    <div className={styles.card} style={{ borderRadius: cardRadius }}>
      <div className={styles.skeletonHeader} />
      <div className={styles.body}>
        <div className={styles.skeletonBadge} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
      <div className={styles.footer}>
        <div className={styles.skeletonButton} />
      </div>
    </div>
  </div>
);
