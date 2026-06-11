import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailHeader } from './DetailHeader'

const defaultProps = {
  title: 'テスト詳細',
  fields: [
    { label: '作成者', value: '田中 太郎' },
    { label: 'ステータス', value: '有効' },
  ],
}

describe('DetailHeader', () => {
  it('タイトルを表示する', () => {
    render(<DetailHeader {...defaultProps} />)
    expect(screen.getByText('テスト詳細')).toBeInTheDocument()
  })

  it('フィールドのラベルと値を表示する', () => {
    render(<DetailHeader {...defaultProps} />)
    expect(screen.getByText('作成者')).toBeInTheDocument()
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
  })

  it('アクションボタンを表示する', () => {
    render(
      <DetailHeader
        {...defaultProps}
        actions={[{ label: '編集', onClick: vi.fn() }]}
      />
    )
    expect(screen.getByText('編集')).toBeInTheDocument()
  })

  it('アクションボタンをクリックすると onClick が呼ばれる', () => {
    const onClick = vi.fn()
    render(
      <DetailHeader
        {...defaultProps}
        actions={[{ label: '削除', onClick }]}
      />
    )
    fireEvent.click(screen.getByText('削除'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
