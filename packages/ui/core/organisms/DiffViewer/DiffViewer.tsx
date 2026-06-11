'use client'

import { cn } from '../../utils/cn'
import { IconButton } from '../../molecules/IconButton'
import styles from './DiffViewer.module.scss'

export interface LineDiff {
  tag: string  // "+" | "-" | " "
  text: string
}

export interface DiffEntry {
  path: string
  kind: string
  value?: unknown
  old?: unknown
  new?: unknown
  lines?: LineDiff[]
}

export interface DiffSummary {
  added: number
  removed: number
  changed: number
  total: number
}

export interface DiffViewerProps {
  isOpen: boolean
  entries: DiffEntry[]
  summary: DiffSummary
  leftLabel: string
  rightLabel: string
  onClose: () => void
  title?: string
  className?: string
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

function normalizeKind(kind: string): string {
  return kind.toLowerCase()
}

function DiffRow({ entry, leftLabel, rightLabel }: { entry: DiffEntry; leftLabel: string; rightLabel: string }) {
  const kind = normalizeKind(entry.kind)
  const oldVal = formatValue(entry.old ?? entry.value)
  const newVal = formatValue(entry.new ?? entry.value)

  return (
    <div className={styles.entry}>
      {/* パスヘッダー */}
      <div className={styles.entryHeader}>
        <span className={cn(styles.kindIcon, styles[`kind_${kind}`])}>
          {kind === 'added' ? '+' : kind === 'removed' ? '−' : '~'}
        </span>
        <span className={styles.entryPath}>{entry.path}</span>
        <span className={cn(styles.kindBadge, styles[`kind_${kind}`])}>
          {kind === 'added' ? '追加' : kind === 'removed' ? '削除' : '変更'}
        </span>
      </div>

      {/* 差分本体 */}
      {kind === 'changed' && entry.lines ? (
        /* 行単位 diff（Git 風 unified） */
        <div className={styles.lineDiff}>
          {entry.lines.map((line, li) => (
            <div
              key={li}
              className={cn(
                styles.lineDiffRow,
                line.tag === '+' && styles.lineDiffAdded,
                line.tag === '-' && styles.lineDiffRemoved,
              )}
            >
              <span className={styles.lineDiffTag}>{line.tag}</span>
              <pre className={styles.lineDiffText}>{line.text}</pre>
            </div>
          ))}
        </div>
      ) : kind === 'changed' ? (
        /* 短い値の変更（Split 表示） */
        <div className={styles.diffSplit}>
          <div className={styles.diffSide}>
            <div className={styles.diffSideLabel}>{leftLabel}</div>
            <pre className={styles.diffRemoved}>{oldVal}</pre>
          </div>
          <div className={styles.diffSide}>
            <div className={styles.diffSideLabel}>{rightLabel}</div>
            <pre className={styles.diffAdded}>{newVal}</pre>
          </div>
        </div>
      ) : kind === 'added' ? (
        <pre className={styles.diffAdded}>{newVal}</pre>
      ) : (
        <pre className={styles.diffRemoved}>{oldVal}</pre>
      )}
    </div>
  )
}

export function DiffViewer({
  isOpen,
  entries,
  summary,
  leftLabel,
  rightLabel,
  onClose,
  title = '差分ビューア',
  className,
}: DiffViewerProps) {
  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      data-component="diff-viewer"
    >
      <div
        className={cn(styles.modal, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.stats}>
              <span className={styles.statAdded}>+{summary.added}</span>
              <span className={styles.statRemoved}>−{summary.removed}</span>
              <span className={styles.statChanged}>~{summary.changed}</span>
            </div>
          </div>
          <IconButton
            icon="x"
            size={18}
            label="閉じる"
            onClick={onClose}
            className={styles.closeButton}
          />
        </div>

        {/* Entries */}
        <div className={styles.body}>
          {entries.length === 0 ? (
            <div className={styles.empty}>差分はありません</div>
          ) : (
            entries.map((entry, i) => (
              <DiffRow
                key={i}
                entry={entry}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
