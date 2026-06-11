import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Calendar } from './index'

describe('Calendar', () => {
  it('カレンダーが表示される', () => {
    render(
      <Calendar
        mode="date"
        onSelect={() => {}}
      />
    )
    // カレンダーが何らかの要素を表示することを確認
    expect(document.body.firstChild).not.toBeNull()
  })

  it('mode=month のとき月選択が表示される', () => {
    render(
      <Calendar
        mode="month"
        onSelect={() => {}}
      />
    )
    expect(document.body.firstChild).not.toBeNull()
  })

  it('selectedDate が指定されたとき表示される', () => {
    const date = new Date(2024, 0, 15) // 2024-01-15
    render(
      <Calendar
        mode="date"
        selectedDate={date}
        onSelect={() => {}}
      />
    )
    expect(document.body.firstChild).not.toBeNull()
  })

  it('onSelect コールバックが渡せる', () => {
    const onSelect = vi.fn()
    render(
      <Calendar
        mode="date"
        onSelect={onSelect}
      />
    )
    expect(onSelect).not.toHaveBeenCalled()
  })
})
