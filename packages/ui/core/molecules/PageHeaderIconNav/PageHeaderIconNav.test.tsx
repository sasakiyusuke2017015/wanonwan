import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { PageHeaderIconNav } from './PageHeaderIconNav'

describe('PageHeaderIconNav', () => {
  it('items 分のアイコンリンクを href / aria-label 付きで描画する', () => {
    render(
      <PageHeaderIconNav
        items={[
          { icon: 'users', label: '対象ユーザー', href: '/exams/1/targets' },
          { icon: 'arrow-left', label: '一覧に戻る', href: '/exams' },
        ]}
      />,
    )
    const targets = screen.getByRole('link', { name: '対象ユーザー' })
    const back = screen.getByRole('link', { name: '一覧に戻る' })
    expect(targets).toHaveAttribute('href', '/exams/1/targets')
    expect(back).toHaveAttribute('href', '/exams')
  })

  it('label を tooltip として描画する', () => {
    render(
      <PageHeaderIconNav items={[{ icon: 'arrow-left', label: '一覧に戻る', href: '/exams' }]} />,
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('一覧に戻る')
  })

  it('items が空なら何も描画しない', () => {
    const { container } = render(<PageHeaderIconNav items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('onClick 付き item は通常クリックで preventDefault して onClick を呼ぶ', () => {
    const onClick = vi.fn()
    render(
      <PageHeaderIconNav
        items={[{ icon: 'arrow-left', label: '一覧に戻る', href: '/exams', onClick }]}
      />,
    )
    const link = screen.getByRole('link', { name: '一覧に戻る' })
    const prevented = !fireEvent.click(link)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(prevented).toBe(true)
  })

  it('onClick 付きでも Ctrl+クリック（別タブ系）はブラウザに委ねる', () => {
    const onClick = vi.fn()
    render(
      <PageHeaderIconNav
        items={[{ icon: 'arrow-left', label: '一覧に戻る', href: '/exams', onClick }]}
      />,
    )
    const link = screen.getByRole('link', { name: '一覧に戻る' })
    fireEvent.click(link, { ctrlKey: true })
    expect(onClick).not.toHaveBeenCalled()
  })
})
