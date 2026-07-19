'use client'

import { ComponentType, Fragment, ReactNode } from 'react'

import { Icon } from '../../atoms/Icon'

export interface BreadcrumbItem {
  /** React key。位置ベース等、呼び出し側で一意にする (同値 segment の衝突回避) */
  key: string
  /** 表示ラベル。isHome でアイコンのみ表示する場合は '' */
  label: string
  /** リンク先。省略時は span 表示 (動的 ID / リンク先の無い項目) */
  href?: string
  /** 先頭ホーム項目: ラベルの代わりに house アイコンを表示する */
  isHome?: boolean
}

export type BreadcrumbLinkComponent = ComponentType<{
  href: string
  className?: string
  'aria-label'?: string
  children: ReactNode
}>

export interface BreadcrumbProps {
  /**
   * 表示項目。「どの階層を出すか / ラベルは何か / リンク可能か」の判断は
   * 呼び出し側の責務 (本コンポーネントは href の有無で link / span を描き分けるだけ)。
   */
  items: BreadcrumbItem[]
  /** Next.js の Link 等を注入する。省略時は素の <a> */
  linkAs?: BreadcrumbLinkComponent
  className?: string
}

const DefaultLink: BreadcrumbLinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
)

/**
 * パンくずナビゲーションの presentational 部品 (階層ナビの正準)。
 *
 * - 末尾は現在ページとして span + aria-current="page" (href があっても link にしない)
 * - href の無い中間項目は span (動的 ID 等、クリックで 404 になる link を作らない)
 * - items が home 1 件だけのときはホームアイコンのみ表示 (ダッシュボード表示)
 * - pathname 解析・ラベル解決・省略ルールは呼び出し側 (apps) が持つ
 */
export function Breadcrumb({ items, linkAs, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null
  const LinkComponent = linkAs ?? DefaultLink

  // ホーム単独 (ダッシュボード): アイコンだけの現在地表示
  if (items.length === 1 && items[0].isHome) {
    return (
      <nav
        aria-label="パンくず"
        className={`flex items-center gap-1.5 text-sm ${className}`.trim()}
        data-component="breadcrumb"
      >
        <span
          className="inline-flex items-center font-medium text-foreground"
          aria-label="ホーム"
        >
          <Icon name="house" size={14} strokeWidth={1.8} />
        </span>
      </nav>
    )
  }

  return (
    <nav
      aria-label="パンくず"
      className={`flex min-w-0 items-center gap-1.5 text-sm ${className}`.trim()}
      data-component="breadcrumb"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Fragment key={item.key}>
            {i > 0 && (
              <Icon
                name="chevron-right"
                aria-hidden
                size={14}
                className="shrink-0 text-muted-foreground/60"
                strokeWidth={1.8}
              />
            )}
            {isLast ? (
              <span className="truncate font-semibold text-foreground" aria-current="page">
                {item.isHome ? <Icon name="house" size={14} strokeWidth={1.8} aria-hidden /> : item.label}
              </span>
            ) : item.href ? (
              <LinkComponent
                href={item.href}
                aria-label={item.isHome ? 'ホーム' : undefined}
                className="inline-flex shrink-0 items-center gap-1.5 truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.isHome && <Icon name="house" size={14} strokeWidth={1.8} aria-hidden />}
                {item.label && <span className="truncate">{item.label}</span>}
              </LinkComponent>
            ) : (
              // href の無い項目 (動的 ID 等) は対応する page が無いことが多いので
              // link にせず span で表示。クリックで 404 になるのを防ぐ。
              <span className="inline-flex shrink-0 items-center gap-1.5 truncate text-muted-foreground">
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
