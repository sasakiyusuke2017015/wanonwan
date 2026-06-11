import styles from './TagCloud.module.scss'

export interface TagCloudItem {
  readonly tag: string
  readonly count: number
  /** 任意: クリック時のリンク先 */
  readonly href?: string
}

export interface TagCloudProps {
  readonly items: readonly TagCloudItem[]
  /** 表示順: 'count-desc' = 件数降順 / 'alpha' = アルファベット / 'none' = 渡された順 */
  readonly order?: 'count-desc' | 'alpha' | 'none'
  /** 最大表示数（それ以上は省略） */
  readonly limit?: number
  /** 表示バリアント: 'badge' = バッジに件数併記 / 'cloud' = 文字サイズで頻度表現 */
  readonly variant?: 'badge' | 'cloud'
  /** タグ名の前後に付ける装飾（例: '#'） */
  readonly prefix?: string
  readonly className?: string
}

/**
 * タグクラウド。Server Component として安全に使える。
 * 遷移先は各 item.href に事前に入れておく。
 */
export function TagCloud({
  items,
  order = 'count-desc',
  limit,
  variant = 'badge',
  prefix = '#',
  className,
}: TagCloudProps) {
  const sorted = (() => {
    if (order === 'none') return items
    const arr = [...items]
    if (order === 'alpha') {
      arr.sort((a, b) => a.tag.localeCompare(b.tag))
    } else {
      arr.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    }
    return arr
  })()

  const displayed = typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  const maxCount = displayed.reduce((m, it) => Math.max(m, it.count), 1)

  return (
    <ul className={`${styles.list}${className ? ` ${className}` : ''}`}>
      {displayed.map((item) => {
        const size =
          variant === 'cloud' ? 0.82 + (item.count / maxCount) * 0.5 : undefined
        const content = (
          <>
            <span
              className={styles.tagLabel}
              style={size ? { fontSize: `${size}rem` } : undefined}
            >
              {prefix}
              {item.tag}
            </span>
            {variant === 'badge' && <span className={styles.count}>{item.count}</span>}
          </>
        )
        if (item.href) {
          return (
            <li key={item.tag} className={styles.item}>
              <a className={styles.link} href={item.href}>
                {content}
              </a>
            </li>
          )
        }
        return (
          <li key={item.tag} className={styles.item}>
            <span className={styles.link}>{content}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default TagCloud
