// src/components/common/molecules/StepIndicator.tsx
import { FC } from 'react';

import { Icon } from '../../atoms/Icon';
import { type IconName, type LoadingIconName } from '../../constants';
import styles from './StepIndicator.module.scss';

export type StepStatus = 'completed' | 'in_progress' | 'pending';

export interface Step {
  /** ステップのラベル */
  label: string;
  /** ステップの状態 */
  status: StepStatus;
  /** in_progress時に表示するローディングアイコン（デフォルト: loading-spinner） */
  loadingIcon?: LoadingIconName;
  /** completed時に表示するアイコン（デフォルト: チェックマーク） */
  completedIcon?: IconName;
}

export interface StepIndicatorProps {
  /** ステップの配列 */
  steps: Step[];
  /** タイトル（省略可） */
  title?: string;
  /** 完了ステップの色（デフォルト: green） */
  completedColor?: 'green' | 'blue' | 'purple' | 'teal';
  /** 進行中ステップの色（デフォルト: blue） */
  activeColor?: 'green' | 'blue' | 'purple' | 'teal' | 'orange';
  /** カスタムクラス */
  className?: string;
  /** アニメーションを有効にする（デフォルト: true） */
  animated?: boolean;
}

/**
 * StepIndicator - ステップの進捗を視覚的に表示するコンポーネント
 *
 * ユースケース:
 * - フォームウィザード
 * - オンボーディングプロセス
 * - 注文/配送状況
 * - タスク進捗
 */
export const StepIndicator: FC<StepIndicatorProps> = ({
  steps,
  title,
  completedColor = 'green',
  activeColor = 'blue',
  className,
  animated = true,
}) => {
  const containerClasses = [styles.stepIndicator, className].filter(Boolean).join(' ');

  const getIconClasses = (status: StepStatus) => {
    const classes = [styles.stepIndicator__icon];
    if (animated) classes.push(styles['stepIndicator__icon--animated']);

    switch (status) {
      case 'completed':
        classes.push(styles['stepIndicator__icon--completed']);
        break;
      case 'in_progress':
        classes.push(styles['stepIndicator__icon--inProgress']);
        break;
      case 'pending':
        classes.push(styles['stepIndicator__icon--pending']);
        break;
    }
    return classes.join(' ');
  };

  const getLabelClasses = () => {
    const classes = [styles.stepIndicator__label];
    if (animated) classes.push(styles['stepIndicator__label--animated']);
    return classes.join(' ');
  };

  return (
    <div className={containerClasses} data-component="step-indicator">
      {title && (
        <div className={styles.stepIndicator__title}>{title}</div>
      )}
      <div className={styles.stepIndicator__steps}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const loadingIcon = step.loadingIcon || 'spinner';

          // 次のステップの状態に基づいてコネクターの色を決定
          const nextStep = steps[index + 1];
          const isConnectorCompleted = step.status === 'completed' && nextStep?.status !== 'pending';

          const colorAttr = step.status === 'completed' ? completedColor : activeColor;

          return (
            <div key={index} className="contents">
              {/* ステップ */}
              <div className={styles.stepIndicator__step}>
                {step.status === 'completed' && (
                  <div
                    className={getIconClasses('completed')}
                    data-color={completedColor}
                  >
                    {step.completedIcon ? (
                      <Icon name={step.completedIcon} size={20} stroke="white" />
                    ) : (
                      '✓'
                    )}
                  </div>
                )}
                {step.status === 'in_progress' && (
                  <div
                    className={getIconClasses('in_progress')}
                    data-color={activeColor}
                  >
                    <Icon name={loadingIcon} size={20} stroke="white" fill="white" />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className={getIconClasses('pending')}>
                    {index + 1}
                  </div>
                )}
                <span
                  className={getLabelClasses()}
                  data-status={step.status}
                  data-color={colorAttr}
                >
                  {step.label}
                </span>
              </div>

              {/* コネクター */}
              {!isLast && (
                <div className={styles.stepIndicator__connector}>
                  <div
                    className={[
                      styles.stepIndicator__connector__fill,
                      animated && styles['stepIndicator__connector__fill--animated'],
                      isConnectorCompleted && styles['stepIndicator__connector__fill--completed'],
                    ].filter(Boolean).join(' ')}
                    data-color={completedColor}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
