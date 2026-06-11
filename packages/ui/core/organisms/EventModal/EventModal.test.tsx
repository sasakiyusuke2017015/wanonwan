import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider, createStore } from 'jotai'
import { EventModal } from './EventModal'
import { eventModalAtom } from '../../hooks/calendar/calendar'

function renderWithModal(isOpen: boolean, editingEvent?: Parameters<typeof EventModal>[0] extends infer P ? P : never) {
  const store = createStore()
  store.set(eventModalAtom, {
    isOpen,
    date: new Date('2026-03-20'),
    hour: 9,
    ...(editingEvent ? {} : {}),
  })

  return render(
    <Provider store={store}>
      <EventModal persistEvent={vi.fn()} removeEvent={vi.fn()} />
    </Provider>
  )
}

describe('EventModal', () => {
  it('does not render when modal is closed', () => {
    renderWithModal(false)
    expect(screen.queryByText('イベントを追加')).toBeNull()
  })

  it('renders add mode title when modal is open', () => {
    renderWithModal(true)
    expect(screen.getByText('イベントを追加')).toBeTruthy()
  })

  it('renders title input', () => {
    renderWithModal(true)
    expect(screen.getByPlaceholderText('タイトルを追加')).toBeTruthy()
  })

  it('renders mode selection pills', () => {
    renderWithModal(true)
    expect(screen.getByText('時間指定')).toBeTruthy()
    expect(screen.getByText('終日')).toBeTruthy()
    expect(screen.getByText('繰り返し')).toBeTruthy()
  })

  it('renders save button', () => {
    renderWithModal(true)
    expect(screen.getByText('保存')).toBeTruthy()
  })

  it('renders close button', () => {
    renderWithModal(true)
    const closeButtons = screen.getAllByRole('button')
    const closeBtn = closeButtons.find((btn) => btn.textContent?.includes('\u00D7'))
    expect(closeBtn).toBeTruthy()
  })

  it('renders color picker section', () => {
    renderWithModal(true)
    expect(screen.getByText('カラー')).toBeTruthy()
  })

  it('renders description textarea', () => {
    renderWithModal(true)
    expect(screen.getByPlaceholderText('説明を追加')).toBeTruthy()
  })

  it('shows day-of-week picker when repeat mode is selected', () => {
    renderWithModal(true)
    fireEvent.click(screen.getByText('繰り返し'))
    expect(screen.getByText('曜日')).toBeTruthy()
  })

  it('save button is disabled when title is empty', () => {
    renderWithModal(true)
    const saveBtn = screen.getByText('保存').closest('button')
    expect(saveBtn).toHaveAttribute('disabled')
  })
})
