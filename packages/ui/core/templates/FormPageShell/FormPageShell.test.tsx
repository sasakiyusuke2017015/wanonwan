import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FormPageShell } from './FormPageShell'

describe('FormPageShell', () => {
  it('タイトル・subtitle・children を描画する', () => {
    render(
      <FormPageShell title="コースカテゴリを編集" subtitle="分類マスタです">
        <p>フォーム本体</p>
      </FormPageShell>,
    )
    expect(screen.getByRole('heading', { name: 'コースカテゴリを編集' })).toBeInTheDocument()
    expect(screen.getByText('分類マスタです')).toBeInTheDocument()
    expect(screen.getByText('フォーム本体')).toBeInTheDocument()
  })

  it('nav を渡すとヘッダー右にアイコンナビが出る', () => {
    render(
      <FormPageShell
        title="編集"
        nav={[{ icon: 'arrow-left', label: '一覧に戻る', href: '/list' }]}
      >
        <p>body</p>
      </FormPageShell>,
    )
    const link = screen.getByRole('link', { name: '一覧に戻る' })
    expect(link).toHaveAttribute('href', '/list')
  })

  it('nav 未指定 / 空ならアイコンナビを出さない', () => {
    render(
      <FormPageShell title="編集" nav={[]}>
        <p>body</p>
      </FormPageShell>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('footer を渡すと StickyFormFooter に描画する', () => {
    render(
      <FormPageShell title="編集" footer={<button>保存する</button>}>
        <p>body</p>
      </FormPageShell>,
    )
    expect(
      document.querySelector('[data-component="sticky-form-footer"]'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存する' })).toBeInTheDocument()
  })

  it('footer なし（閲覧ページ）ではフッターを出さない', () => {
    render(
      <FormPageShell title="詳細">
        <p>body</p>
      </FormPageShell>,
    )
    expect(
      document.querySelector('[data-component="sticky-form-footer"]'),
    ).not.toBeInTheDocument()
  })
})
