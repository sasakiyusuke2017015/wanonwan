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
  /**
   * ヘッダー右に置く任意のアクション要素（AdminPageHeader.actions へそのまま転送）。
   * nav のアイコンナビで表現できない要素（Client Component のナビ、StatusPill との複合等）用。
   * `nav` と同時指定した場合は headerActions が優先され、nav は描画しない。
   */
  headerActions?: ReactNode
  /** ヘッダー帯を淡いグラデーション背景にする（AdminPageHeader へ転送。新規作成ページ用）。 */
  gradient?: boolean
  /** 下部固定フッターのアクション（保存 / やめる等）。省略時はフッター自体を出さない（閲覧ページ用）。 */
  footer?: ReactNode
  /** フッター左に出す保存状態などのテキスト。 */
  footerStatus?: ReactNode
  /**
   * フォーム下に置く読み取り専用の関連情報ゾーン（RelatedSection 等）。
   * children（編集フィールド）とは別スロットにすることで「保存対象はどこまでか」を
   * ページ側の並べ方に依存せず分離する。
   */
  related?: ReactNode
  children: ReactNode
}

/**
 * FormPageShell - フォーム系ページの外郭（ヘッダー帯 + コンテンツ + 下部フッター）
 *
 * AdminPageHeader（右上に PageHeaderIconNav）と StickyFormFooter を 1 つに合成し、
 * 「戻る導線は右上アイコン・保存は下部フッター」の外郭をページ側 1 部品で揃える。
 * コンテンツ領域の padding（p-6）を負マージンで打ち消して全幅帯を出す。
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
  headerActions,
  gradient,
  footer,
  footerStatus,
  related,
  children,
}) => {
  return (
    <div className="-m-6 flex min-h-full flex-col bg-gray-50" data-component="form-page-shell">
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        status={status}
        gradient={gradient}
        actions={
          headerActions ??
          (nav && nav.length > 0 ? <PageHeaderIconNav items={nav} /> : undefined)
        }
      />
      <div className="flex-1 p-6">
        {children}
        {related && <div className="mt-8">{related}</div>}
      </div>
      {footer && <StickyFormFooter status={footerStatus}>{footer}</StickyFormFooter>}
    </div>
  )
}
