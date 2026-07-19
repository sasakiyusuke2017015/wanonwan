import type { ReactNode } from 'react'

import styles from './ShellLayout.module.scss'

export interface ShellLayoutProps {
  /** ヘッダースロット */
  header: ReactNode
  /** サイドバースロット */
  sidebar: ReactNode
  /** ステータスバースロット（オプション） */
  statusBar?: ReactNode
  /** メインコンテンツ */
  children: ReactNode
  /** 追加の className */
  className?: string
}

/**
 * アプリケーションシェルレイアウト
 *
 * header + sidebar + main + statusBar の4スロット構成。
 * デスクトップアプリやダッシュボードの基本レイアウトとして使用。
 */
export function ShellLayout({
  header,
  sidebar,
  statusBar,
  children,
  className,
}: ShellLayoutProps) {
  const containerClasses = [styles.shellLayout, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} data-component="ShellLayout">
      {header}
      <div className={styles.shellLayout__body}>
        {sidebar}
        <main className={styles.shellLayout__main}>
          {children}
        </main>
      </div>
      {statusBar}
    </div>
  )
}

