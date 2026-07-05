import { type FC } from 'react'

import { Icon } from '../../atoms/Icon'
import styles from './Pagination.module.scss'

export type PaginationItem = number | '…'

/**
 * Material UI 風の pagination 表示範囲を計算する。
 *
 * - totalPages <= 1 のときは空配列 (Pagination 側で null return)
 * - boundaryCount: 両端に必ず表示する個数
 * - siblingCount : currentPage の両側に表示する個数
 * - 飛ばし区間は '…' で表現
 */
export function getPaginationRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] {
  if (totalPages <= 1) return []

  // totalNumbers = 両端 + 両側 sibling + current + 2 ellipsis を加味した「省略不要となる閾値」
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3
  if (totalPages <= totalNumbers) {
    return range(1, totalPages)
  }

  const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 1)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount)

  const showLeftDots = leftSibling > boundaryCount + 2
  const showRightDots = rightSibling < totalPages - boundaryCount - 1

  const leftBoundary = range(1, boundaryCount)
  const rightBoundary = range(totalPages - boundaryCount + 1, totalPages)

  // 左に dots が出ない (currentPage が左寄り) → 左側を currentPage+sibling+1 まで連続表示
  if (!showLeftDots && showRightDots) {
    const leftItemCount = boundaryCount + 1 + 2 * siblingCount
    return [...range(1, leftItemCount), '…', ...rightBoundary]
  }

  // 右に dots が出ない (currentPage が右寄り) → 右側を currentPage-sibling-1 まで連続表示
  if (showLeftDots && !showRightDots) {
    const rightItemCount = boundaryCount + 1 + 2 * siblingCount
    return [...leftBoundary, '…', ...range(totalPages - rightItemCount + 1, totalPages)]
  }

  // 両側 dots: [1, …, leftSibling..rightSibling, …, totalPages]
  return [
    ...leftBoundary,
    '…',
    ...range(leftSibling, rightSibling),
    '…',
    ...rightBoundary,
  ]
}

function range(start: number, end: number): number[] {
  if (end < start) return []
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export interface PaginationProps {
  /** 現在のページ (1-indexed) */
  currentPage: number
  /** 総ページ数 */
  totalPages: number
  /** ページ変更時のコールバック (新ページ番号、1-indexed) */
  onPageChange: (page: number) => void
  /** 現在ページの両側に表示する番号の個数 (default: 1) */
  siblingCount?: number
  /** 両端に必ず表示する番号の個数 (default: 1) */
  boundaryCount?: number
  /** 追加 className */
  className?: string
  /** 前へボタンのラベル (a11y、default: '前へ') */
  prevLabel?: string
  /** 次へボタンのラベル (a11y、default: '次へ') */
  nextLabel?: string
}

/**
 * Pagination - DataTable などと並べて使う番号付きページネーション
 *
 * - totalPages <= 1 のときは何もレンダリングしない
 * - 現在ページに aria-current="page" を付与
 * - 省略記号 (…) は span (非操作要素)
 */
export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className,
  prevLabel = '前へ',
  nextLabel = '次へ',
}) => {
  if (totalPages <= 1) return null

  const items = getPaginationRange(totalPages, currentPage, siblingCount, boundaryCount)
  const containerClasses = [styles.pagination, className].filter(Boolean).join(' ')

  const handlePageClick = (page: number) => {
    if (page === currentPage) return
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  return (
    <nav
      aria-label="ページネーション"
      className={containerClasses}
      data-component="pagination"
    >
      <button
        type="button"
        className={styles.pagination__nav}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={prevLabel}
      >
        <Icon name="chevron-left" size={16} />
        <span className={styles.pagination__navLabel}>{prevLabel}</span>
      </button>

      <ul className={styles.pagination__list}>
        {items.map((item, index) =>
          item === '…' ? (
            <li key={`ellipsis-${index}`}>
              <span className={styles.pagination__ellipsis} aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={styles.pagination__page}
                onClick={() => handlePageClick(item)}
                aria-label={`${item} ページ目`}
                aria-current={item === currentPage ? 'page' : undefined}
                data-current={item === currentPage ? 'true' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.pagination__nav}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={nextLabel}
      >
        <span className={styles.pagination__navLabel}>{nextLabel}</span>
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  )
}
