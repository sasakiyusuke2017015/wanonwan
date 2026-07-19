import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'jotai'
import { CalendarHeader } from './CalendarHeader'

describe('CalendarHeader', () => {
  it('renders without errors', () => {
    const { container } = render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    expect(container.querySelector('header')).toBeTruthy()
  })

  it('renders the agenda view mode label', () => {
    render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    // 「Calendar」タイトルは現行実装では非表示。代わりに viewMode の「予定」ラベルを確認。
    expect(screen.getByText('予定')).toBeTruthy()
  })

  it('renders view mode buttons', () => {
    render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    expect(screen.getByText('日')).toBeTruthy()
    expect(screen.getByText('週')).toBeTruthy()
    expect(screen.getByText('月')).toBeTruthy()
  })

  it('renders Today button', () => {
    render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    expect(screen.getByText('Today')).toBeTruthy()
  })

  it('renders navigation buttons', () => {
    const { container } = render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(5)
  })

  it('renders header element', () => {
    const { container } = render(
      <Provider>
        <CalendarHeader />
      </Provider>
    )
    const header = container.querySelector('header')
    expect(header).toBeTruthy()
  })
})
