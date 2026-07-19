'use client'

import type { ChangeEventHandler, ReactNode, RefObject } from 'react'

import { ActionBar, type ActionBarItem } from '../../molecules/ActionBar'

export interface CsvActionBarProps {
  /**
   * インポート一式 (importing / onImportClick / onFileChange / fileInputRef) は
   * セットで渡す。未指定ならインポートボタンと hidden file input を描画しない
   * (エクスポートのみのページ向け)。
   */
  importing?: boolean
  onImportClick?: () => void
  onFileChange?: ChangeEventHandler<HTMLInputElement>
  fileInputRef?: RefObject<HTMLInputElement | null>
  templateHref?: string
  exportHref?: string
  /** テンプレート DL リンク押下時に呼ばれる (トースト通知など)。 */
  onTemplateClick?: () => void
  /** エクスポートリンク押下時に呼ばれる (トースト通知など)。 */
  onExportClick?: () => void
  importLabel?: string
  /** 全アクションを無効化する。GET link は <button disabled> 化してキーボード遷移も封じる。 */
  disabled?: boolean
  /** インポートボタンのみ無効化する (レベル未選択時など)。disabled とは独立。 */
  importDisabled?: boolean
  /** 行の先頭に差し込むスロット (レベル選択など)。 */
  leading?: ReactNode
  /** 末尾の「新規作成」ボタン等を差し込むスロット。 */
  children?: ReactNode
}

/**
 * テンプレ DL / CSV インポート / CSV エクスポート のボタン群。
 * 汎用 `ActionBar` に CSV 固有のラベル・アイコン・file input wiring を注入する。
 * fetch 状態は持たない (呼び出し側の hook が担当)。認可も持たない (各 endpoint 側に閉じる)。
 */
export function CsvActionBar({
  importing = false,
  onImportClick,
  onFileChange,
  fileInputRef,
  templateHref,
  exportHref,
  onTemplateClick,
  onExportClick,
  importLabel = 'CSV インポート',
  disabled = false,
  importDisabled = false,
  leading,
  children,
}: CsvActionBarProps) {
  const actions: ActionBarItem[] = []
  const hasImport = onImportClick !== undefined

  if (templateHref !== undefined) {
    actions.push({
      label: 'テンプレート DL',
      icon: 'file-down',
      href: templateHref,
      // ダウンロードは pathname を変えないため download 属性を付ける
      // (無いと NavigationProgress のトップバーが焼き付く)。
      download: true,
      onClick: onTemplateClick,
    })
  }

  // インポート=上矢印 / エクスポート=下矢印。ユーザー視点のファイル移動方向
  // (自分のファイルを上げる / サーバから落とす) に合わせる。
  if (hasImport) {
    actions.push({
      label: importLabel,
      icon: 'upload',
      onClick: onImportClick,
      disabled: importDisabled,
      loading: importing,
      loadingLabel: 'インポート中…',
    })
  }

  if (exportHref !== undefined) {
    actions.push({
      label: 'CSV エクスポート',
      icon: 'download',
      href: exportHref,
      // ダウンロードは pathname を変えないため download 属性を付ける
      // (無いと NavigationProgress のトップバーが焼き付く)。
      download: true,
      onClick: onExportClick,
    })
  }

  return (
    <ActionBar actions={actions} disabled={disabled} leading={leading}>
      {hasImport ? (
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileChange}
        />
      ) : null}
      {children}
    </ActionBar>
  )
}
