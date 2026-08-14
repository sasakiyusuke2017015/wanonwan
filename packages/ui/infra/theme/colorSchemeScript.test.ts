import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  COLOR_SCHEME_ATTRIBUTE,
  COLOR_SCHEME_PRE_PAINT_SCRIPT,
} from './colorSchemeScript'
import { THEME_STORAGE_KEYS } from './types'

/**
 * FOUC 対策の pre-paint script は `<head>` で生の文字列として実行されるため、
 * 型検査もリンタも通らない。壊れても「一瞬フラッシュする」だけで目視では気付きにくいので、
 * ここで実行結果を固定する。
 */

/** localStorage / matchMedia / documentElement を差し替えてスクリプトを実行し、付いた属性を返す。 */
function runPrePaint(stored: string | null, osPrefersDark: boolean): string | null {
  let applied: string | null = null

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key === THEME_STORAGE_KEYS.COLOR_SCHEME ? stored : null),
  })
  vi.stubGlobal('window', {
    matchMedia: (query: string) => ({ matches: query.includes('dark') && osPrefersDark }),
  })
  vi.stubGlobal('document', {
    documentElement: {
      setAttribute: (key: string, value: string) => {
        if (key === COLOR_SCHEME_ATTRIBUTE) applied = value
      },
    },
  })

  // eslint-disable-next-line no-eval -- 出荷されるスクリプト文字列そのものを実行して検証する
  ;(0, eval)(COLOR_SCHEME_PRE_PAINT_SCRIPT)
  return applied
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('COLOR_SCHEME_PRE_PAINT_SCRIPT', () => {
  it.each([
    ['未設定 + OS light', null, false, null],
    ['未設定 + OS dark（既定は system 相当）', null, true, 'dark'],
    ['system + OS dark', JSON.stringify('system'), true, 'dark'],
    ['system + OS light', JSON.stringify('system'), false, null],
    ['dark 明示は OS を上書きする', JSON.stringify('dark'), false, 'dark'],
    ['light 明示は OS を上書きする', JSON.stringify('light'), true, null],
  ])('%s', (_name, stored, osPrefersDark, expected) => {
    expect(runPrePaint(stored, osPrefersDark)).toBe(expected)
  })

  it('壊れた localStorage 値でも例外を投げず light にフォールバックする', () => {
    // ここで throw するとページ全体が描画されないため、握り潰す設計になっている
    expect(() => runPrePaint('{{{', true)).not.toThrow()
    expect(runPrePaint('{{{', true)).toBeNull()
  })

  it('matchMedia が無い環境（古い WebView 等）でも落ちない', () => {
    let applied: string | null = null
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify('system') })
    vi.stubGlobal('window', {})
    vi.stubGlobal('document', {
      documentElement: {
        setAttribute: (_k: string, v: string) => {
          applied = v
        },
      },
    })
    expect(() => (0, eval)(COLOR_SCHEME_PRE_PAINT_SCRIPT)).not.toThrow()
    expect(applied).toBeNull()
  })
})
