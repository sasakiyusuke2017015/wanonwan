'use client'

import type { ChangeEvent, DragEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'

import styles from './Dropzone.module.scss'

export interface DropzoneProps {
  /** `<input accept>` にそのまま渡す。例: 'image/*' or '.html,.pdf,.md' */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /**
   * drop / click 経由で受け取ったファイル。catalog 側で `Array.from()` 済み。
   * MIME / 拡張子 / size バリデーションは caller 側 (apps/web) の責務。
   */
  onFiles: (files: File[]) => void
  /** 中央テキスト (default: 'ここにファイルをドロップ、またはクリックして選択') */
  label?: ReactNode
  /** サブテキスト (例: 'html, pdf, md (各 5 MiB まで)') */
  helperText?: ReactNode
  /** large は複数ファイルの一括ドロップを促す広めの受け口 (default: 'default') */
  size?: 'default' | 'large'
  className?: string
}

const DEFAULT_LABEL = 'ここにファイルをドロップ、またはクリックして選択'

export function Dropzone({
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  label = DEFAULT_LABEL,
  helperText,
  size = 'default',
  className = '',
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const openFilePicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleClick = (_event: MouseEvent<HTMLDivElement>) => {
    openFilePicker()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFilePicker()
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (_event: DragEvent<HTMLDivElement>) => {
    setDragOver(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    if (disabled) return
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      onFiles(Array.from(files))
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFiles(Array.from(files))
    }
    // 同じファイル名を再選択できるよう reset
    event.target.value = ''
  }

  const rootClasses = [
    styles.dropzone,
    size === 'large' && styles.large,
    dragOver && !disabled && styles.dragOver,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      data-component="dropzone"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={rootClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.label}>{label}</div>
      {helperText && <div className={styles.helperText}>{helperText}</div>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className={styles.hiddenInput}
        onChange={handleChange}
      />
    </div>
  )
}
