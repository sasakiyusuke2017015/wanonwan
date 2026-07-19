import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb'

const home: BreadcrumbItem = { key: 'home', label: '', href: '/dashboard', isHome: true }

describe('Breadcrumb', () => {
  it('items が空なら何も描画しない', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('ホーム単独のときはアイコンのみの現在地表示 (link にしない)', () => {
    render(<Breadcrumb items={[{ key: 'home', label: '', isHome: true }]} />)
    expect(screen.getByLabelText('ホーム')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('href ありの中間項目は link、末尾は aria-current="page" の span', () => {
    render(
      <Breadcrumb
        items={[
          home,
          { key: 'seg-0', label: '問題バンク', href: '/questions' },
          { key: 'seg-1', label: '編集' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'ホーム' }).getAttribute('href')).toBe('/dashboard')
    expect(screen.getByRole('link', { name: /問題バンク/ }).getAttribute('href')).toBe('/questions')
    const tail = screen.getByText('編集')
    expect(tail.getAttribute('aria-current')).toBe('page')
    expect(screen.queryByRole('link', { name: '編集' })).toBeNull()
  })

  it('末尾は href があっても link にしない (現在地)', () => {
    render(
      <Breadcrumb
        items={[home, { key: 'seg-0', label: '問題バンク', href: '/questions' }]}
      />,
    )
    const tail = screen.getByText('問題バンク')
    expect(tail.getAttribute('aria-current')).toBe('page')
    expect(screen.queryByRole('link', { name: '問題バンク' })).toBeNull()
  })

  it('href の無い中間項目は span (404 link を作らない)', () => {
    render(
      <Breadcrumb
        items={[
          home,
          { key: 'seg-0', label: '147' },
          { key: 'seg-1', label: '編集' },
        ]}
      />,
    )
    const id = screen.getByText('147')
    expect(id.tagName).toBe('SPAN')
    expect(screen.queryByRole('link', { name: '147' })).toBeNull()
  })

  it('linkAs で注入したコンポーネントが link 描画に使われる', () => {
    const CustomLink: React.ComponentType<{
      href: string
      className?: string
      'aria-label'?: string
      children: React.ReactNode
    }> = ({ href, children, ...rest }) => (
      <a href={href} data-testid="custom-link" {...rest}>
        {children}
      </a>
    )
    render(
      <Breadcrumb
        items={[home, { key: 'seg-0', label: '現在地' }]}
        linkAs={CustomLink}
      />,
    )
    expect(screen.getByTestId('custom-link').getAttribute('href')).toBe('/dashboard')
  })

  it('nav に aria-label="パンくず" が付く', () => {
    render(<Breadcrumb items={[home, { key: 'seg-0', label: '現在地' }]} />)
    expect(screen.getByRole('navigation', { name: 'パンくず' })).toBeInTheDocument()
  })
})
