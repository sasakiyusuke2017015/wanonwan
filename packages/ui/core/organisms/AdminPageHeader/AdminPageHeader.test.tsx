import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminPageHeader } from './AdminPageHeader'

describe('AdminPageHeader', () => {
  it('タイトルを表示する', () => {
    render(<AdminPageHeader title="管理 太郎" />)
    expect(screen.getByRole('heading', { name: '管理 太郎' })).toBeInTheDocument()
  })

  it('subtitle を表示する', () => {
    render(<AdminPageHeader title="管理 太郎" subtitle="ID: USR-001" />)
    expect(screen.getByText('ID: USR-001')).toBeInTheDocument()
  })

  it('status / icon / actions を表示する', () => {
    render(
      <AdminPageHeader
        title="管理 太郎"
        icon={<span data-testid="icon" />}
        status={<span>有効</span>}
        actions={<button>編集</button>}
      />,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('有効')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('gradient=true で背景クラスが変わる', () => {
    const { container } = render(<AdminPageHeader title="t" gradient />)
    const el = container.querySelector('[data-component="admin-page-header"]')
    expect(el?.className).toContain('bg-gradient-to-b')
  })
})
