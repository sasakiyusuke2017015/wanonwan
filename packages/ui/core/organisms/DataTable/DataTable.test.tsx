import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'

const headers = ['name', 'status', 'score']
const rows = [
  ['田中 太郎', 'active', '4.5'],
  ['佐藤 花子', 'inactive', '3.2'],
  ['鈴木 一郎', 'active', '5.0'],
]

describe('DataTable', () => {
  it('ヘッダーを表示する', () => {
    render(<DataTable headers={headers} rows={rows} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('score')).toBeInTheDocument()
  })

  it('行データを表示する', () => {
    render(<DataTable headers={headers} rows={rows} />)
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
  })

  it('headerLabels で日本語ヘッダーを表示する', () => {
    render(
      <DataTable
        headers={headers}
        rows={rows}
        headerLabels={{ name: '氏名', status: 'ステータス', score: 'スコア' }}
      />
    )
    expect(screen.getByText('氏名')).toBeInTheDocument()
    expect(screen.queryByText('name')).toBeNull()
  })

  it('cellLabels でセル値を変換して表示する', () => {
    render(
      <DataTable
        headers={headers}
        rows={rows}
        cellLabels={{ status: { active: '有効', inactive: '無効' } }}
      />
    )
    expect(screen.getAllByText('有効').length).toBeGreaterThan(0)
    expect(screen.getByText('無効')).toBeInTheDocument()
  })

  it('行クリックで onRowClick が呼ばれる', () => {
    const onRowClick = vi.fn()
    render(<DataTable headers={headers} rows={rows} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onRowClick).toHaveBeenCalled()
  })
})
