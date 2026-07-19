// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ActionBar } from './ActionBar'

describe('ActionBar', () => {
  it('href ありアクションを <a href> で描画する', () => {
    render(<ActionBar actions={[{ label: 'ダウンロード', href: '/dl' }]} />)
    expect(screen.getByRole('link', { name: 'ダウンロード' })).toHaveAttribute('href', '/dl')
  })

  it('href なしアクションを <button> で描画する', () => {
    const onClick = vi.fn()
    render(<ActionBar actions={[{ label: '実行', onClick }]} />)
    fireEvent.click(screen.getByRole('button', { name: '実行' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled (バー全体) のとき href アクションも disabled な button にする', () => {
    render(<ActionBar actions={[{ label: 'DL', href: '/dl' }]} disabled />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button', { name: 'DL' })).toBeDisabled()
  })

  it('アクション個別の disabled を反映する', () => {
    render(<ActionBar actions={[{ label: '実行', onClick: vi.fn(), disabled: true }]} />)
    expect(screen.getByRole('button', { name: '実行' })).toBeDisabled()
  })

  it('loading 中は loadingLabel に差し替え disabled にする', () => {
    render(
      <ActionBar
        actions={[{ label: '送信', onClick: vi.fn(), loading: true, loadingLabel: '送信中…' }]}
      />,
    )
    expect(screen.getByRole('button', { name: '送信中…' })).toBeDisabled()
  })

  it('primary variant / md size のクラスを反映する', () => {
    render(
      <ActionBar
        actions={[{ label: '挑戦', href: '/next', variant: 'primary', size: 'md' }]}
      />,
    )
    const link = screen.getByRole('link', { name: '挑戦' })
    expect(link.className).toContain('bg-brand-600')
    expect(link.className).toContain('px-4')
  })

  it('iconPosition=right でアイコンをラベルの後に置く', () => {
    render(
      <ActionBar
        actions={[{ label: '進む', icon: 'trend-right', iconPosition: 'right', onClick: vi.fn() }]}
      />,
    )
    // ラベルテキストとアイコン (svg) が同居していることを確認
    const button = screen.getByRole('button', { name: /進む/ })
    expect(button.querySelector('svg')).not.toBeNull()
  })

  it('justify=center を反映する', () => {
    const { container } = render(
      <ActionBar actions={[{ label: 'A', onClick: vi.fn() }]} justify="center" />,
    )
    expect((container.firstChild as HTMLElement).className).toContain('justify-center')
  })

  it('leading / children スロットを描画する', () => {
    render(
      <ActionBar
        actions={[{ label: 'A', onClick: vi.fn() }]}
        leading={<span>先頭</span>}
      >
        <button type="button">末尾</button>
      </ActionBar>,
    )
    expect(screen.getByText('先頭')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '末尾' })).toBeInTheDocument()
  })
})
