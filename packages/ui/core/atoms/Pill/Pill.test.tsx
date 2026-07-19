// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Pill } from './Pill'

describe('Pill', () => {
  it('children を表示し、渡した colorClassName を付与する', () => {
    render(<Pill colorClassName="bg-indigo-100 text-indigo-700">バンク</Pill>)
    const el = screen.getByText('バンク')
    expect(el).toHaveClass('bg-indigo-100', 'text-indigo-700', 'rounded-full')
  })

  it('colorClassName 未指定なら muted 既定', () => {
    render(<Pill>ラベル</Pill>)
    expect(screen.getByText('ラベル')).toHaveClass('bg-muted', 'text-muted-foreground')
  })
})
