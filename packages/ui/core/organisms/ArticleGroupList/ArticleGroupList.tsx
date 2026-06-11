import styles from './ArticleGroupList.module.scss'

export interface ArticleGroupItem {
  readonly key: string
  readonly href: string
  readonly label: string
  readonly current?: boolean
}

export interface ArticleGroup {
  readonly title: string
  readonly items: readonly ArticleGroupItem[]
  /** 初期展開するか */
  readonly defaultOpen?: boolean
}

export interface ArticleGroupListProps {
  readonly title?: string
  readonly groups: readonly ArticleGroup[]
  readonly linkAs?: (props: { href: string; children: React.ReactNode; className?: string }) => React.ReactElement
  readonly className?: string
}

/**
 * 複数グループ + 折りたたみ式リスト。記事詳細ページのサイドバー等で使う。
 * 各 group は <details>/<summary> で折りたたまれ、現在閲覧中のアイテムはハイライト。
 */
export function ArticleGroupList({
  title = '記事一覧',
  groups,
  linkAs,
  className,
}: ArticleGroupListProps) {
  const LinkLike = linkAs
  return (
    <aside className={`${styles.root}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      {groups.map((g) => {
        if (g.items.length === 0) return null
        return (
          <details key={g.title} className={styles.group} open={g.defaultOpen}>
            <summary className={styles.summary}>
              <span>{g.title}</span>
              <span className={styles.count}>{g.items.length}</span>
            </summary>
            <ul className={styles.list}>
              {g.items.map((item) => {
                const cls = item.current ? styles.current : undefined
                if (LinkLike) {
                  return (
                    <li key={item.key}>
                      <LinkLike href={item.href} className={cls}>
                        {item.label}
                      </LinkLike>
                    </li>
                  )
                }
                return (
                  <li key={item.key}>
                    <a href={item.href} className={cls}>
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </aside>
  )
}

export default ArticleGroupList
