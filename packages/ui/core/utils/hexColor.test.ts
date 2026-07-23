import { describe, it, expect } from 'vitest'

import { hexReadableTextColor, isHexColor } from './hexColor'

describe('isHexColor', () => {
  it.each(['#3b82f6', '#FFF', '#abcdef'])('%s は true', (v) => {
    expect(isHexColor(v)).toBe(true)
  })

  it.each(['', ' ', 'blue', '#12345', '#gggggg', null, undefined, 42])('%s は false', (v) => {
    expect(isHexColor(v)).toBe(false)
  })
})

describe('hexReadableTextColor', () => {
  it('濃い背景 (#1d4ed8) には白文字', () => {
    expect(hexReadableTextColor('#1d4ed8')).toBe('#ffffff')
  })

  it('淡い背景 (#fde047) にはダーク文字', () => {
    expect(hexReadableTextColor('#fde047')).toBe('#1f2937')
  })

  it('#RGB 短縮形も判定できる (#fff はダーク文字)', () => {
    expect(hexReadableTextColor('#fff')).toBe('#1f2937')
  })
})
