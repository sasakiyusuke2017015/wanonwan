import { useCallback, useState } from 'react'

interface UseSelectionOptions {
  totalRowCount: number
  onSelectionChange?: (selected: Set<number>) => void
}

export function useSelection({ totalRowCount, onSelectionChange }: UseSelectionOptions) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const isSelected = useCallback((index: number) => selected.has(index), [selected])

  const isAllSelected = totalRowCount > 0 && selected.size === totalRowCount

  const toggleOne = useCallback(
    (index: number) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        onSelectionChange?.(next)
        return next
      })
    },
    [onSelectionChange],
  )

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next: Set<number> =
        prev.size === totalRowCount
          ? new Set()
          : new Set(Array.from({ length: totalRowCount }, (_, i) => i))
      onSelectionChange?.(next)
      return next
    })
  }, [totalRowCount, onSelectionChange])

  return {
    selected,
    isSelected,
    isAllSelected,
    toggleOne,
    toggleAll,
  }
}
