import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModalCheckboxList } from './ModalCheckboxList'

const items = [
  { id: '1', label: '田中 太郎', description: 'エンジニア' },
  { id: '2', label: '佐藤 花子', description: 'デザイナー' },
  { id: '3', label: '鈴木 一郎' },
]

const defaultProps = {
  isOpen: true,
  title: 'メンバーを選択',
  items,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('ModalCheckboxList', () => {
  it('isOpen=false のとき何も表示しない', () => {
    const { container } = render(<ModalCheckboxList {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('タイトルを表示する', () => {
    render(<ModalCheckboxList {...defaultProps} />)
    expect(screen.getByText('メンバーを選択')).toBeInTheDocument()
  })

  it('全アイテムを表示する', () => {
    render(<ModalCheckboxList {...defaultProps} />)
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
    expect(screen.getByText('鈴木 一郎')).toBeInTheDocument()
  })

  it('アイテムを選択して確認ボタンを押すと onConfirm が呼ばれる', () => {
    const onConfirm = vi.fn()
    render(<ModalCheckboxList {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    fireEvent.click(screen.getByText('確認'))
    expect(onConfirm).toHaveBeenCalledWith(['1'])
  })

  it('キャンセルボタンで onCancel が呼ばれる', () => {
    const onCancel = vi.fn()
    render(<ModalCheckboxList {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('キャンセル'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('requireSelection=true のとき未選択では確認できない', () => {
    const onConfirm = vi.fn()
    render(<ModalCheckboxList {...defaultProps} onConfirm={onConfirm} requireSelection />)
    fireEvent.click(screen.getByText('確認'))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
