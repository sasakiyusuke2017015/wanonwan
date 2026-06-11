import styles from './ArticleLayout.module.scss'

export interface ArticleLayoutProps {
  /** 左サイドバー（目次など） */
  readonly left?: React.ReactNode
  /** 記事本文 */
  readonly children: React.ReactNode
  /** 右サイドバー（他記事リスト等） */
  readonly right?: React.ReactNode
  readonly className?: string
}

/**
 * 記事詳細の3カラムレイアウト。
 * レスポンシブで左カラム（TOC）→非表示、最後は1カラムに畳む。
 */
export function ArticleLayout({ left, children, right, className }: ArticleLayoutProps) {
  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {left && <div className={styles.left}>{left}</div>}
      <div className={styles.main}>{children}</div>
      {right && <div className={styles.right}>{right}</div>}
    </div>
  )
}

export default ArticleLayout
