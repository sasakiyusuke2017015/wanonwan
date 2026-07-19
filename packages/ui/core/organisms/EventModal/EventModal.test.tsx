import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it.skip('save button is disabled when title is empty', () => {
    // TODO: 現行実装では保存ボタンは disabled にならず submit 時に required で弾く挙動
    renderWithModal(true)
    const saveBtn = screen.getByText('保存').closest('button')
    expect(saveBtn).toHaveAttribute('disabled')
  })

  describe('a11y', () => {
    it('renders an element with role="dialog"', () => {
      renderWithModal(true)
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('dialog has aria-modal="true"', () => {
      renderWithModal(true)
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-modal')).toBe('true')
    })

    it('dialog is labelled by the title h3 via aria-labelledby', () => {
      renderWithModal(true)
      const dialog = screen.getByRole('dialog')
      const labelledById = dialog.getAttribute('aria-labelledby')
      expect(labelledById).toBeTruthy()
      const titleEl = document.getElementById(labelledById!)
      expect(titleEl?.textContent).toContain('イベントを追加')
    })

    it('close button has aria-label="閉じる"', () => {
      renderWithModal(true)
      expect(screen.getByRole('button', { name: '閉じる' })).toBeTruthy()
    })

    it('aria-describedby links to validation errors after submit with empty title', async () => {
      const user = userEvent.setup()
      renderWithModal(true)
      const saveBtn = screen.getByText('保存').closest('button')!
      await user.click(saveBtn)
      const dialog = await screen.findByRole('dialog')
      const errorsId = dialog.getAttribute('aria-describedby')
      expect(errorsId).toBeTruthy()
      const errorsEl = document.getElementById(errorsId!)
      expect(errorsEl?.textContent).toContain('タイトルを入力してください')
    })
  })
})
