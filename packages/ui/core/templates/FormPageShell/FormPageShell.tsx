import { FC, ReactNode } from 'react'

import { AdminPageHeader } from '../../organisms/AdminPageHeader'
import { StickyFormFooter } from '../../molecules/StickyFormFooter'
import {
  PageHeaderIconNav,
  type PageHeaderIconNavItem,
} from '../../molecules/PageHeaderIconNav'

export interface FormPageShellProps {
  /** ページタイトル（AdminPageHeader の h1）。 */
  title: string
  /** タイトル下の補助テキスト。 */
  subtitle?: ReactNode
  /** タイトル左のアイコン。 */
  icon?: ReactNode
  /** タイトル右のステータス（StatusPill 等）。 */
  status?: ReactNode
  /** ヘッダー右上のアイコンナビ（戻る / 対象ユーザー等）。必要なページだけ渡す。 */
  nav?: PageHeaderIconNavItem[]
  /** 下部固定フッターのアクション（保存 / やめる等）。省略時はフッター自体を出さない（閲覧ページ用）。 */
  footer?: ReactNode
  /** フッター左に出す保存状態などのテキスト。 */
  footerStatus?: ReactNode
  children: ReactNode
}

/**
 * FormPageShell - フォーム系ページの外郭（ヘッダー帯 + コンテンツ + 下部フッター）
 *
 * AdminPageHeader（右上に PageHeaderIconNav）と StickyFormFooter を 1 つに合成し、
 * 「戻る導線は右上アイコン・保存は下部フッター」の外郭をページ側 1 部品で揃える。
 * AppShell のコンテンツ padding（p-6）を負マージンで打ち消して全幅帯を出す
 * （exams / courses のフォームと同じ手法）。
 *
 * Usage:
 * <FormPageShell
 *   title="コースカテゴリを編集"
 *   nav={[{ icon: 'arrow-left', label: '一覧に戻る', href: backHref, onClick: goBack }]}
 *   footer={<><Button variant="outline">やめる</Button><Button variant="primary">保存する</Button></>}
 * >
 *   <FormGrid>…</FormGrid>
 * </FormPageShell>
 */
export const FormPageShell: FC<FormPageShellProps> = ({
  title,
  subtitle,
  icon,
  status,
  nav,
  footer,
  footerStatus,
  children,
}) => {
  return (
    <div className="-m-6 flex min-h-full flex-col bg-gray-50" data-component="form-page-shell">
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        status={status}
        actions={nav && nav.length > 0 ? <PageHeaderIconNav items={nav} /> : undefined}
      />
      <div className="flex-1 p-6">{children}</div>
      {footer && <StickyFormFooter status={footerStatus}>{footer}</StickyFormFooter>}
    </div>
  )
}
