import { describe, it, expect } from 'vitest'

import {
  defaultVisibleKeys,
  dropIndicatorSide,
  moveColumnKey,
  resolveVisibleColumns,
  toggleVisibleColumn,
} from './columnVisibility'
import type { Column } from './types'

type Row = Record<string, unknown>

// id(locked, 先頭) / a / b / c(defaultHidden) / actions(locked, 末尾)
const columns: Column<Row>[] = [
  { key: 'id', label: 'ID', hideable: false },
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C', defaultHidden: true },
  { key: 'actions', label: '操作', hideable: false },
]

const keys = (cols: Column<Row>[]) => cols.map((c) => c.key)

describe('defaultVisibleKeys', () => {
  it('defaultHidden を除いた全列を元の順で返す', () => {
    expect(defaultVisibleKeys(columns)).toEqual(['id', 'a', 'b', 'actions'])
  })
})

describe('resolveVisibleColumns', () => {
  it('未指定なら defaultHidden を除いた元の順', () => {
    expect(keys(resolveVisibleColumns(columns, undefined))).toEqual(['id', 'a', 'b', 'actions'])
  })

  it('toggleable を visibleColumns の並び順で並べ、ロック列は先頭/末尾に固定する', () => {
    expect(keys(resolveVisibleColumns(columns, ['b', 'a']))).toEqual(['id', 'b', 'a', 'actions'])
  })

  it('visibleColumns に無い toggleable 列は非表示（ロック列は常に表示）', () => {
    expect(keys(resolveVisibleColumns(columns, ['a']))).toEqual(['id', 'a', 'actions'])
  })

  it('visibleColumns の順 (ロック列含む) を honor し、重複は除く', () => {
    // ロック列も並べ替え可能になったため、visibleColumns 内の位置をそのまま採用する。
    expect(keys(resolveVisibleColumns(columns, ['actions', 'b', 'id', 'b']))).toEqual([
      'actions',
      'b',
      'id',
    ])
  })

  it('欠けているロック列は自然位置 (先頭/末尾) で補完する (旧 state 互換)', () => {
    // 旧ピッカーは toggleable のみ保存していたため、ロック列キーが無い state でも従来位置に出す。
    expect(keys(resolveVisibleColumns(columns, ['b', 'a']))).toEqual(['id', 'b', 'a', 'actions'])
  })

  it('defaultHidden 列も visibleColumns に入れれば表示できる', () => {
    expect(keys(resolveVisibleColumns(columns, ['a', 'c', 'b']))).toEqual([
      'id',
      'a',
      'c',
      'b',
      'actions',
    ])
  })
})

describe('toggleVisibleColumn', () => {
  it('表示中の列を消す', () => {
    expect(toggleVisibleColumn(columns, ['a', 'b'], 'a')).toEqual(['b'])
  })

  it('非表示の列を末尾に追加する', () => {
    expect(toggleVisibleColumn(columns, ['a'], 'b')).toEqual(['a', 'b'])
  })

  it('ロック列はトグル不可（現状維持）', () => {
    expect(toggleVisibleColumn(columns, ['a'], 'id')).toEqual(['a'])
  })
})

describe('moveColumnKey', () => {
  it('from を to の位置へ移動する', () => {
    expect(moveColumnKey(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a'])
    expect(moveColumnKey(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })

  it('同一 key / 未知 key は入力をそのまま返す', () => {
    expect(moveColumnKey(['a', 'b'], 'a', 'a')).toEqual(['a', 'b'])
    expect(moveColumnKey(['a', 'b'], 'x', 'a')).toEqual(['a', 'b'])
  })
})

describe('dropIndicatorSide', () => {
  const order = ['a', 'b', 'c', 'd', 'e']

  it('下方向ドラッグ (from < to) は対象の下端 bottom', () => {
    // a を d にホバー → d の下端 (= d と e の間)。drop で moveColumnKey(a→d)=b,c,d,a,e と一致
    expect(dropIndicatorSide(order, 'a', 'd')).toBe('bottom')
  })

  it('上方向ドラッグ (from > to) は対象の上端 top', () => {
    expect(dropIndicatorSide(order, 'e', 'b')).toBe('top')
  })

  it('over が drag 自身なら null (線を出さない)', () => {
    expect(dropIndicatorSide(order, 'c', 'c')).toBeNull()
  })

  it('draggingKey が null なら null', () => {
    expect(dropIndicatorSide(order, null, 'c')).toBeNull()
  })

  it('未知 key は null', () => {
    expect(dropIndicatorSide(order, 'x', 'c')).toBeNull()
    expect(dropIndicatorSide(order, 'a', 'x')).toBeNull()
  })
})
