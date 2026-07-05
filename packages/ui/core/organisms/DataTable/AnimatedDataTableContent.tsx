'use client'

import { useLayoutEffect, useRef } from 'react'

import { AnimatePresence, motion, type Variants } from 'framer-motion'

import { Checkbox } from '../../atoms/Checkbox'
import { cn } from '../../utils/cn'

import type { DataTableContentProps } from './DataTableContent'
import { ALIGN_CLASS, HeaderCellInner, headerSortState, renderCellContent } from './tableCells'
import {
  cellVariants,
  colFlipKeyframes,
  enterKeyframes,
  flipKeyframes,
  shiftYKeyframes,
} from './tableMotion'
import styles from './DataTable.module.scss'

/**
 * 行 (tr) の退場バリアント。AnimatePresence の custom (paginating) を退場時に読むため、
 * exit は動的バリアント (関数) で定義する。
 * - フィルタ摘出 (paginating=false): その場から右へスライドしつつフェード (摘出の演出)。
 * - ページ送り (paginating=true): 行は「消える」のではなく窓が変わるだけなので、右スライドは
 *   ノイズ。即時に除去して新ページの登場アニメだけを見せる。
 */
const rowExitVariants: Variants = {
  exit: (suppressSlide: boolean) =>
    suppressSlide
      ? { opacity: 0, transition: { duration: 0 } }
      : { opacity: 0, x: 40, transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] } },
}

// reduced-motion の MediaQueryList は 1 度だけ生成してキャッシュし、値 (matches) は
// 呼び出しごとに最新を読む。下の useLayoutEffect は deps 無しで毎レンダリング走るため、
// そこで都度 matchMedia() を呼ぶと MediaQueryList を無駄に作り続けることになる。
let reducedMotionQuery: MediaQueryList | null | undefined
function prefersReducedMotion(): boolean {
  if (reducedMotionQuery === undefined) {
    reducedMotionQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
  }
  return reducedMotionQuery?.matches ?? false
}

/**
 * 並べ替え中の遮蔽 (手前が奥を覆う) 用に、要素の「実際に見えている背景色」を解決する。
 * セル自身が透明 (td は zebra が tr 側 / th は thead 側) なら親を辿り、最初の不透明色を返す。
 * 固定色を当てるとヘッダ等が別色に化けるため、文脈の色をそのまま不透明化する。
 */
function resolveOpaqueBg(el: HTMLElement): string {
  let node: HTMLElement | null = el
  while (node) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg && bg !== 'transparent' && !bg.endsWith(', 0)')) return bg
    node = node.parentElement
  }
  return 'var(--color-surface, #ffffff)'
}

/**
 * DataTableContent のアニメ版。
 * - 列: 各行 / ヘッダのセルを framer の AnimatePresence で囲み、トグル ON でスライドイン・
 *   OFF で width を 0 へ畳む。`initial={false}` で初回マウント時は静かに出す。
 * - 行: framer を使わず **WAAPI (`element.animate`) で transform/opacity を一元管理**する。
 *   framer の opacity が並べ替え時に絡むと行が一瞬消えるため。
 *   - 登場 (新規 key): index スタガーでフェード+スライドイン。
 *   - 並べ替え (top が変化): 手動 FLIP。上る行は左レーン (左→上→右)、下る行は右レーン
 *     (右→下→左) を通り、移動中の行が重ならない。移動中だけ clip を外して
 *     左右レーンがコンポーネント外へはみ出して見えるようにする。
 *
 * 描画の中身 (セル内容・ソート指標) は静的版と tableCells.tsx で共有している。
 */
export function AnimatedDataTableContent<TRow>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  selectable = false,
  selected,
  isAllSelected = false,
  onToggleOne,
  onToggleAll,
  selectedKeys,
  onToggleRowKey,
  isRowSelectable,
  tableClassName,
  rowClassName,
  emptyMessage = 'データなし',
  bordered = true,
  striped = true,
  variant = 'default',
  sortableEnabled = false,
  sortItems = [],
  onSortClick,
  animationVariant = 'slideDown',
  paginating = false,
}: DataTableContentProps<TRow>) {
  const colSpan = columns.length + (selectable ? 1 : 0)
  const showSortRank = sortItems.length > 1
  // key 選択モード: index 選択 (`selected`) ではなく安定キーで checked を判定する (静的版と揃える)。
  const keyMode = selectedKeys != null
  const cellV = cellVariants(animationVariant)

  const rowKeys = rows.map((row, index) => (getRowKey ? getRowKey(row, index) : index))

  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const rowEls = useRef(new Map<string | number, HTMLTableRowElement>())
  const prevTops = useRef(new Map<string | number, number>())
  // 列並べ替え FLIP 用: ヘッダ th の参照 / 直近の各列 left / 直近の列キー順。
  const headerEls = useRef(new Map<string, HTMLTableCellElement>())
  const prevColLefts = useRef(new Map<string, number>())
  const prevColKeys = useRef<string[]>([])
  // 直近のソート状態。行の移動が「ソート操作による並べ替え」か「フィルタ/ページングで
  // 行が詰まる/開くだけの移動」かを区別するために使う。
  const prevSortKey = useRef('')
  // 直近に「落ち着いた (退場が終わった)」描画での行キー順。行集合が丸ごと入れ替わったか
  // (= ページ送り / full swap) の判定に使う。退場オーバーラップ中の描画では更新しない。
  const prevRowKeys = useRef<(string | number)[]>([])

  // 行集合が前回と完全に入れ替わった (共通キーゼロ) なら full swap。ページ送りや、フィルタで
  // page が 0 にリセットされて別スライスが来たケース。enter/exit/move を全部止めて即時入れ替え
  // にし、(a) 旧行が場所を取ったまま新行が下に積まれて生じる巨大 shiftY (縦に伸びる) と、
  // (b) 旧行の右 exit と新行の左 enter がぶつかる (横に伸びる) を防ぐ。
  const prevKeysForSwap = prevRowKeys.current
  const isFullSwap =
    prevKeysForSwap.length > 0 &&
    rowKeys.length > 0 &&
    !rowKeys.some((k) => prevKeysForSwap.includes(k))
  // ページ送り (paginating) と full swap はまとめて「即時入れ替え」扱いにする。
  const calmSwap = paginating || isFullSwap

  useLayoutEffect(() => {
    const hasExitingOverlap = rowEls.current.size > rowKeys.length
    // 通常フィルタの退場オーバーラップ中は、行の高さが二重に積まれて offsetTop の測定が
    // 信用できない。測定もアニメもせず baseline (prevTops / prevRowKeys) を据え置き、退場が
    // 終わった「落ち着いた」描画で初めて確定する。
    if (hasExitingOverlap && !calmSwap) return
    // 即時入れ替え (ページ送り / full swap) では、退場中の旧行が flow に残ったまま新行が
    // 下に積まれて「一瞬縦に伸びる」。useLayoutEffect は paint 前に走るので、ここで退場行を
    // flow から外す (display:none) と二重高さが描画されない。外した上で新行を測れば位置は
    // 正しく、enter (スライド+フェード) を当てても巨大 shiftY は起きない。
    if (hasExitingOverlap && calmSwap) {
      const visibleKeys = new Set(rowKeys)
      rowEls.current.forEach((el, key) => {
        if (!visibleKeys.has(key)) el.style.display = 'none'
      })
    }

    const prefersReduced = prefersReducedMotion()
    // sortItems が前回から変わっていれば、この移動はソート操作由来 (= lane-swing の sort 演出)。
    // 変わっていない移動はフィルタでの繰り上がりなので横に振らず純縦スライドにする。
    const sortKey = sortItems.map((s) => `${s.columnKey}:${s.order}`).join(',')
    const sortChanged = sortKey !== prevSortKey.current
    prevSortKey.current = sortKey

    const nextTops = new Map<string | number, number>()
    const moveAnims: Animation[] = []

    rowKeys.forEach((key, index) => {
      const el = rowEls.current.get(key)
      if (!el) return
      const top = el.offsetTop
      nextTops.set(key, top)
      // jsdom 等 animate 非対応環境ではアニメをスキップ (静的描画として成立させる)。
      if (prefersReduced || typeof el.animate !== 'function') return
      const prev = prevTops.current.get(key)
      if (prev === undefined) {
        // 新行は登場アニメ (スライド+フェードのスタガー)。full swap / ページ送りでも、旧行を
        // flow から外して正しい位置で測れているのでそのまま enter してよい。
        const { keyframes, options } = enterKeyframes(animationVariant, index)
        el.animate(keyframes, options)
      } else if (prev !== top && !calmSwap) {
        if (sortChanged) {
          // 並べ替え: 左右レーンに振る FLIP。clip を外す必要があるので moveAnims に積む。
          const { keyframes, options } = flipKeyframes(prev - top)
          moveAnims.push(el.animate(keyframes, options))
        } else {
          // フィルタの繰り上がり: 横に振らず縦に滑らせるだけ (sort 演出にしない)。
          const { keyframes, options } = shiftYKeyframes(prev - top)
          el.animate(keyframes, options)
        }
      }
    })
    prevTops.current = nextTops
    prevRowKeys.current = rowKeys

    if (moveAnims.length === 0) return

    // FLIP 中だけ wrapper の横クリップ (overflow-x: clip) を外し、左右レーンに逃げる行が
    // コンポーネント外へはみ出して見えるようにする。終わったら戻す。
    const scrollEl = tableScrollRef.current
    const wrapperEl = scrollEl?.closest<HTMLElement>('[data-component="data-table"]') ?? null
    if (scrollEl) scrollEl.style.overflow = 'visible'
    if (wrapperEl) wrapperEl.style.overflow = 'visible'

    let remaining = moveAnims.length
    const restore = () => {
      remaining -= 1
      if (remaining > 0) return
      // inline を空に戻すと SCSS の値 (tableScroll: visible / wrapper: overflow-x clip) に復帰する。
      if (scrollEl) scrollEl.style.overflow = ''
      if (wrapperEl) wrapperEl.style.overflow = ''
    }
    moveAnims.forEach((a) => a.finished.then(restore, restore))
  })

  // 列の並べ替え (ピッカーで order 変更) 時、各列を横へ滑らせる FLIP。
  // 「列キーの並びが変わった (= 並べ替え)」ときだけ走らせ、列の幅変化 (フィルタで行が変わり
  // auto-layout が再計算される等) では走らせない。列の表示/非表示 (キー集合の増減) は
  // framer の width 畳みが担うのでここでは扱わない。
  useLayoutEffect(() => {
    const colKeys = columns.map((c) => c.key)
    const prevKeys = prevColKeys.current
    const sameSet = colKeys.length === prevKeys.length && colKeys.every((k) => prevKeys.includes(k))
    const orderChanged = sameSet && colKeys.some((k, i) => k !== prevKeys[i])

    const nextLefts = new Map<string, number>()
    headerEls.current.forEach((el, key) => nextLefts.set(key, el.offsetLeft))

    if (orderChanged && !prefersReducedMotion()) {
      const table = tableRef.current
      const moveAnims: Animation[] = []
      const touched: HTMLElement[] = []
      colKeys.forEach((key) => {
        const prevLeft = prevColLefts.current.get(key)
        const newLeft = nextLefts.get(key)
        if (prevLeft === undefined || newLeft === undefined || prevLeft === newLeft) return
        const deltaX = prevLeft - newLeft
        // 左へ動く列 (deltaX>0) は下に沈んで「手前」、右へ動く列は上に浮いて「奥」。
        // front (手前) を上の z + 不透明背景にして、奥の列を確実に覆う (重なり破綻を防ぐ)。
        const goingDownFront = deltaX > 0
        const sel =
          typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(key) : key
        const cells = table?.querySelectorAll<HTMLElement>(`[data-col-key="${sel}"]`)
        const { keyframes, options } = colFlipKeyframes(deltaX)
        cells?.forEach((cell) => {
          if (typeof cell.animate !== 'function') return
          cell.style.position = 'relative'
          cell.style.zIndex = goingDownFront ? '2' : '1'
          cell.style.backgroundColor = resolveOpaqueBg(cell)
          touched.push(cell)
          moveAnims.push(cell.animate(keyframes, options))
        })
      })

      if (moveAnims.length > 0) {
        // 上下の振り (浮き/沈み) が card / scroll の縁で切れないよう、アニメ中だけ clip を外す。
        const scrollEl = tableScrollRef.current
        const wrapperEl = scrollEl?.closest<HTMLElement>('[data-component="data-table"]') ?? null
        if (scrollEl) scrollEl.style.overflow = 'visible'
        if (wrapperEl) wrapperEl.style.overflow = 'visible'
        let remaining = moveAnims.length
        const restore = () => {
          remaining -= 1
          if (remaining > 0) return
          if (scrollEl) scrollEl.style.overflow = ''
          if (wrapperEl) wrapperEl.style.overflow = ''
          // セルの一時スタイル (z-index / 背景 / position) を戻す。
          touched.forEach((c) => {
            c.style.position = ''
            c.style.zIndex = ''
            c.style.backgroundColor = ''
          })
        }
        moveAnims.forEach((a) => a.finished.then(restore, restore))
      }
    }

    prevColLefts.current = nextLefts
    prevColKeys.current = colKeys
  })

  return (
    <div className={styles.tableScroll} ref={tableScrollRef}>
      <table
        ref={tableRef}
        className={cn(
          styles.table,
          bordered && styles.tableBordered,
          striped && styles.tableStriped,
          variant === 'plain' && styles.tablePlain,
          tableClassName,
        )}
      >
        <thead>
          <tr>
            {selectable && (
              <th className={styles.th} style={{ width: 32 }}>
                <Checkbox checked={isAllSelected} onChange={() => onToggleAll?.()} size="small" />
              </th>
            )}
            <AnimatePresence initial={false}>
              {columns.map((col) => {
                const { isSortable, sortIdx, isSorted, order } = headerSortState(
                  col,
                  sortableEnabled,
                  sortItems,
                )
                return (
                  <motion.th
                    key={col.key}
                    ref={(el: HTMLTableCellElement | null) => {
                      if (el) headerEls.current.set(col.key, el)
                      else headerEls.current.delete(col.key)
                    }}
                    data-col-key={col.key}
                    variants={cellV}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={cn(styles.th, isSortable && styles.thSortable, col.headerClassName)}
                    style={{
                      ...(col.width !== undefined ? { width: col.width } : {}),
                      overflow: 'hidden',
                    }}
                    onClick={isSortable ? () => onSortClick?.(col.key) : undefined}
                    aria-sort={
                      isSorted ? (order === 'desc' ? 'descending' : 'ascending') : undefined
                    }
                  >
                    <HeaderCellInner
                      col={col}
                      isSorted={isSorted}
                      order={order}
                      showSortRank={showSortRank}
                      sortIdx={sortIdx}
                    />
                  </motion.th>
                )
              })}
            </AnimatePresence>
          </tr>
        </thead>
        <tbody>
          {/* 摘出 (フィルタ等で行が消える) は exit で「その場から右へスライド」。
              登場 (挿入) と並べ替えの移動は WAAPI が担うため、行 framer は initial/animate を
              持たせず exit のみに限定する (transform の競合回避)。 */}
          <AnimatePresence initial={false} custom={calmSwap}>
            {rows.map((row, index) => {
              const key = rowKeys[index]
              const isRowSelected = keyMode ? selectedKeys.has(key) : (selected?.has(index) ?? false)
              const rowSelectable = keyMode ? (isRowSelectable?.(row) ?? true) : true
              const computedRowClass =
                typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName
              return (
                <motion.tr
                  key={key}
                  ref={(el: HTMLTableRowElement | null) => {
                    if (el) rowEls.current.set(key, el)
                    else rowEls.current.delete(key)
                  }}
                  custom={calmSwap}
                  variants={rowExitVariants}
                  exit="exit"
                  className={cn(
                    styles.tr,
                    onRowClick && styles.trClickable,
                    isRowSelected && styles.trSelected,
                    computedRowClass,
                  )}
                  // クリック可の行はホバーで軽く持ち上げる (簡易ポップ)。motion 管理の
                  // transform と競合しないよう CSS ではなく whileHover で行う。色変化は SCSS。
                  whileHover={
                    onRowClick
                      ? { y: -2, transition: { type: 'spring', stiffness: 800, damping: 28 } }
                      : undefined
                  }
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {selectable && (
                    <td
                      className={styles.td}
                      style={{ width: 32 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isRowSelected}
                        disabled={!rowSelectable}
                        onChange={() => {
                          if (!rowSelectable) return
                          if (keyMode) onToggleRowKey?.(key, row)
                          else onToggleOne?.(index)
                        }}
                        size="small"
                      />
                    </td>
                  )}
                  <AnimatePresence initial={false}>
                    {columns.map((col) => {
                      const align = col.align ?? 'left'
                      return (
                        <motion.td
                          key={col.key}
                          data-col-key={col.key}
                          variants={cellV}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={cn(styles.td, ALIGN_CLASS[align], col.cellClassName)}
                          style={{ overflow: 'hidden' }}
                        >
                          {renderCellContent(col, row)}
                        </motion.td>
                      )
                    })}
                  </AnimatePresence>
                </motion.tr>
              )
            })}
          </AnimatePresence>
          {rows.length === 0 && (
            <tr>
              <td colSpan={colSpan} className={styles.emptyRow}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
