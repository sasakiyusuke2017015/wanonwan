import styles from './TocList.module.scss'

export interface TocItem {
  readonly level: 2 | 3
  readonly text: string
  /** 同ページ内のアンカー（# 抜きのスラッグ） */
  readonly slug: string
}

export interface TocListProps {
  readonly items: readonly TocItem[]
  readonly title?: string
  readonly emptyLabel?: string
  readonly className?: string
}

/**
 * 記事内目次。アクティブハイライト（スクロール同期）は呼び出し側で行う。
 * （`data-toc-slug` 属性で IntersectionObserver 連携可能）
 */
export function TocList({
  items,
  title = '目次',
  emptyLabel = '見出しなし',
  className,
}: TocListProps) {
  return (
    <aside className={`${styles.root}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`#${item.slug}`}
                className={item.level === 3 ? styles.h3 : undefined}
                data-toc-slug={item.slug}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default TocList
