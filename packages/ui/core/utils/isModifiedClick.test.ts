import { describe, it, expect } from 'vitest'
import type { MouseEvent } from 'react'

import { isModifiedClick } from './isModifiedClick'

// React.MouseEvent の必要フィールドだけを持つ最小オブジェクトを作る。
function clickEvent(partial: Partial<MouseEvent> = {}): MouseEvent {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...partial,
  } as MouseEvent
}

describe('isModifiedClick', () => {
  it('主ボタン + 修飾キーなしは false (通常クリック)', () => {
    expect(isModifiedClick(clickEvent())).toBe(false)
  })

  it('中クリック (button=1) は true', () => {
    expect(isModifiedClick(clickEvent({ button: 1 }))).toBe(true)
  })

  it('右クリック (button=2) は true', () => {
    expect(isModifiedClick(clickEvent({ button: 2 }))).toBe(true)
  })

  it.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
  ])('%s 押下は true', (_label, partial) => {
    expect(isModifiedClick(clickEvent(partial))).toBe(true)
  })
})
