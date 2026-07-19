// @vitest-environment jsdom

import { createRef } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CsvActionBar } from './CsvActionBar'

function setup(props: Partial<React.ComponentProps<typeof CsvActionBar>> = {}) {
  const onImportClick = vi.fn()
  const onFileChange = vi.fn()
  const ref = createRef<HTMLInputElement>()
  render(
    <CsvActionBar
      importing={false}
      onImportClick={onImportClick}
      onFileChange={onFileChange}
      fileInputRef={ref}
      templateHref="/api/x/template"
      exportHref="/api/x/export"
      {...props}
    />,
  )
  return { onImportClick, onFileChange }
}

describe('CsvActionBar', () => {
  it('enabled 時 テンプレDL / エクスポート を <a href> で描画する', () => {
    setup()
    expect(screen.getByRole('link', { name: /テンプレート DL/ })).toHaveAttribute(
      'href',
      '/api/x/template',
    )
    expect(screen.getByRole('link', { name: /CSV エクスポート/ })).toHaveAttribute(
      'href',
      '/api/x/export',
    )
  })

  it('テンプレDL / エクスポートのリンクに download 属性を付ける (遷移バーの焼き付き防止)', () => {
    // download 属性が無いと pathname が変わらないダウンロードで NavigationProgress が
    // 起動→完了検知に掛からず、トップバーが焼き付く (nav-anchor-eligibility が download を除外)。
    setup()
    expect(screen.getByRole('link', { name: /テンプレート DL/ })).toHaveAttribute('download')
    expect(screen.getByRole('link', { name: /CSV エクスポート/ })).toHaveAttribute('download')
  })

  it('disabled 時 リンクを出さず disabled な button にする (キーボード遷移不能)', () => {
    setup({ disabled: true })
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button', { name: /テンプレート DL/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /CSV エクスポート/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /CSV インポート/ })).toBeDisabled()
  })

  it('インポートボタン click で onImportClick が発火する', () => {
    const { onImportClick } = setup()
    fireEvent.click(screen.getByRole('button', { name: /CSV インポート/ }))
    expect(onImportClick).toHaveBeenCalledTimes(1)
  })

  it('importing 中は インポートボタンが disabled でラベルが変わる', () => {
    setup({ importing: true })
    expect(screen.getByRole('button', { name: /インポート中/ })).toBeDisabled()
  })

  it('children (新規作成スロット) を描画する', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <CsvActionBar
        importing={false}
        onImportClick={vi.fn()}
        onFileChange={vi.fn()}
        fileInputRef={ref}
      >
        <button type="button">新規作成</button>
      </CsvActionBar>,
    )
    expect(screen.getByRole('button', { name: '新規作成' })).toBeInTheDocument()
  })

  it('hidden file input が accept=.csv で存在する', () => {
    setup()
    const input = document.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', '.csv')
  })

  it('templateHref / exportHref 未指定なら該当アクションを描画しない', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <CsvActionBar
        importing={false}
        onImportClick={vi.fn()}
        onFileChange={vi.fn()}
        fileInputRef={ref}
      />,
    )
    expect(screen.queryByRole('link', { name: /テンプレート DL/ })).toBeNull()
    expect(screen.queryByText(/CSV エクスポート/)).toBeNull()
    // インポート一式が渡されていればインポートボタンを出す
    expect(screen.getByRole('button', { name: /CSV インポート/ })).toBeInTheDocument()
  })

  it('インポート一式未指定 (export-only) ならインポートボタンと file input を描画しない', () => {
    render(<CsvActionBar exportHref="/api/x/export" />)
    expect(screen.queryByText(/CSV インポート/)).toBeNull()
    expect(document.querySelector('input[type="file"]')).toBeNull()
    expect(screen.getByRole('link', { name: /CSV エクスポート/ })).toHaveAttribute(
      'href',
      '/api/x/export',
    )
  })
})
