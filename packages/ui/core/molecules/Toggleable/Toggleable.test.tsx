import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Toggleable, useToggleable } from './Toggleable'

describe('Toggleable', () => {
  it('data-component="toggleable" が root に出る', () => {
    const { container } = render(
      <Toggleable renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}>
        <p>内容</p>
      </Toggleable>
    )
    expect(container.querySelector('[data-component="toggleable"]')).toBeInTheDocument()
  })

  it('renderTrigger が trigger 要素を描画する', () => {
    render(
      <Toggleable renderTrigger={({ triggerProps }) => <button {...triggerProps}>切替</button>}>
        <p>内容</p>
      </Toggleable>
    )
    expect(screen.getByRole('button', { name: '切替' })).toBeInTheDocument()
  })

  it('defaultOpen=true で aria-expanded=true', () => {
    render(
      <Toggleable
        defaultOpen={true}
        renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}
      >
        <p>内容</p>
      </Toggleable>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('defaultOpen=false で aria-expanded=false', () => {
    render(
      <Toggleable
        defaultOpen={false}
        renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}
      >
        <p>内容</p>
      </Toggleable>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('clickで isOpen がトグルし aria-expanded が反転する (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(
      <Toggleable
        defaultOpen={false}
        renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}
      >
        <p>内容</p>
      </Toggleable>
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('controlled モードでは isOpen prop に従う', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const { rerender } = render(
      <Toggleable
        isOpen={false}
        onToggle={onToggle}
        renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}
      >
        <p>内容</p>
      </Toggleable>
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    // controlled: 内部 state は変えない、onToggle だけ呼ぶ
    expect(onToggle).toHaveBeenCalledWith(true)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    // 親が isOpen を更新したら反映する
    rerender(
      <Toggleable
        isOpen={true}
        onToggle={onToggle}
        renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}
      >
        <p>内容</p>
      </Toggleable>
    )
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('trigger の aria-controls と content の id が一致する', () => {
    const { container } = render(
      <Toggleable renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}>
        <p>内容</p>
      </Toggleable>
    )
    const controls = screen.getByRole('button').getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(container.querySelector(`#${CSS.escape(controls!)}`)).toBeInTheDocument()
  })

  it('children が render される', () => {
    render(
      <Toggleable renderTrigger={({ triggerProps }) => <button {...triggerProps}>x</button>}>
        <p>子要素の内容</p>
      </Toggleable>
    )
    expect(screen.getByText('子要素の内容')).toBeInTheDocument()
  })

  it('renderTrigger の state.isOpen が現状値を反映する', async () => {
    const user = userEvent.setup()
    render(
      <Toggleable
        defaultOpen={false}
        renderTrigger={({ isOpen, triggerProps }) => (
          <button {...triggerProps}>{isOpen ? '閉じる' : '開く'}</button>
        )}
      >
        <p>内容</p>
      </Toggleable>
    )
    expect(screen.getByRole('button', { name: '開く' })).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument()
  })
})

describe('useToggleable', () => {
  function Probe(props: Parameters<typeof useToggleable>[0]) {
    const { isOpen, toggle, contentId } = useToggleable(props)
    return (
      <div>
        <button onClick={toggle} aria-expanded={isOpen} aria-controls={contentId}>
          {isOpen ? 'opened' : 'closed'}
        </button>
        <div id={contentId}>content</div>
      </div>
    )
  }

  it('uncontrolled で toggle がトグルする', async () => {
    const user = userEvent.setup()
    render(<Probe defaultOpen={false} />)
    expect(screen.getByRole('button', { name: 'closed' })).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: 'opened' })).toBeInTheDocument()
  })

  it('controlled では内部 state を変えない', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<Probe isOpen={false} onToggle={onToggle} />)
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'closed' })).toBeInTheDocument()
  })
})
