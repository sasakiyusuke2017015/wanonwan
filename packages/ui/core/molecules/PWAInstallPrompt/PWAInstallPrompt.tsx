'use client'

import { FC, useEffect, useState } from 'react';
import { Button } from '../../molecules/Button';
import { IconButton } from '../../molecules/IconButton';
import { Text } from '../../atoms/Text';

import styles from './PWAInstallPrompt.module.scss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA インストールプロンプト
 * beforeinstallprompt イベントをハンドリングしてインストールボタンを表示
 */
export const PWAInstallPrompt: FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // デフォルトのインストールプロンプトを抑制
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 既にインストール済みか確認
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // インストールプロンプトを表示
    await deferredPrompt.prompt();

    // ユーザーの選択結果を待つ
    await deferredPrompt.userChoice;

    // プロンプトをクリア
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={styles.wrapper} data-component="pwa-install-prompt">
      <div className={styles.card}>
        <div className={styles.contentRow}>
          <div className={styles.contentBody}>
            <Text as="h3" size="sm" weight="semibold" className={styles.title}>
              アプリをインストール
            </Text>
            <Text as="p" size="xs" variant="muted" className={styles.subtitle}>
              ホーム画面に追加して、アプリのように使用できます
            </Text>
          </div>
          <IconButton
            icon="x"
            size={20}
            label="閉じる"
            onClick={handleDismiss}
            className={styles.closeButton}
          />
        </div>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="small"
            onClick={handleInstallClick}
            leftIcon={'check-circle'}
            enableHopEffect={false}
          >
            インストール
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={handleDismiss}
            enableHopEffect={false}
          >
            後で
          </Button>
        </div>
      </div>
    </div>
  );
};
