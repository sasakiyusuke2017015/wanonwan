import type { ReactNode } from 'react'

import styles from './AppShell.module.scss'

export interface AppShellProps {
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
export function AppShell({
  header,
  sidebar,
  statusBar,
  children,
  className,
}: AppShellProps) {
  const containerClasses = [styles.appShell, className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} data-component="AppShell">
      {header}
      <div className={styles.appShell__body}>
        {sidebar}
        <main className={styles.appShell__main}>
          {children}
        </main>
      </div>
      {statusBar}
    </div>
  )
}

