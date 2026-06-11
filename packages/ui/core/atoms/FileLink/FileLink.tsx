'use client'

import type { FC } from 'react'
import { cn } from '../../utils/cn'
import styles from './FileLink.module.scss'

interface FileLinkProps {
  /** ファイルパス（onOpen に渡される） */
  path: string
  /** 表示ラベル（省略時は path のファイル名部分） */
  label?: string
  /** クリック時のコールバック */
  onOpen: (path: string) => void
  /** 追加クラス */
  className?: string
}

export const FileLink: FC<FileLinkProps> = ({
  path,
  label,
  onOpen,
  className,
}) => {
  const displayLabel = label ?? path.split(/[/\\]/).pop() ?? path

  return (
    <button
      type="button"
      className={cn(styles.root, className)}
      title={path}
      onClick={() => onOpen(path)}
      data-component="file-link"
    >
      <span className={styles.label}>{displayLabel}</span>
    </button>
  )
}
