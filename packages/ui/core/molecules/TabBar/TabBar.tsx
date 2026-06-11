'use client'

/**
 * 汎用タブバーコンポーネント
 * ラベル表示 + ×で閉じれるシンプルなタブバー
 */
import { FC, Fragment } from 'react';

import { IconButton } from '../../molecules/IconButton';
import { useOperationLog } from '../../../infra/devtools';
import styles from './TabBar.module.scss';

export interface TabItem {
  /** タブの一意識別子 */
  id: string;
  /** タブに表示するラベル */
  label: string;
}

interface TabBarProps {
  /** タブ一覧 */
  tabs: TabItem[];
  /** アクティブなタブID */
  activeTabId: string | null;
  /** タブ選択時のコールバック */
  onSelectTab: (id: string) => void;
  /** タブを閉じる時のコールバック（指定しない場合は×ボタン非表示） */
  onCloseTab?: (id: string) => void;
  /** カスタムクラス名 */
  className?: string;
  /** アクティブタブのカラーテーマ */
  activeColor?: 'green' | 'blue' | 'teal';
  /** ラベルの最大幅 */
  maxLabelWidth?: number;
}

/**
 * 汎用タブバーコンポーネント
 */
export const TabBar: FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  className,
  activeColor = 'green',
  maxLabelWidth = 150,
}) => {
  const log = useOperationLog('TabBar');

  if (tabs.length === 0) {
    return null;
  }

  const handleSelectTab = (id: string, label: string) => {
    log('select', { id, label });
    onSelectTab(id);
  };

  const handleCloseTab = (id: string, label: string) => {
    log('close', { id, label });
    onCloseTab?.(id);
  };

  const containerClasses = [styles.tabBar, className].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      role="tablist"
      data-component="tab-bar"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        const tabClasses = [
          styles.tabBar__tab,
          isActive && styles['tabBar__tab--active'],
        ].filter(Boolean).join(' ');

        return (
          <Fragment key={tab.id}>
            {/* タブ間のセパレーター */}
            {index > 0 && (
              <div className={styles.tabBar__separator} />
            )}
            <div
              className={tabClasses}
              data-color={activeColor}
              onClick={() => handleSelectTab(tab.id, tab.label)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectTab(tab.id, tab.label);
                }
              }}
            >
              <span
                className={styles.tabBar__label}
                style={{ maxWidth: `${maxLabelWidth}px` }}
              >
                {tab.label}
              </span>
              {onCloseTab && (
                <IconButton
                  icon="x"
                  size={12}
                  label={`${tab.label}のタブを閉じる`}
                  className={styles.tabBar__closeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id, tab.label);
                  }}
                />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};
