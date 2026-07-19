import { FC, ReactNode } from 'react'

import styles from './FormGrid.module.scss'

export type FormGridItemWidth = 'short' | 'half' | 'wide' | 'full'

export interface FormGridProps {
  children: ReactNode
  className?: string
}

export interface FormGridItemProps {
  children: ReactNode
  /**
   * 12 分割グリッド上の幅トークン。
   * short = 1/3（short×3 で 1 行） / half = 1/2 / wide = 2/3 / full = 1 行占有。
   * 合計が 12 を超えると自動で折り返す。狭幅（<640px）では全て 1 列。
   */
  width?: FormGridItemWidth
  /** トークン合計が 12 未満でも、この Item から行を変える（前の行に穴が残る）。 */
  newRow?: boolean
  className?: string
}

const FormGridItem: FC<FormGridItemProps> = ({
  children,
  width = 'full',
  newRow = false,
  className,
}) => {
  const itemClassName = [styles.item, styles[width], newRow ? styles.newRow : undefined, className]
    .filter(Boolean)
    .join(' ')
  return (
    <div
      className={itemClassName}
      data-component="form-grid-item"
      data-width={width}
      data-new-row={newRow || undefined}
    >
      {children}
    </div>
  )
}

interface FormGridComponent extends FC<FormGridProps> {
  Item: typeof FormGridItem
}

/**
 * FormGrid - フォームフィールドの幅トークン付き折り返しグリッド
 *
 * 「短い項目は横に並び、長い項目は 1 行を占有する」フォームレイアウトを、
 * フィールド側の width 宣言だけで組めるようにする 12 分割グリッド。
 *
 * Usage:
 * <FormGrid>
 *   <FormGrid.Item width="wide"><TextField label="名称" ... /></FormGrid.Item>
 *   <FormGrid.Item width="short"><NumberField label="表示順" ... /></FormGrid.Item>
 *   <FormGrid.Item width="full"><TextareaField label="説明" ... /></FormGrid.Item>
 * </FormGrid>
 */
const FormGridBase: FC<FormGridProps> = ({ children, className }) => (
  <div
    className={[styles.grid, className].filter(Boolean).join(' ')}
    data-component="form-grid"
  >
    {children}
  </div>
)

export const FormGrid = FormGridBase as FormGridComponent
FormGrid.Item = FormGridItem
