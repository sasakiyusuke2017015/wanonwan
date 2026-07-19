// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { DangerZone } from './DangerZone'

describe('DangerZone', () => {
  it('既定見出し「⚠ 危険な操作」と枠を表示する', () => {
    render(
      <DangerZone>
        <DangerZone.Item
          icon="ban"
          title="アカウントの無効化"
          description="ログインと受講を停止します。"
          actionLabel="無効化する"
          onAction={() => {}}
        />
      </DangerZone>,
    )
    expect(screen.getByText('⚠ 危険な操作')).toBeInTheDocument()
  })

  it('見出しを title prop で差し替えられる', () => {
    render(
      <DangerZone title="⚠ 取り扱い注意">
        <DangerZone.Item icon="trash" title="削除" description="d" actionLabel="削除する" onAction={() => {}} />
      </DangerZone>,
    )
    expect(screen.getByText('⚠ 取り扱い注意')).toBeInTheDocument()
    expect(screen.queryByText('⚠ 危険な操作')).not.toBeInTheDocument()
  })

  it('Item のタイトル・説明・アクションボタンを表示し、クリックで onAction を呼ぶ', () => {
    const onAction = vi.fn()
    render(
      <DangerZone>
        <DangerZone.Item
          icon="trash"
          title="コースの削除"
          description="コースを完全に削除します。この操作は元に戻せません。"
          actionLabel="削除する"
          onAction={onAction}
        />
      </DangerZone>,
    )
    expect(screen.getByText('コースの削除')).toBeInTheDocument()
    expect(
      screen.getByText('コースを完全に削除します。この操作は元に戻せません。'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '削除する' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('disabled のときボタンが押せず、disabledReason を表示する', () => {
    const onAction = vi.fn()
    render(
      <DangerZone>
        <DangerZone.Item
          icon="trash"
          title="試験の削除"
          description="d"
          actionLabel="削除する"
          onAction={onAction}
          disabled
          disabledReason="下書きに戻すと削除できます"
        />
      </DangerZone>,
    )
    const button = screen.getByRole('button', { name: '削除する' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAction).not.toHaveBeenCalled()
    expect(screen.getByText('下書きに戻すと削除できます')).toBeInTheDocument()
  })

  it('disabled でなければ disabledReason は表示しない', () => {
    render(
      <DangerZone>
        <DangerZone.Item
          icon="trash"
          title="試験の削除"
          description="d"
          actionLabel="削除する"
          onAction={() => {}}
          disabledReason="下書きに戻すと削除できます"
        />
      </DangerZone>,
    )
    expect(screen.queryByText('下書きに戻すと削除できます')).not.toBeInTheDocument()
  })

  it('複数 Item を並べられる', () => {
    render(
      <DangerZone>
        <DangerZone.Item icon="eye-slashed" title="非公開に戻す" description="d1" actionLabel="非公開にする" onAction={() => {}} />
        <DangerZone.Item icon="trash" title="コースの削除" description="d2" actionLabel="削除する" onAction={() => {}} />
      </DangerZone>,
    )
    expect(screen.getByText('非公開に戻す')).toBeInTheDocument()
    expect(screen.getByText('コースの削除')).toBeInTheDocument()
  })

  it('tone=success のアクションも出せる (有効化など)', () => {
    render(
      <DangerZone>
        <DangerZone.Item
          icon="check-circle"
          tone="success"
          title="アカウントの有効化"
          description="d"
          actionLabel="有効化する"
          actionVariant="success"
          onAction={() => {}}
        />
      </DangerZone>,
    )
    expect(screen.getByRole('button', { name: '有効化する' })).toBeInTheDocument()
  })

  it('loading 中はボタンが disabled になる', () => {
    const onAction = vi.fn()
    render(
      <DangerZone>
        <DangerZone.Item
          icon="trash"
          title="削除"
          description="d"
          actionLabel="削除する"
          onAction={onAction}
          loading
        />
      </DangerZone>,
    )
    const button = screen.getByRole('button', { name: /削除する/ })
    expect(button).toBeDisabled()
  })
})
