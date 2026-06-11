'use client'

import { useState, useEffect, useRef } from 'react';

import { type ColorTheme } from '../../constants';
import { Icon } from '../../atoms/Icon';
import { Spinner } from '../../atoms/Spinner';
import { Text } from '../../atoms/Text';
import type { LoadingPreset } from '../../atoms/Icon/types';

import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
  message?: string;
  /** ローディングプリセット */
  preset?: LoadingPreset;
  /** アイコンサイズ（デフォルト: 64） */
  iconSize?: number;
  /** カラーテーマ（未指定時はグローバルテーマを使用） - 現在は未使用 */
  colorTheme?: ColorTheme;
  /** 表示状態（このpropで制御する場合） */
  isVisible?: boolean;
  /** 最低表示時間(ms) - ローディングが短すぎるフラッシュを防止 */
  minDisplayTime?: number;
  /** 非表示完了時のコールバック */
  onHideComplete?: () => void;
  /** アクセント背景色 - Layout から props で渡す */
  accentBgColor?: string;
}

export function LoadingOverlay({
  message = "データを読み込んでいます...",
  preset,
  iconSize = 64,
  isVisible = true,
  minDisplayTime = 500,
  onHideComplete,
  accentBgColor = '#3b82f6', // デフォルト値（blue-500）
}: LoadingOverlayProps) {

  // 最低表示時間の制御
  const [showOverlay, setShowOverlay] = useState(isVisible);
  const visibleStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      // 表示開始
      setShowOverlay(true);
      visibleStartTimeRef.current = Date.now();
    } else if (visibleStartTimeRef.current !== null) {
      // 非表示要求 - 最低表示時間をチェック
      const elapsed = Date.now() - visibleStartTimeRef.current;
      const remaining = minDisplayTime - elapsed;

      if (remaining > 0) {
        // 最低表示時間に満たない場合は待機
        const timer = setTimeout(() => {
          setShowOverlay(false);
          visibleStartTimeRef.current = null;
          onHideComplete?.();
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        // 最低表示時間を超えている場合は即座に非表示
        setShowOverlay(false);
        visibleStartTimeRef.current = null;
        onHideComplete?.();
      }
    } else {
      // 初回レンダリング時でisVisible=falseの場合
      setShowOverlay(false);
    }
  }, [isVisible, minDisplayTime, onHideComplete]);

  if (!showOverlay) {
    return null;
  }

  return (
    <div className={styles.loadingOverlay} data-component="LoadingOverlay">
      <div className={styles.loadingOverlay__card}>
        <div className={styles.loadingOverlay__content}>
          {preset ? (
            <Icon
              preset={preset}
              size={iconSize}
              className={styles.loadingOverlay__icon}
              style={{ color: accentBgColor }}
            />
          ) : (
            <Spinner size="lg" variant="info" className={styles.loadingOverlay__spinner} />
          )}
          <Text as="p" variant="muted" className={styles.loadingOverlay__message}>{message}</Text>
        </div>
      </div>
    </div>
  );
}
