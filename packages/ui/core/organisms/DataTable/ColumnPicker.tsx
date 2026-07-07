'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Icon } from '../../atoms/Icon'
import { Toggle } from '../../atoms/Toggle'
import { Tooltip } from '../../atoms/Tooltip'
import { IconButton } from '../../molecules/IconButton'
import { Button } from '../../molecules/Button'
import { cn } from '../../utils/cn'

import { DropdownMenu } from '../DropdownMenu'

import { defaultVisibleKeys, dropIndicatorSide, moveColumnKey } from './columnVisibility'
import { shiftYKeyframes } from './tableMotion'
import { useDragAutoScroll } from './useDragAutoScroll'
import type { Column } from './types'
import styles from './DataTable.module.scss'

interface ColumnPickerProps<TRow> {
  columns: Column<TRow>[]
  visibleColumns: string[] | undefined
  onColumnsChange: (columns: string[]) => void
}

/**
 * 表示列を切り替える / 並べ替えるドロップダウン。client / server 両モードで共有する。
 *
 * - trigger は gear の `IconButton`（クリックで 90° 回転 + hover で光沢）
 * - メニュー本体は `DropdownMenu` に委譲（fixed 配置 / 外側クリック / Esc / 端回避）
 * - 全列を 1 リストに並べ、グリップでドラッグ並べ替え（表の列順に反映）
 * - toggleable 列はトグルで表示/非表示
 * - ロック列（`hideable === false`、操作列など）は非表示にできず、トグルの位置に鍵アイコン。
 *   並べ替えは可能
 * - フッターに「既定に戻す」「完了」
 */
export function ColumnPicker<TRow>({ columns, visibleColumns, onColumnsChange }: ColumnPickerProps<TRow>) {
  return (
    <DropdownMenu
      ariaLabel="表示する列を切り替える"
      placement="bottom-end"
      menuWidth="w-64"
      customTrigger={({ onClick, ariaProps }) => (
        <Tooltip content="表示する列">
          <IconButton
            icon="gear"
            label="表示する列"
            title=""
            size={16}
            onClick={onClick}
            shimmer
            className="border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
            {...ariaProps}
          />
        </Tooltip>
      )}
      menuContent={(closeMenu) => (
        <ColumnPickerMenu
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnsChange={onColumnsChange}
          onDone={closeMenu}
        />
      )}
    />
  )
}

interface ColumnPickerMenuProps<TRow> extends ColumnPickerProps<TRow> {
  onDone: () => void
}

/**
 * メニュー中身。DropdownMenu は open 時のみ描画するため、本コンポーネントは開くたびに
 * mount され、その時点の props から表示順 / 表示状態のローカル状態を初期化する。
 */
function ColumnPickerMenu<TRow>({
  columns,
  visibleColumns,
  onColumnsChange,
  onDone,
}: ColumnPickerMenuProps<TRow>) {
  const toggleableColumns = useMemo(() => columns.filter((c) => c.hideable !== false), [columns])
  const lockedKeys = useMemo(
    () => new Set(columns.filter((c) => c.hideable === false).map((c) => c.key)),
    [columns],
  )

  const effectiveVisible = useMemo(
    () => visibleColumns ?? defaultVisibleKeys(columns),
    [visibleColumns, columns],
  )

  // 全列 (ロック列含む) の表示順。visibleColumns の順を尊重し、欠けている列は自然位置で補完:
  // 先頭側ロック列 → 先頭 / 非表示 toggleable → 可視の後ろ / 末尾ロック列 (操作列など) → 末尾。
  const initialOrder = useMemo(() => {
    const known = new Set(columns.map((c) => c.key))
    const seen = new Set<string>()
    const visiblePart: string[] = []
    for (const k of effectiveVisible) {
      if (known.has(k) && !seen.has(k)) {
        seen.add(k)
        visiblePart.push(k)
      }
    }
    const frontMissing: string[] = []
    const hiddenMiddle: string[] = []
    const endMissing: string[] = []
    let seenToggleable = false
    for (const c of columns) {
      const locked = c.hideable === false
      if (!locked) seenToggleable = true
      if (seen.has(c.key)) continue
      if (locked) (seenToggleable ? endMissing : frontMissing).push(c.key)
      else hiddenMiddle.push(c.key)
    }
    return [...frontMissing, ...visiblePart, ...hiddenMiddle, ...endMissing]
  }, [columns, effectiveVisible])

  const [order, setOrder] = useState<string[]>(initialOrder)
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(toggleableColumns.map((c) => c.key).filter((k) => !effectiveVisible.includes(k))),
  )
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)

  const colByKey = useMemo(() => new Map(columns.map((c) => [c.key, c] as const)), [columns])

  // D&D 並べ替え時の手動 FLIP。縦 1 列なので純縦スライドで詰める (横レーンは使わない)。
  const listRef = useRef<HTMLDivElement>(null)
  const itemEls = useRef(new Map<string, HTMLDivElement>())
  const prevItemTops = useRef(new Map<string, number>())

  // ネイティブ D&D はスクロールコンテナを自動スクロールしないため、列が多く
  // pickerList が overflow すると下端の項目までドラッグできない。これを補う。
  const autoScroll = useDragAutoScroll(listRef)

  useLayoutEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nextTops = new Map<string, number>()
    order.forEach((key) => {
      const el = itemEls.current.get(key)
      if (!el) return
      const top = el.offsetTop
      nextTops.set(key, top)
      if (reduced || typeof el.animate !== 'function') return
      const prev = prevItemTops.current.get(key)
      // 並べ替え (top 変化) のみアニメ。初回 (prev 未定義) は静かに表示する。
      // 縦 1 列のピッカーでは詰める項目はすべて同方向に動いて交差しないため、
      // 横レーンに振らず純縦スライドで動かす (横へ逃げて枠外にはみ出す演出を避ける)。
      if (prev !== undefined && prev !== top) {
        const { keyframes, options } = shiftYKeyframes(prev - top)
        el.animate(keyframes, options)
      }
    })
    prevItemTops.current = nextTops
  }, [order])

  const emit = (nextOrder: string[], nextHidden: Set<string>) => {
    onColumnsChange(nextOrder.filter((k) => !nextHidden.has(k)))
  }

  const toggle = (key: string) => {
    const next = new Set(hidden)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setHidden(next)
    emit(order, next)
  }

  const handleDrop = (targetKey: string) => {
    autoScroll.stop()
    if (!draggingKey) return
    const next = moveColumnKey(order, draggingKey, targetKey)
    setOrder(next)
    setDraggingKey(null)
    setOverKey(null)
    emit(next, hidden)
  }

  const resetToDefault = () => {
    // 全列を自然順 (ロック列含む) に戻し、defaultHidden の toggleable だけ非表示にする。
    const nextOrder = columns.map((c) => c.key)
    const nextHidden = new Set(
      toggleableColumns.filter((c) => c.defaultHidden).map((c) => c.key),
    )
    setOrder(nextOrder)
    setHidden(nextHidden)
    emit(nextOrder, nextHidden)
  }

  return (
    <div className={styles.picker}>
      <div
        className={styles.pickerList}
        ref={listRef}
        onDragOver={(e) => {
          // リスト全域を drop 可能にして、項目間の隙間や余白でカーソルが 🚫 (no-drop)
          // に化けるのを防ぐ。併せて端付近の自動スクロールを回す。
          if (draggingKey) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }
          autoScroll.onDragOver(e)
        }}
      >
        {order.map((key) => {
          const col = colByKey.get(key)
          if (!col) return null
          const locked = lockedKeys.has(key)
          const indicatorSide = overKey === key ? dropIndicatorSide(order, draggingKey, key) : null
          return (
            <div
              key={key}
              ref={(el) => {
                if (el) itemEls.current.set(key, el)
                else itemEls.current.delete(key)
              }}
              className={cn(
                styles.pickerItem,
                styles.pickerItemDraggable,
                draggingKey === key && styles.pickerItemDragging,
                indicatorSide === 'top' && styles.pickerItemDragOverTop,
                indicatorSide === 'bottom' && styles.pickerItemDragOverBottom,
              )}
              draggable
              onDragStart={(e) => {
                // effectAllowed + setData を立てないと、ブラウザが drop 不可とみなして
                // ドラッグ中ずっと 🚫 (no-drop) カーソルを出す。Firefox は setData が
                // 無いとドラッグ自体を開始しない。
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', key)
                setDraggingKey(key)
              }}
              onDragEnd={() => {
                autoScroll.stop()
                setDraggingKey(null)
                setOverKey(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (overKey !== key) setOverKey(key)
              }}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(key)
              }}
            >
              <span className={styles.pickerGrip} aria-hidden>
                <Icon name="grip" size={14} className={styles.pickerGripSvg} />
              </span>
              {locked ? (
                <>
                  {/* ロック列: 非表示にはできない。トグルの位置に同サイズ枠の鍵アイコン。 */}
                  <span className={styles.pickerLockLabel}>{col.label}</span>
                  <span className={styles.pickerLockIcon} title="常に表示（切り替え不可）">
                    <Icon name="lock" size={13} aria-label="常に表示" />
                  </span>
                </>
              ) : (
                <Toggle
                  label={col.label}
                  checked={!hidden.has(key)}
                  onChange={() => toggle(key)}
                  size="small"
                  variant="primary"
                  containerClassName={styles.pickerToggle}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.pickerFooter}>
        <button type="button" className={styles.pickerReset} onClick={resetToDefault}>
          <Icon name="arrow-rotate" size={12} aria-hidden />
          既定に戻す
        </button>
        <Button variant="primary" size="small" onClick={onDone}>
          完了
        </Button>
      </div>
    </div>
  )
}
