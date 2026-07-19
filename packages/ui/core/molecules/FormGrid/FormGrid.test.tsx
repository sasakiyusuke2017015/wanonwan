import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FormGrid } from './FormGrid'

describe('FormGrid', () => {
  it('コンテナと子をそのまま描画する', () => {
    render(
      <FormGrid>
        <FormGrid.Item>
          <span>名称</span>
        </FormGrid.Item>
      </FormGrid>,
    )
    expect(document.querySelector('[data-component="form-grid"]')).toBeInTheDocument()
    expect(screen.getByText('名称')).toBeInTheDocument()
  })

  it('Item の width 既定は full', () => {
    render(
      <FormGrid>
        <FormGrid.Item>
          <span>説明</span>
        </FormGrid.Item>
      </FormGrid>,
    )
    const item = document.querySelector('[data-component="form-grid-item"]')
    expect(item).toHaveAttribute('data-width', 'full')
  })

  it.each(['short', 'half', 'wide', 'full'] as const)(
    'width=%s が data-width に反映される',
    (width) => {
      render(
        <FormGrid>
          <FormGrid.Item width={width}>
            <span>field</span>
          </FormGrid.Item>
        </FormGrid>,
      )
      const item = document.querySelector('[data-component="form-grid-item"]')
      expect(item).toHaveAttribute('data-width', width)
    },
  )

  it('newRow=true で data-new-row が付く（既定は付かない）', () => {
    render(
      <FormGrid>
        <FormGrid.Item width="short">
          <span>a</span>
        </FormGrid.Item>
        <FormGrid.Item width="short" newRow>
          <span>b</span>
        </FormGrid.Item>
      </FormGrid>,
    )
    const items = document.querySelectorAll('[data-component="form-grid-item"]')
    expect(items[0]).not.toHaveAttribute('data-new-row')
    expect(items[1]).toHaveAttribute('data-new-row', 'true')
  })

  it('複数 Item を順序どおり描画する', () => {
    render(
      <FormGrid>
        <FormGrid.Item width="wide">
          <span>名称</span>
        </FormGrid.Item>
        <FormGrid.Item width="short">
          <span>コード</span>
        </FormGrid.Item>
        <FormGrid.Item width="full">
          <span>説明</span>
        </FormGrid.Item>
      </FormGrid>,
    )
    const items = document.querySelectorAll('[data-component="form-grid-item"]')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('名称')
    expect(items[2]).toHaveTextContent('説明')
  })
})
