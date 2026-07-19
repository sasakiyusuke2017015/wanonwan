import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('aria-label が設定される', () => {
    render(<IconButton icon="edit" label="編集" />)
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('data-component 属性が設定されている', () => {
    const { container } = render(<IconButton icon="edit" label="編集" />)
    expect(container.querySelector('[data-component="icon-button"]')).toBeInTheDocument()
  })

  it('disabled のとき操作できない', () => {
    render(<IconButton icon="edit" label="編集" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('クリック時に onClick が呼ばれる', () => {
    const onClick = vi.fn()
    render(<IconButton icon="edit" label="編集" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled のときクリックしても onClick が呼ばれない', () => {
    const onClick = vi.fn()
    render(<IconButton icon="edit" label="編集" disabled onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  describe('spinOnClick (アイコン登録角で累積回転)', () => {
    const getIcon = (container: HTMLElement) =>
      container.querySelector('[data-component="icon"]') as SVGElement

    it('gear はクリックごとに 90° ずつ累積回転する', () => {
      const { container } = render(<IconButton icon="gear" label="設定" spinOnClick />)
      const icon = getIcon(container)
      expect(icon.style.transform).toBe('rotate(0deg)')
      fireEvent.click(screen.getByRole('button'))
      expect(icon.style.transform).toBe('rotate(90deg)')
      fireEvent.click(screen.getByRole('button'))
      expect(icon.style.transform).toBe('rotate(180deg)')
    })

    it('arrow-rotate はクリックごとに 180° ずつ累積回転する', () => {
      const { container } = render(
        <IconButton icon="arrow-rotate" label="リセット" spinOnClick />,
      )
      fireEvent.click(screen.getByRole('button'))
      expect(getIcon(container).style.transform).toBe('rotate(180deg)')
    })

    it('columns-3 はクリックごとに Y 軸フリップ (180° 累積) する', () => {
      const { container } = render(
        <IconButton icon="columns-3" label="表示する列" spinOnClick />,
      )
      const icon = getIcon(container)
      expect(icon.style.transform).toBe('perspective(200px) rotateY(0deg)')
      fireEvent.click(screen.getByRole('button'))
      expect(icon.style.transform).toBe('perspective(200px) rotateY(180deg)')
      fireEvent.click(screen.getByRole('button'))
      expect(icon.style.transform).toBe('perspective(200px) rotateY(360deg)')
    })

    it('登録のないアイコンは spinOnClick でも回転しない', () => {
      const { container } = render(<IconButton icon="edit" label="編集" spinOnClick />)
      fireEvent.click(screen.getByRole('button'))
      expect(getIcon(container).style.transform).toBe('')
    })

    it('spinOnClick 未指定なら回転しない', () => {
      const { container } = render(<IconButton icon="gear" label="設定" />)
      fireEvent.click(screen.getByRole('button'))
      expect(getIcon(container).style.transform).toBe('')
    })
  })

  describe('active (押し込み見た目)', () => {
    it('active=true で data-active 属性が付く', () => {
      render(<IconButton icon="funnel" label="フィルタ" active />)
      expect(screen.getByRole('button', { name: 'フィルタ' })).toHaveAttribute('data-active')
    })

    it('active 未指定なら data-active は付かない', () => {
      render(<IconButton icon="funnel" label="フィルタ" />)
      expect(screen.getByRole('button', { name: 'フィルタ' })).not.toHaveAttribute('data-active')
    })

    it('active=false なら data-active は付かない', () => {
      render(<IconButton icon="funnel" label="フィルタ" active={false} />)
      expect(screen.getByRole('button', { name: 'フィルタ' })).not.toHaveAttribute('data-active')
    })

    it('disabled のときは active でも押し込み見た目にしない', () => {
      render(<IconButton icon="funnel" label="フィルタ" active disabled />)
      expect(screen.getByRole('button', { name: 'フィルタ' })).not.toHaveAttribute('data-active')
    })

    it('href 指定 (<a> 描画) でも active が効く', () => {
      render(<IconButton icon="funnel" label="フィルタ" href="/list" active />)
      expect(screen.getByRole('link', { name: 'フィルタ' })).toHaveAttribute('data-active')
    })
  })

  describe('tooltip (Tooltip atom)', () => {
    it('label 指定で Tooltip atom が付く (native title は使わない)', () => {
      render(<IconButton icon="edit" label="編集" />)
      expect(screen.getByRole('tooltip')).toHaveTextContent('編集')
      expect(screen.getByRole('button', { name: '編集' })).not.toHaveAttribute('title')
    })

    it('label なしなら tooltip を出さない', () => {
      render(<IconButton icon="edit" aria-label="編集" />)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('tooltipPosition が Tooltip に渡る (既定は top)', () => {
      const { rerender } = render(<IconButton icon="edit" label="編集" />)
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'top')
      rerender(<IconButton icon="edit" label="編集" tooltipPosition="top-end" />)
      expect(screen.getByRole('tooltip')).toHaveAttribute('data-position', 'top-end')
    })

    it('href 指定 (<a> 描画) でも tooltip が付く', () => {
      render(<IconButton icon="edit" label="編集" href="/edit" />)
      expect(screen.getByRole('tooltip')).toHaveTextContent('編集')
      expect(screen.getByRole('link', { name: '編集' })).not.toHaveAttribute('title')
    })
  })

  describe('href (リンク化)', () => {
    it('href を渡すと <a href> で描画する (Ctrl+クリック等の別タブを有効化)', () => {
      render(<IconButton icon="edit" label="編集" href="/edit" />)
      const link = screen.getByRole('link', { name: '編集' })
      expect(link).toHaveAttribute('href', '/edit')
    })

    it('href なしなら従来どおり <button>', () => {
      render(<IconButton icon="edit" label="編集" />)
      expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('通常クリックは preventDefault して onClick を呼ぶ (SPA 遷移に差し替え)', () => {
      const onClick = vi.fn()
      render(<IconButton icon="edit" label="編集" href="/edit" onClick={onClick} />)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
      const preventDefault = vi.spyOn(event, 'preventDefault')
      screen.getByRole('link').dispatchEvent(event)
      expect(preventDefault).toHaveBeenCalled()
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('Ctrl+クリックは素通しし onClick を呼ばない (ブラウザの別タブに委ねる)', () => {
      const onClick = vi.fn()
      render(<IconButton icon="edit" label="編集" href="/edit" onClick={onClick} />)
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
        ctrlKey: true,
      })
      const preventDefault = vi.spyOn(event, 'preventDefault')
      screen.getByRole('link').dispatchEvent(event)
      expect(preventDefault).not.toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    it('中クリック (button=1) も素通しする', () => {
      const onClick = vi.fn()
      render(<IconButton icon="edit" label="編集" href="/edit" onClick={onClick} />)
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 1,
      })
      screen.getByRole('link').dispatchEvent(event)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('disabled なら href を渡しても <button> のまま (リンクに disabled は無いため)', () => {
      render(<IconButton icon="edit" label="編集" href="/edit" disabled />)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '編集' })).toBeDisabled()
    })
  })
})
