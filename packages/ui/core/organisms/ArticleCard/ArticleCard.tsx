'use client'

import styles from './ArticleCard.module.scss'

export interface ArticleCardBadge {
  readonly label: string
  readonly tone?: 'neutral' | 'primary' | 'accent' | 'muted'
  /** カスタム background / color を CSS variables で指定 */
  readonly bg?: string
  readonly fg?: string
  /** バッジの先頭に表示するアイコン要素（ui-catalog Icon 等） */
  readonly icon?: React.ReactNode
}

export interface ArticleCardTag {
  readonly key: string
  readonly label: string
  readonly onClick?: (e: React.MouseEvent) => void
}

export interface ArticleCardProps {
  readonly title: string
  /** 表示用の日付文字列（例: "2026-04-22"、"明日 14:00"、"あと 3 日"）*/
  readonly date: string
  /**
   * `<time dateTime="...">` に入れる HTML セマンティック値。
   * ISO 8601（YYYY-MM-DD 等）を渡す。未指定なら date をそのまま使う。
   * date が「明日 14:00」等の人間可読文字列のときは dateTime に ISO を別途渡す。
   */
  readonly dateTime?: string
  /** 例: 記事種別バッジ（habit, task 等） */
  readonly typeBadge?: ArticleCardBadge
  /** 例: ジャンル（クリック可能にできる） */
  readonly genre?: ArticleCardBadge
  readonly onGenreClick?: (e: React.MouseEvent) => void
  /** サブジャンル（装飾のみ） */
  readonly subgenre?: string
  readonly preview?: string
  readonly tags?: readonly ArticleCardTag[]
  /** 主アクション: カード全体クリック */
  readonly onClick?: () => void
  /** 追加フッター（トグルなど） */
  readonly footer?: React.ReactNode
  /** 左端のアクセント縦バー色（type ごとの視覚差別化用） */
  readonly accentColor?: string
  readonly className?: string
}

/**
 * 記事カード。ビジネスロジック不要、表示と振る舞いのみ。
 * カード全体クリック、バッジ個別クリックを両立（event.stopPropagation で分離）。
 */
export function ArticleCard({
  title,
  date,
  dateTime,
  typeBadge,
  genre,
  onGenreClick,
  subgenre,
  preview,
  tags,
  onClick,
  footer,
  accentColor,
  className,
}: ArticleCardProps) {
  const handleBodyKey = (e: React.KeyboardEvent) => {
    if (!onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const cardStyle = accentColor
    ? ({ ['--card-accent' as string]: accentColor } as React.CSSProperties)
    : undefined
  const cardClass = `${styles.card}${accentColor ? ` ${styles.withAccent}` : ''}${className ? ` ${className}` : ''}`

  return (
    <li className={cardClass} style={cardStyle}>
      <div
        className={styles.body}
        role={onClick ? 'link' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleBodyKey}
        style={onClick ? { cursor: 'pointer' } : undefined}
      >
        <div className={styles.metaTop}>
          <time dateTime={dateTime ?? date}>{date}</time>
          {typeBadge && (
            <span className={styles.typeBadge} data-tone={typeBadge.tone ?? 'neutral'}>
              {typeBadge.icon && <span className={styles.typeBadgeIcon}>{typeBadge.icon}</span>}
              {typeBadge.label}
            </span>
          )}
          {genre && (
            onGenreClick ? (
              <button
                type="button"
                className={styles.badgeBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onGenreClick(e)
                }}
                aria-label={`${genre.label} ジャンル`}
              >
                <span className={styles.genre}>{genre.label}</span>
              </button>
            ) : (
              <span className={styles.genre}>{genre.label}</span>
            )
          )}
          {subgenre && <span className={styles.subgenre}>{subgenre}</span>}
        </div>
        <h2 className={styles.title}>{title}</h2>
        {preview && <p className={styles.preview}>{preview}</p>}
        {tags && tags.length > 0 && (
          <div className={styles.metaBottom}>
            {tags.map((t) =>
              t.onClick ? (
                <button
                  key={t.key}
                  type="button"
                  className={styles.badgeBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    t.onClick?.(e)
                  }}
                  aria-label={`#${t.label} タグ`}
                >
                  <span className={styles.tag}>#{t.label}</span>
                </button>
              ) : (
                <span key={t.key} className={styles.tag}>#{t.label}</span>
              )
            )}
          </div>
        )}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </li>
  )
}

export default ArticleCard
