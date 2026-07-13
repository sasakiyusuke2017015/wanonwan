'use client'

import type { ReactNode } from 'react'

import { Toolbar } from '../../organisms/DataTable/Toolbar'
import type { FilterDef, SearchDef } from '../../organisms/DataTable/types'
import { cn } from '../../utils/cn'

import styles from './SubHeaderToolbar.module.scss'

export interface SubHeaderToolbarProps {
  /** 左端の見出し (画面名など)。funnel の左に出る */
  title?: ReactNode
  /** 検索 box。値は controlled (呼び出し側が保持) */
  search?: SearchDef
  /** filter select 群。値は controlled (呼び出し側が保持) */
  filters?: FilterDef[]
  /** 件数表示 (DataCountDisplay 等)。funnel とチップ要約の間に出る */
  rowCountLabel?: ReactNode
  /** 列表示ピッカー (DataTable の ColumnPicker 等)。右端コントロール群に並ぶ */
  columnPicker?: ReactNode
  /** 右端の自由アクション */
  actions?: ReactNode
  /** 「新規作成」操作。primary 強調の `＋` ボタンを出す */
  onCreate?: () => void
  /** `＋` ボタンの aria-label / tooltip (default: '新規作成') */
  createLabel?: string
  /** 渡すと `＋` ボタンを `<a href>` で描画する */
  createHref?: string
  /** リセットボタンを表示。クリック時の callback */
  onReset?: () => void
  /** フィルタ入力行の初期開閉 (default: false = 閉。chrome を薄く保つ) */
  defaultOpen?: boolean
  /** 追加 className */
  className?: string
}

/**
 * SubHeaderToolbar — SubHeader の chrome に DataTable の Toolbar を載せるテンプレート。
 *
 * `SubHeader` (fixed バー) の中に置く前提のコンテンツ部品。閉状態は
 * [タイトル / funnel / 件数 / 適用中フィルタのチップ / 右端コントロール] の 1 行で、
 * funnel クリックで検索 + filter 入力行がスライド展開する (Toggleable)。
 *
 * DataTable 側は `toolbar="external"` で内蔵 toolbar を消し、検索 / フィルタの
 * 状態を controlled prop (`queryState` / `filters`) で本コンポーネントと共有する。
 * 高さは開閉で変わるため、ホスト (AppLayout 等) は SubHeader 実高を ResizeObserver で
 * 測って本文 offset に反映すること。`--topbar-h` は本文コンテナが独自スクロールする
 * 構成では設定しない (sticky の停留基準がコンテナの paddingTop を織り込むため、
 * 足すと二重適用になる)。page (body) スクロール構成でのみ chrome 高を設定する。
 */
export function SubHeaderToolbar({
  title,
  search,
  filters,
  rowCountLabel,
  columnPicker,
  actions,
  onCreate,
  createLabel,
  createHref,
  onReset,
  defaultOpen = false,
  className,
}: SubHeaderToolbarProps) {
  return (
    <div className={cn(styles.subHeaderToolbar, className)} data-component="sub-header-toolbar">
      <Toolbar
        // 画面タイトルの意味を持つため h1 (ページから見出しが消えるとスクリーンリーダーの
        // 見出しナビゲーションが効かなくなる)。サイズは .title が抑える。
        leading={title != null ? <h1 className={styles.title}>{title}</h1> : undefined}
        search={search}
        filters={filters}
        rowCountLabel={rowCountLabel}
        columnPicker={columnPicker}
        actions={actions}
        onCreate={onCreate}
        createLabel={createLabel}
        createHref={createHref}
        onReset={onReset}
        collapsible={{ defaultOpen }}
      />
    </div>
  )
}
