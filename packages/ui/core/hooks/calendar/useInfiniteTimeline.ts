import { useState, useRef, useEffect, useCallback } from 'react'
import { useAtomValue, useSetAtom, useStore } from 'jotai'
import { selectedDateAtom } from './calendar'

// 前後24か月 = 約730日ずつ（合計48か月）
const MONTHS_BEFORE = 24
const MONTHS_AFTER = 24
// DayFrame の高さ（Timeline.tsx と同じ値）
const DAY_FRAME_HEIGHT = 1404

/** 指定日を基準に前後の月数分の日付配列を生成 */
function generateFixedDateRange(baseDate: Date, monthsBefore: number, monthsAfter: number): readonly Date[] {
  const dates: Date[] = []
  const base = new Date(baseDate)
  base.setHours(0, 0, 0, 0)

  // 開始日: baseDate から monthsBefore 月前の1日
  const startDate = new Date(base.getFullYear(), base.getMonth() - monthsBefore, 1)
  // 終了日: baseDate から monthsAfter 月後の末日
  const endDate = new Date(base.getFullYear(), base.getMonth() + monthsAfter + 1, 0)

  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/** 日付のインデックスを検索（日付配列内） */
function findDateIndex(dates: readonly Date[], targetDate: Date): number {
  const targetStr = targetDate.toDateString()
  return dates.findIndex((d) => d.toDateString() === targetStr)
}

export function useInfiniteTimeline(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const store = useStore()
  const selectedDate = useAtomValue(selectedDateAtom)
  const setSelectedDate = useSetAtom(selectedDateAtom)
  const initialDateRef = useRef(store.get(selectedDateAtom))

  // 固定48か月分の日付を生成（初回のみ）
  const [dates] = useState<readonly Date[]>(() =>
    generateFixedDateRange(initialDateRef.current, MONTHS_BEFORE, MONTHS_AFTER)
  )

  const lastSyncedDateRef = useRef('')
  const isScrollingToDateRef = useRef(false)

  // 日付インデックスからスクロール位置を計算してスクロール
  const scrollToDate = useCallback((targetDate: Date, behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current
    if (!el) return false

    const index = findDateIndex(dates, targetDate)
    if (index === -1) {
      console.warn(`Date ${targetDate.toDateString()} is out of range`)
      return false
    }

    const scrollTop = index * DAY_FRAME_HEIGHT
    el.scrollTo({ top: scrollTop, behavior })
    return true
  }, [dates, scrollRef])

  // マウント時に selectedDate にスクロール
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // 少し遅延させてDOMが準備されるのを待つ
    requestAnimationFrame(() => {
      scrollToDate(initialDateRef.current, 'auto')
      lastSyncedDateRef.current = initialDateRef.current.toISOString()
    })
  }, [scrollRef, scrollToDate])

  // selectedDate が外部から変更されたときにスクロール（Header の DatePicker など）
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // 既に同じ日付なら何もしない（スクロールによる更新との無限ループ防止）
    if (lastSyncedDateRef.current === selectedDate.toISOString()) return

    // スクロール実行
    isScrollingToDateRef.current = true
    lastSyncedDateRef.current = selectedDate.toISOString()

    scrollToDate(selectedDate, 'smooth')

    // スクロール完了後にフラグをリセット
    setTimeout(() => {
      isScrollingToDateRef.current = false
    }, 500)
  }, [selectedDate, scrollToDate])

  // スクロール位置から表示中の日付を計算して selectedDate に同期
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      // プログラム的なスクロール中は同期をスキップ
      if (isScrollingToDateRef.current) return

      // スクロール位置から日付インデックスを計算
      const scrollTop = el.scrollTop
      const index = Math.round(scrollTop / DAY_FRAME_HEIGHT)
      const clampedIndex = Math.max(0, Math.min(dates.length - 1, index))
      const visibleDate = dates[clampedIndex]

      if (visibleDate) {
        const newDateIso = visibleDate.toISOString()
        if (newDateIso !== lastSyncedDateRef.current) {
          lastSyncedDateRef.current = newDateIso
          setSelectedDate(visibleDate)
        }
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollRef, setSelectedDate, dates])

  return { dates }
}
