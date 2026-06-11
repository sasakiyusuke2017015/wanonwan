import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'jotai'
import { CalendarPage } from './CalendarPage'

const noop = async () => {}

describe('CalendarPage', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(
      <Provider>
        <CalendarPage events={[]} persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
    expect(container.querySelector('[data-component="CalendarPage"]')).toBeInTheDocument()
  })

  it('CalendarHeader が表示される', () => {
    const { container } = render(
      <Provider>
        <CalendarPage events={[]} persistEvent={noop} removeEvent={noop} />
      </Provider>
    )
    expect(container.querySelector('[data-component="CalendarHeader"]')).toBeInTheDocument()
  })

  it('className が追加できる', () => {
    const { container } = render(
      <Provider>
        <CalendarPage events={[]} persistEvent={noop} removeEvent={noop} className="custom" />
      </Provider>
    )
    const el = container.querySelector('[data-component="CalendarPage"]')
    expect(el?.classList.contains('custom')).toBe(true)
  })
})
