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

  it('related を渡すと children の後に描画する', () => {
    render(
      <FormPageShell title="編集" related={<div data-testid="related-zone">関連情報</div>}>
        <p>フォーム本体</p>
      </FormPageShell>,
    )
    const related = screen.getByTestId('related-zone')
    expect(related).toBeInTheDocument()
    const body = screen.getByText('フォーム本体')
    // フォーム本体 → 関連情報 の順 (DOM 順で後)
    expect(body.compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it('gradient=true を AdminPageHeader へ転送する（グラデ背景クラス）', () => {
    render(
      <FormPageShell title="新規作成" gradient>
        <p>body</p>
      </FormPageShell>,
    )
    const header = document.querySelector('[data-component="admin-page-header"]')
    expect(header?.className).toMatch(/bg-gradient-to-b/)
  })

  it('gradient 未指定（既定）ではグラデ背景にならない', () => {
    render(
      <FormPageShell title="編集">
        <p>body</p>
      </FormPageShell>,
    )
    const header = document.querySelector('[data-component="admin-page-header"]')
    expect(header?.className).not.toMatch(/bg-gradient-to-b/)
    expect(header?.className).toMatch(/bg-white/)
  })

  it('headerActions を渡すとヘッダー右にそのまま描画する', () => {
    render(
      <FormPageShell title="編集" headerActions={<button>独自アクション</button>}>
        <p>body</p>
      </FormPageShell>,
    )
    expect(screen.getByRole('button', { name: '独自アクション' })).toBeInTheDocument()
  })

  it('headerActions と nav の同時指定は headerActions が優先される（nav は描画しない）', () => {
    render(
      <FormPageShell
        title="編集"
        nav={[{ icon: 'arrow-left', label: '一覧に戻る', href: '/list' }]}
        headerActions={<button>独自アクション</button>}
      >
        <p>body</p>
      </FormPageShell>,
    )
    expect(screen.getByRole('button', { name: '独自アクション' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '一覧に戻る' })).not.toBeInTheDocument()
  })
})
