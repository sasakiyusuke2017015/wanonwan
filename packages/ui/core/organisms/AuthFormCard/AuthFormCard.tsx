import type { ReactNode } from 'react';

import styles from './AuthFormCard.module.scss';

export interface AuthFormCardProps {
  children: ReactNode;
  /** コピーライトテキスト */
  copyrightText?: string;
  /** カスタムマージン用 className（指定時はデフォルトマージン無効） */
  marginClassName?: string;
  /** カスタムパディング用 className（指定時はデフォルトパディング無効） */
  paddingClassName?: string;
  /** 追加の className */
  className?: string;
}

/**
 * 認証ページ用フォームカード（モバイル版）
 * ログイン・パスワード変更などで使用
 */
export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  children,
  copyrightText = '© 2026 SMS DataTech',
  marginClassName,
  paddingClassName,
  className,
}) => {
  const cardClasses = [
    styles.authFormCard,
    !marginClassName && styles['authFormCard--defaultMargin'],
    !paddingClassName && styles['authFormCard--defaultPadding'],
    marginClassName,
    paddingClassName,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div data-component="AuthFormCard" className={cardClasses}>
      <div className={styles.authFormCard__content}>
        {children}
      </div>
      <div className={styles.authFormCard__copyright}>
        {copyrightText}
      </div>
    </div>
  );
};
