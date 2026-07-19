import { describe, expect, it } from 'vitest'

import { formatMinutes } from './formatMinutes'

describe('formatMinutes', () => {
  it('60 分未満は「分」表記', () => {
    expect(formatMinutes(45)).toBe('45分')
    expect(formatMinutes(0)).toBe('0分')
  })

  it('端数なしの時間は「時間」のみ', () => {
    expect(formatMinutes(120)).toBe('2時間')
  })

  it('端数ありは「時間＋分」', () => {
    expect(formatMinutes(90)).toBe('1時間30分')
    expect(formatMinutes(1212)).toBe('20時間12分')
  })
})
