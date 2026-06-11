import styles from './IndexListLayout.module.scss'

export interface IndexListLayoutProps {
  readonly children: React.ReactNode
  readonly sidebar?: React.ReactNode
  /** サイドバーをメインの左右どちらに置くか。default 'right' */
  readonly sidebarPosition?: 'left' | 'right'
  readonly className?: string
}

/**
 * 記事一覧ページのレイアウト。
 * 中央カラム（main）+ サイドバー（デフォルト右）。レスポンシブで1カラムに畳む。
 */
export function IndexListLayout({
  children,
  sidebar,
  sidebarPosition = 'right',
  className,
}: IndexListLayoutProps) {
  const posClass = sidebarPosition === 'left' ? styles.sidebarLeft : styles.sidebarRight
  const rootClass = `${styles.root} ${posClass}${className ? ` ${className}` : ''}`
  return (
    <div className={rootClass}>
      <div className={styles.main}>{children}</div>
      {sidebar && <div className={styles.sidebar}>{sidebar}</div>}
    </div>
  )
}

export default IndexListLayout
