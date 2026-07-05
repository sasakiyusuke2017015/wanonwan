import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DataTable } from './DataTable'
import type { Column, RowActionDef } from './types'

// 列ピッカーは uncontrolled モードで表示列を localStorage に永続化するため、
// テスト間で状態が漏れないよう毎回クリアする。
afterEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    /* jsdom 以外でも落ちないように */
  }
})

interface Row {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  score: number
}

const rows: Row[] = [
  { id: 'u1', name: '田中 太郎', status: 'active', score: 4.5 },
  { id: 'u2', name: '佐藤 花子', status: 'inactive', score: 3.2 },
  { id: 'u3', name: '鈴木 一郎', status: 'active', score: 5.0 },
]

const columns: Column<Row>[] = [
  { key: 'name', label: '氏名' },
  { key: 'status', label: 'ステータス' },
  { key: 'score', label: 'スコア', align: 'right' },
]

describe('DataTable - 表示', () => {
  it('columns.label をヘッダーに表示する', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('氏名')).toBeInTheDocument()
    expect(screen.getByText('ステータス')).toBeInTheDocument()
    expect(screen.getByText('スコア')).toBeInTheDocument()
  })

  it('row[key] の値をセルに表示する (render 未指定時)', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('rows が空のとき emptyMessage を表示する', () => {
    render(<DataTable columns={columns} rows={[]} emptyMessage="該当なし" />)
    expect(screen.getByText('該当なし')).toBeInTheDocument()
  })

  it('emptyMessage 未指定時はデフォルトメッセージを表示', () => {
    render(<DataTable columns={columns} rows={[]} />)
    expect(screen.getByText('データなし')).toBeInTheDocument()
  })

  it('flush=true で wrapper に wrapperFlush クラスが付く (親パネル埋め込み形態)', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} flush />)
    const wrapper = container.querySelector('[data-component="data-table"]')
    expect(wrapper?.className).toMatch(/wrapperFlush/)
  })

  it('flush 未指定では wrapperFlush クラスが付かない', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />)
    const wrapper = container.querySelector('[data-component="data-table"]')
    expect(wrapper?.className).not.toMatch(/wrapperFlush/)
  })
})

describe('DataTable - column.render と ReactNode セル', () => {
  it('render 関数の戻り値をそのままセルに描画する', () => {
    const cols: Column<Row>[] = [
      { key: 'name', label: '氏名' },
      {
        key: 'status',
        label: 'ステータス',
        render: (row) => (
          <span data-testid={`badge-${row.id}`}>{row.status === 'active' ? '有効' : '無効'}</span>
        ),
      },
    ]
    render(<DataTable columns={cols} rows={rows} />)
    expect(screen.getByTestId('badge-u1')).toHaveTextContent('有効')
    expect(screen.getByTestId('badge-u2')).toHaveTextContent('無効')
  })

  it('null / undefined セル値は空文字として描画する', () => {
    interface Sparse {
      id: string
      label: string | null
    }
    const cols: Column<Sparse>[] = [
      { key: 'id', label: 'ID' },
      { key: 'label', label: 'ラベル' },
    ]
    const data: Sparse[] = [{ id: 'x', label: null }]
    const { container } = render(<DataTable columns={cols} rows={data} />)
    const tds = container.querySelectorAll('tbody td')
    expect(tds[0]).toHaveTextContent('x')
    expect(tds[1]).toHaveTextContent('')
  })
})

describe('DataTable - mode="client" (default)', () => {
  it('検索ボックスで rows をフィルタする', () => {
    render(<DataTable columns={columns} rows={rows} />)
    const search = screen.getByPlaceholderText('キーワードで検索')
    fireEvent.change(search, { target: { value: '田中' } })
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    expect(screen.queryByText('佐藤 花子')).toBeNull()
  })

  it('showSearch=false で検索ボックスを非表示にする', () => {
    render(<DataTable columns={columns} rows={rows} showSearch={false} />)
    expect(screen.queryByPlaceholderText('キーワードで検索')).toBeNull()
  })

  it('sortable column のヘッダクリックで asc → desc → none を循環する', () => {
    const sortable: Column<Row>[] = [
      { key: 'name', label: '氏名', sortable: true },
      { key: 'score', label: 'スコア', sortable: true, align: 'right' },
    ]
    const { container } = render(<DataTable columns={sortable} rows={rows} />)
    const scoreHeader = screen.getByText('スコア').closest('th')!
    // 初期表示順 (id 順)
    let cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('田中 太郎')

    // asc
    fireEvent.click(scoreHeader)
    cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('佐藤 花子') // score 3.2
    expect(cells[2]).toHaveTextContent('鈴木 一郎') // score 5.0

    // desc
    fireEvent.click(scoreHeader)
    cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('鈴木 一郎')
    expect(cells[2]).toHaveTextContent('佐藤 花子')

    // none (元の順)
    fireEvent.click(scoreHeader)
    cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('田中 太郎')
  })

  it('sortable=false の column はクリックしてもソートされない', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />)
    const scoreHeader = screen.getByText('スコア').closest('th')!
    fireEvent.click(scoreHeader)
    const cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('田中 太郎') // 順序不変
  })

  it('rows > pageSize で pagination を表示し、‹/› で移動できる', () => {
    const many: Row[] = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `ユーザ${String(i).padStart(2, '0')}`,
      status: 'active' as const,
      score: i,
    }))
    render(<DataTable columns={columns} rows={many} pageSize={10} />)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText('ユーザ00')).toBeInTheDocument()
    expect(screen.queryByText('ユーザ10')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '›' }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.getByText('ユーザ10')).toBeInTheDocument()
    expect(screen.queryByText('ユーザ00')).toBeNull()
  })

  it('showPagination=false で pagination 非表示・全 rows 描画', () => {
    const many: Row[] = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `ユーザ${i}`,
      status: 'active' as const,
      score: i,
    }))
    render(<DataTable columns={columns} rows={many} pageSize={10} showPagination={false} />)
    expect(screen.queryByText('1 / 3')).toBeNull()
    expect(screen.getByText('ユーザ24')).toBeInTheDocument()
  })

  it('onColumnsChange があると column picker (gear) を表示する', () => {
    const onColumnsChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={rows}
        visibleColumns={['name', 'status', 'score']}
        onColumnsChange={onColumnsChange}
      />,
    )
    expect(screen.getByRole('button', { name: '表示する列を切り替える' })).toBeInTheDocument()
  })

  it('column picker で表示カラムを切り替えると onColumnsChange が呼ばれる', () => {
    const onColumnsChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={rows}
        visibleColumns={['name', 'status', 'score']}
        onColumnsChange={onColumnsChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '表示する列を切り替える' }))
    // picker と thead に同じ label テキストが両方出るため、<label> 要素配下のものに絞る
    const statusLabel = screen
      .getAllByText('ステータス')
      .find((el) => el.closest('label') !== null)
      ?.closest('label')
    expect(statusLabel).toBeDefined()
    fireEvent.click(within(statusLabel as HTMLElement).getByRole('checkbox'))
    expect(onColumnsChange).toHaveBeenCalledWith(['name', 'score'])
  })

  it('hideable:false の列は picker で切替コントロールを持たず鍵アイコン (常に表示) + 常時描画される', () => {
    const onColumnsChange = vi.fn()
    const lockable: Column<Row>[] = [
      { key: 'name', label: '氏名', hideable: false },
      { key: 'status', label: 'ステータス' },
      { key: 'score', label: 'スコア' },
    ]
    render(
      <DataTable
        columns={lockable}
        rows={rows}
        visibleColumns={['status', 'score']}
        onColumnsChange={onColumnsChange}
      />,
    )
    // visibleColumns に 'name' が無くても、hideable:false なので thead に出る
    expect(screen.getByRole('columnheader', { name: '氏名' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '表示する列を切り替える' }))
    // picker 内の "氏名" 行 (columnheader ではない方)
    const namePickerLabel = screen
      .getAllByText('氏名')
      .find((el) => el.closest('[role="columnheader"]') === null)
    expect(namePickerLabel).toBeDefined()
    const lockRow = namePickerLabel!.closest('div') as HTMLElement
    // 鍵アイコン (常に表示) を持ち、トグル/チェックボックスは持たない
    expect(within(lockRow).getByLabelText('常に表示')).toBeInTheDocument()
    expect(within(lockRow).queryByRole('checkbox')).toBeNull()
    // ロック列の no-op ロジック (toggleVisibleColumn) は columnVisibility.test.ts で担保
  })

  it('rowActions の操作列は picker に「常に表示」のロック行として出る', () => {
    const onColumnsChange = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', onClick: vi.fn() }]
    render(
      <DataTable
        columns={columns}
        rows={rows}
        visibleColumns={['name', 'status', 'score']}
        onColumnsChange={onColumnsChange}
        rowActions={actions}
      />,
    )
    // 操作列はヘッダーに出る
    expect(screen.getByRole('columnheader', { name: '操作' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '表示する列を切り替える' }))
    // picker 内に操作行 (columnheader ではない "操作") が鍵バッジ付きで出る
    const opPickerLabel = screen
      .getAllByText('操作')
      .find((el) => el.closest('[role="columnheader"]') === null)
    expect(opPickerLabel).toBeDefined()
    const lockRow = opPickerLabel!.closest('div[draggable]') as HTMLElement
    // ロック行は切替コントロールを持たないが、並べ替え (ドラッグ) は可能
    expect(lockRow).not.toBeNull()
    expect(within(lockRow).queryByRole('checkbox')).toBeNull()
    expect(within(lockRow).getByLabelText('常に表示')).toBeInTheDocument()
  })

  it('defaultHidden の列は visibleColumns 未指定なら初期非表示', () => {
    const withHidden: Column<Row>[] = [
      { key: 'name', label: '氏名' },
      { key: 'status', label: 'ステータス', defaultHidden: true },
      { key: 'score', label: 'スコア' },
    ]
    render(<DataTable columns={withHidden} rows={rows} />)
    expect(screen.queryByRole('columnheader', { name: 'ステータス' })).toBeNull()
    expect(screen.getByRole('columnheader', { name: '氏名' })).toBeInTheDocument()
  })
})

describe('DataTable - filter ↔ 列表示の連動 (columnKey)', () => {
  const makeStatusFilter = (columnKey?: string) => ({
    key: 'status',
    label: 'ステータス絞込',
    multiple: true as const,
    value: [] as string[],
    onChange: vi.fn(),
    columnKey,
    options: [
      { value: 'active', label: '稼働' },
      { value: 'inactive', label: '停止' },
    ],
  })

  it('columnKey の対応列が非表示なら filter 入力を描画しない', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'score']}
        onColumnsChange={vi.fn()}
        filters={[makeStatusFilter('status')]}
      />,
    )
    expect(screen.queryByText('ステータス絞込')).toBeNull()
  })

  it('columnKey の対応列を表示すると filter 入力が現れる', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'status', 'score']}
        onColumnsChange={vi.fn()}
        filters={[makeStatusFilter('status')]}
      />,
    )
    expect(screen.getByText('ステータス絞込')).toBeInTheDocument()
  })

  it('columnKey 未指定の filter は列表示に関わらず常時描画する', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'score']}
        onColumnsChange={vi.fn()}
        filters={[makeStatusFilter(undefined)]}
      />,
    )
    expect(screen.getByText('ステータス絞込')).toBeInTheDocument()
  })

  it('対応列を隠しても、値が入った filter は入力が残る (サイレント化しない)', () => {
    const filter = {
      key: 'status',
      label: 'ステータス絞込',
      multiple: true as const,
      value: ['active'],
      onChange: vi.fn(),
      columnKey: 'status',
      options: [
        { value: 'active', label: '稼働' },
        { value: 'inactive', label: '停止' },
      ],
    }
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'score']}
        onColumnsChange={vi.fn()}
        filters={[filter]}
      />,
    )
    // 列は隠れていても、絞り込み中の filter は入力が残る (適用中の状態が見える)
    expect(screen.getByText('ステータス絞込: 1件')).toBeInTheDocument()
  })

  it('値を空にすると、対応列が非表示の filter は入力も隠れる', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'score']}
        onColumnsChange={vi.fn()}
        filters={[makeStatusFilter('status')]}
      />,
    )
    // value 空 + 列非表示 → 入力は出ない
    expect(screen.queryByText('ステータス絞込')).toBeNull()
  })
})

describe('DataTable - mode="server"', () => {
  it('rows をそのまま描画する (内部 pagination で slice しない)', () => {
    const many: Row[] = Array.from({ length: 30 }, (_, i) => ({
      id: `u${i}`,
      name: `ユーザ${i}`,
      status: 'active' as const,
      score: i,
    }))
    render(<DataTable mode="server" columns={columns} rows={many} getRowKey={(r) => r.id} />)
    expect(screen.getByText('ユーザ0')).toBeInTheDocument()
    expect(screen.getByText('ユーザ29')).toBeInTheDocument()
  })

  it('内部 pagination / 検索ボックスが描画されない', () => {
    render(<DataTable mode="server" columns={columns} rows={rows} getRowKey={(r) => r.id} />)
    expect(screen.queryByPlaceholderText('キーワードで検索')).toBeNull()
    expect(screen.queryByRole('button', { name: '›' })).toBeNull()
  })

  it('sortable column のヘッダはクリック可能でも内部ソートしない', () => {
    const sortable: Column<Row>[] = [
      { key: 'name', label: '氏名' },
      { key: 'score', label: 'スコア', sortable: true },
    ]
    const { container } = render(
      <DataTable mode="server" columns={sortable} rows={rows} getRowKey={(r) => r.id} />,
    )
    const scoreHeader = screen.getByText('スコア').closest('th')!
    fireEvent.click(scoreHeader)
    const cells = container.querySelectorAll('tbody tr td:first-child')
    expect(cells[0]).toHaveTextContent('田中 太郎') // server mode は順不変
  })

  it('server モード: sort.items の列だけ方向アイコンが出る (未ソート列は出ない)', () => {
    const cols: Column<Row>[] = [
      { key: 'name', label: '氏名', sortable: true },
      { key: 'score', label: 'スコア', sortable: true },
    ]
    render(
      <DataTable
        mode="server"
        columns={cols}
        rows={rows}
        getRowKey={(r) => r.id}
        sort={{ items: [{ columnKey: 'score', order: 'asc' }], onSortClick: vi.fn() }}
      />,
    )
    const scoreTh = screen.getByText('スコア').closest('th')!
    const nameTh = screen.getByText('氏名').closest('th')!
    expect(scoreTh.textContent).toContain('▲')
    expect(nameTh.textContent).not.toContain('▲')
    expect(nameTh.textContent).not.toContain('▼')
  })

  it('server モード: 複数 sort.items で ①② の優先順位が出る', () => {
    const cols: Column<Row>[] = [
      { key: 'name', label: '氏名', sortable: true },
      { key: 'score', label: 'スコア', sortable: true },
    ]
    render(
      <DataTable
        mode="server"
        columns={cols}
        rows={rows}
        getRowKey={(r) => r.id}
        sort={{
          items: [
            { columnKey: 'score', order: 'desc' },
            { columnKey: 'name', order: 'asc' },
          ],
          onSortClick: vi.fn(),
        }}
      />,
    )
    const scoreTh = screen.getByText('スコア').closest('th')!
    const nameTh = screen.getByText('氏名').closest('th')!
    expect(scoreTh.textContent).toContain('①')
    expect(scoreTh.textContent).toContain('▼')
    expect(nameTh.textContent).toContain('②')
    expect(nameTh.textContent).toContain('▲')
  })

  it('getRowKey の戻り値が <tr key> に使われる (key 経由で行特定可能)', () => {
    const { rerender, container } = render(
      <DataTable mode="server" columns={columns} rows={rows} getRowKey={(r) => r.id} />,
    )
    const firstTr = container.querySelector('tbody tr')!
    expect(within(firstTr as HTMLElement).getByText('田中 太郎')).toBeInTheDocument()

    // rows の並びが入れ替わっても key が安定していれば React は同じ DOM を再利用
    const reordered = [...rows].reverse()
    rerender(<DataTable mode="server" columns={columns} rows={reordered} getRowKey={(r) => r.id} />)
    const firstTrAfter = container.querySelector('tbody tr')!
    expect(within(firstTrAfter as HTMLElement).getByText('鈴木 一郎')).toBeInTheDocument()
  })

  it('server モード: onColumnsChange があると column picker が出てトグルできる', () => {
    const onColumnsChange = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name', 'status', 'score']}
        onColumnsChange={onColumnsChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '表示する列を切り替える' }))
    const statusLabel = screen
      .getAllByText('ステータス')
      .find((el) => el.closest('label') !== null)
      ?.closest('label') as HTMLElement
    fireEvent.click(within(statusLabel).getByRole('checkbox'))
    expect(onColumnsChange).toHaveBeenCalledWith(['name', 'score'])
  })
})

describe('DataTable - selection', () => {
  it('selectable=true で checkbox 列を表示する', () => {
    render(<DataTable columns={columns} rows={rows} selectable />)
    // 全選択 + 各行 = 4 個の checkbox
    expect(screen.getAllByRole('checkbox')).toHaveLength(rows.length + 1)
  })

  it('行 checkbox クリックで onSelectionChange が呼ばれる', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable columns={columns} rows={rows} selectable onSelectionChange={onSelectionChange} />,
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // 1 行目 (index 0 = header)
    expect(onSelectionChange).toHaveBeenCalled()
    const arg = onSelectionChange.mock.calls.at(-1)?.[0] as Set<number>
    expect(arg.has(0)).toBe(true)
    expect(arg.size).toBe(1)
  })

  it('全選択 checkbox で全行が選択される', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable columns={columns} rows={rows} selectable onSelectionChange={onSelectionChange} />,
    )
    const allCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(allCheckbox)
    const arg = onSelectionChange.mock.calls.at(-1)?.[0] as Set<number>
    expect(arg.size).toBe(rows.length)
  })

  it('selection checkbox クリックでは onRowClick が呼ばれない (stopPropagation)', () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} rows={rows} selectable onRowClick={onRowClick} />)
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])
    expect(onRowClick).not.toHaveBeenCalled()
  })
})

describe('DataTable - key 選択 (安定キー / client モード)', () => {
  const keyProps = {
    columns,
    rows,
    selectable: true as const,
    getRowKey: (r: Row) => r.id,
  }

  it('行 checkbox クリックで onToggleRowKey(key, row) が呼ばれる', () => {
    const onToggleRowKey = vi.fn()
    render(
      <DataTable
        {...keyProps}
        selectedKeys={new Set()}
        onToggleRowKey={onToggleRowKey}
        onToggleAllKeys={vi.fn()}
      />,
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // header の次 = 1 行目 (u1)
    expect(onToggleRowKey).toHaveBeenCalledWith('u1', rows[0])
  })

  it('checked は index ではなく selectedKeys で判定され、フィルタを跨いで保持される', () => {
    render(
      <DataTable
        {...keyProps}
        selectedKeys={new Set(['u1', 'u3'])}
        onToggleRowKey={vi.fn()}
        onToggleAllKeys={vi.fn()}
      />,
    )
    let checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toBeChecked() // u1
    expect(checkboxes[2]).not.toBeChecked() // u2
    expect(checkboxes[3]).toBeChecked() // u3

    // 絞り込みで u3 だけ表示しても、key 選択なので checked が保持される (index ズレに耐える)
    fireEvent.change(screen.getByPlaceholderText('キーワードで検索'), { target: { value: '鈴木' } })
    checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2) // header + u3
    expect(checkboxes[1]).toBeChecked()
  })

  it('全選択は現フィルタ結果 (全ページ) のキーで onToggleAllKeys を呼ぶ', () => {
    const onToggleAllKeys = vi.fn()
    const { rerender } = render(
      <DataTable
        {...keyProps}
        selectedKeys={new Set()}
        onToggleRowKey={vi.fn()}
        onToggleAllKeys={onToggleAllKeys}
      />,
    )
    // フィルタ無し: 全行のキー
    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onToggleAllKeys).toHaveBeenLastCalledWith(['u1', 'u2', 'u3'])

    // 絞り込み後: フィルタ結果のキーだけ (現ページではなく絞り込み全件)
    rerender(
      <DataTable
        {...keyProps}
        selectedKeys={new Set()}
        onToggleRowKey={vi.fn()}
        onToggleAllKeys={onToggleAllKeys}
      />,
    )
    fireEvent.change(screen.getByPlaceholderText('キーワードで検索'), { target: { value: '田中' } })
    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onToggleAllKeys).toHaveBeenLastCalledWith(['u1'])
  })

  it('isRowSelectable=false の行は checkbox が disabled で、トグル/全選択対象から外れる', () => {
    const onToggleRowKey = vi.fn()
    const onToggleAllKeys = vi.fn()
    render(
      <DataTable
        {...keyProps}
        selectedKeys={new Set()}
        isRowSelectable={(r) => r.id !== 'u2'}
        onToggleRowKey={onToggleRowKey}
        onToggleAllKeys={onToggleAllKeys}
      />,
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[2]).toBeDisabled() // u2
    fireEvent.click(checkboxes[2])
    expect(onToggleRowKey).not.toHaveBeenCalled()

    // 全選択は selectable な u1 / u3 のみ (disabled の u2 を除外)
    fireEvent.click(checkboxes[0])
    expect(onToggleAllKeys).toHaveBeenLastCalledWith(['u1', 'u3'])
  })

  it('選択件数ラベルは selectedKeys.size を反映する', () => {
    render(
      <DataTable
        {...keyProps}
        selectedKeys={new Set(['u1', 'u3'])}
        onToggleRowKey={vi.fn()}
        onToggleAllKeys={vi.fn()}
      />,
    )
    expect(screen.getByText('2 件選択中')).toBeInTheDocument()
  })
})

describe('DataTable - インタラクション', () => {
  it('行クリックで onRowClick が呼ばれる (row + index)', () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} rows={rows} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0)
  })
})

describe('DataTable - rowActions default 行クリック', () => {
  it('default:true の action は行クリックで onClick が走る', () => {
    const onClick = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', default: true, onClick }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onClick).toHaveBeenCalledWith(rows[0])
  })

  it('default を持たない rowActions では行クリックで何も起きない (クリック不可)', () => {
    const onClick = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', onClick }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('明示 onRowClick は default action より優先される', () => {
    const onRowClick = vi.fn()
    const actionClick = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', default: true, onClick: actionClick }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0)
    expect(actionClick).not.toHaveBeenCalled()
  })
})

describe('DataTable - rowActions toggle', () => {
  it('active 状態で無効化/有効化を出し分け、onToggle を行付きで呼ぶ', () => {
    const onToggle = vi.fn()
    const actions: RowActionDef<Row>[] = [
      { type: 'toggle', active: (r) => r.status === 'active', onToggle },
    ]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    // active 行 (田中 / 鈴木) は「無効化」、inactive 行 (佐藤) は「有効化」。
    expect(screen.getAllByRole('button', { name: '無効化' })).toHaveLength(2)
    const enableBtn = screen.getByRole('button', { name: '有効化' })
    fireEvent.click(enableBtn)
    expect(onToggle).toHaveBeenCalledWith(rows[1])
  })

  it('toggle は行クリックの default にならない (クリック不可のまま)', () => {
    const onToggle = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'toggle', active: () => true, onToggle }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    fireEvent.click(screen.getByText('田中 太郎'))
    expect(onToggle).not.toHaveBeenCalled()
  })
})

describe('DataTable - rowActions href (リンク化)', () => {
  it('href を渡した操作ボタンは <a href> で描画する (Ctrl+クリックで別タブ)', () => {
    const actions: RowActionDef<Row>[] = [
      { type: 'edit', onClick: vi.fn(), href: (r) => `/edit/${r.id}` },
    ]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    const link = screen.getAllByRole('link', { name: '編集' })[0]
    expect(link).toHaveAttribute('href', '/edit/u1')
  })

  it('href なしの操作ボタンは従来どおり <button>', () => {
    const actions: RowActionDef<Row>[] = [{ type: 'edit', onClick: vi.fn() }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '編集' }).length).toBeGreaterThan(0)
  })

  it('href ボタンの通常クリックは preventDefault して onClick を呼ぶ', () => {
    const onClick = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', onClick, href: (r) => `/edit/${r.id}` }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    const preventDefault = vi.spyOn(event, 'preventDefault')
    screen.getAllByRole('link', { name: '編集' })[0].dispatchEvent(event)
    expect(preventDefault).toHaveBeenCalled()
    expect(onClick).toHaveBeenCalledWith(rows[0])
  })

  it('href ボタンの Ctrl+クリックは素通しし onClick を呼ばない', () => {
    const onClick = vi.fn()
    const actions: RowActionDef<Row>[] = [{ type: 'edit', onClick, href: (r) => `/edit/${r.id}` }]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      ctrlKey: true,
    })
    const preventDefault = vi.spyOn(event, 'preventDefault')
    screen.getAllByRole('link', { name: '編集' })[0].dispatchEvent(event)
    expect(preventDefault).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('href 付き操作ボタンにも aria-label が付く', () => {
    const actions: RowActionDef<Row>[] = [
      { type: 'detail', onClick: vi.fn(), href: (r) => `/detail/${r.id}` },
    ]
    render(<DataTable columns={columns} rows={rows} rowActions={actions} />)
    expect(screen.getAllByRole('link', { name: '詳細を見る' })[0]).toBeInTheDocument()
  })
})

describe('DataTable - 外部上書き prop', () => {
  it('tableClassName が <table> に適用される', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} tableClassName="my-table" />,
    )
    expect(container.querySelector('table.my-table')).not.toBeNull()
  })

  it('rowClassName (string) が <tr> に適用される', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} rowClassName="my-row" />)
    const trs = container.querySelectorAll('tbody tr.my-row')
    expect(trs).toHaveLength(rows.length)
  })

  it('rowClassName (関数) が row + index で評価される', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} rowClassName={(row) => `row-${row.id}`} />,
    )
    expect(container.querySelector('tr.row-u1')).not.toBeNull()
    expect(container.querySelector('tr.row-u3')).not.toBeNull()
  })

  it('column.cellClassName が該当列の <td> に適用される', () => {
    const cols: Column<Row>[] = [
      { key: 'name', label: '氏名' },
      { key: 'score', label: 'スコア', cellClassName: 'tabular-nums' },
    ]
    const { container } = render(<DataTable columns={cols} rows={rows} />)
    const scoreCells = container.querySelectorAll('tbody td.tabular-nums')
    expect(scoreCells).toHaveLength(rows.length)
  })

  it('column.align="right" で右寄せ class が適用される', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />)
    // score column は align: 'right' なので、各行の 3 列目 <td> に align class が付く
    const cells = container.querySelectorAll('tbody tr td:nth-child(3)')
    expect(cells[0].className).toMatch(/alignRight/)
  })
})

describe('DataTable - 型 (discriminated union)', () => {
  it('mode="server" で getRowKey が型レベル required (省略すると ts-error)', () => {
    // @ts-expect-error: mode='server' は getRowKey 必須
    const _props = <DataTable mode="server" columns={columns} rows={rows} />
    expect(_props).toBeTruthy()
  })

  it('key 選択 (selectedKeys) は server モードでは型エラー (client 限定)', () => {
    const _props = (
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        // @ts-expect-error: selectedKeys は client モード限定 (server では never)
        selectedKeys={new Set(['u1'])}
      />
    )
    expect(_props).toBeTruthy()
  })
})

describe('DataTable - mode="server" toolbar (検索 / フィルタ / ページャ / 件数 / actions)', () => {
  it('search を渡すと検索 box が出て、入力で onChange が呼ばれる', () => {
    const onChange = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange, placeholder: '氏名で検索' }}
      />,
    )
    const search = screen.getByPlaceholderText('氏名で検索')
    fireEvent.change(search, { target: { value: '田中' } })
    expect(onChange).toHaveBeenCalledWith('田中')
  })

  it('search.onSubmit があると Enter で onSubmit が呼ばれる', () => {
    const onSubmit = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: 'x', onChange: vi.fn(), onSubmit, placeholder: '検索' }}
      />,
    )
    fireEvent.keyDown(screen.getByPlaceholderText('検索'), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalled()
  })

  it('filters を渡すと select が出て、件数表示は totalCount を使う', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        filters={[
          {
            key: 'status',
            label: 'ステータス',
            value: null,
            onChange: vi.fn(),
            options: [
              { value: 'active', label: '有効' },
              { value: 'inactive', label: '無効' },
            ],
          },
        ]}
        totalCount={42}
      />,
    )
    expect(screen.getByText('42 件')).toBeInTheDocument()
  })

  it('pagination を渡すと controlled ページャ (molecule Pagination) が出て、次へで onPageChange(2)', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pagination={{ currentPage: 1, totalPages: 3, onPageChange }}
      />,
    )
    // molecule Pagination は role=button + aria-label="N ページ目" / "前へ" / "次へ"
    fireEvent.click(screen.getByRole('button', { name: '次へ' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('pagination の totalPages<=1 ではページャを描画しない (molecule の仕様)', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pagination={{ currentPage: 1, totalPages: 1, onPageChange: vi.fn() }}
      />,
    )
    expect(screen.queryByRole('navigation', { name: 'ページネーション' })).toBeNull()
  })

  it('toolbar 系 prop を渡さなくても列ピッカー (gear) が既定で出る', () => {
    render(<DataTable mode="server" columns={columns} rows={rows} getRowKey={(r) => r.id} />)
    expect(screen.queryByRole('searchbox')).toBeNull()
    // 列が 2 つ以上あれば uncontrolled でも gear が既定表示される
    expect(screen.getByRole('button', { name: '表示する列を切り替える' })).toBeInTheDocument()
  })

  it('disableColumnPicker / 単一列なら toolbar 系を出さなければ何も描画しない', () => {
    const { rerender } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        disableColumnPicker
      />,
    )
    expect(screen.queryByRole('button', { name: '表示する列を切り替える' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()

    // 単一列なら disableColumnPicker 無しでも gear は出ない
    rerender(
      <DataTable
        mode="server"
        columns={[{ key: 'name', label: '氏名' }]}
        rows={rows}
        getRowKey={(r) => r.id}
      />,
    )
    expect(screen.queryByRole('button', { name: '表示する列を切り替える' })).toBeNull()
  })

  it('uncontrolled: gear から列を非表示にできる (localStorage 永続化)', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        columnStorageKey="test-uncontrolled"
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'ステータス' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '表示する列を切り替える' }))
    const statusLabel = screen
      .getAllByText('ステータス')
      .find((el) => el.closest('label') !== null)
      ?.closest('label') as HTMLElement
    fireEvent.click(within(statusLabel).getByRole('checkbox'))
    // 非表示になり thead から消える
    expect(screen.queryByRole('columnheader', { name: 'ステータス' })).toBeNull()
    // localStorage に保存される
    const stored = window.localStorage.getItem('datatable:cols:test-uncontrolled')
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored as string)).not.toContain('status')
  })

  it('actions を渡すと toolbar 右端に描画される', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        totalCount={3}
        actions={<button type="button">新規作成</button>}
      />,
    )
    expect(screen.getByRole('button', { name: '新規作成' })).toBeInTheDocument()
  })

  it('onCreate を渡すと gear の並びに ＋ ボタンが出てクリックで発火する', () => {
    const onCreate = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onCreate={onCreate}
        createLabel="ユーザーを追加"
      />,
    )
    const createButton = screen.getByRole('button', { name: 'ユーザーを追加' })
    expect(createButton).toBeInTheDocument()
    fireEvent.click(createButton)
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('createHref を渡すと ＋ ボタンが <a href> になり、通常クリックで onCreate が走る', () => {
    const onCreate = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onCreate={onCreate}
        createHref="/users/new"
        createLabel="ユーザーを追加"
      />,
    )
    const link = screen.getByRole('link', { name: 'ユーザーを追加' })
    expect(link).toHaveAttribute('href', '/users/new')
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    const preventDefault = vi.spyOn(event, 'preventDefault')
    link.dispatchEvent(event)
    expect(preventDefault).toHaveBeenCalled()
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('uncontrolled + onReset: リセットで localStorage の列状態も既定へ戻す', () => {
    // 事前に status 列を隠した状態を localStorage に作る (id は含めず name/score のみ表示)
    window.localStorage.setItem('datatable:cols:test-reset-cols', JSON.stringify(['name', 'score']))
    render(
      <DataTable
        mode="client"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        columnStorageKey="test-reset-cols"
        onReset={vi.fn()}
      />,
    )
    // status 列は隠れている
    expect(screen.queryByRole('columnheader', { name: 'ステータス' })).toBeNull()
    // ツールバーのリセット → 列状態も既定化 (保存値クリア + 列が戻る)
    fireEvent.click(screen.getByRole('button', { name: 'フィルタをリセット' }))
    expect(window.localStorage.getItem('datatable:cols:test-reset-cols')).toBeNull()
    expect(screen.getByRole('columnheader', { name: 'ステータス' })).toBeInTheDocument()
  })
})

describe('DataTable - mode="client" actions', () => {
  it('actions を渡すと内蔵検索と一緒に右端ボタンが出る', () => {
    render(
      <DataTable columns={columns} rows={rows} actions={<button type="button">新規作成</button>} />,
    )
    expect(screen.getByPlaceholderText('キーワードで検索')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新規作成' })).toBeInTheDocument()
  })

  it('onCreate だけ渡しても toolbar が出て ＋ ボタン (既定ラベル 新規作成) が描画される', () => {
    const onCreate = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={rows}
        showSearch={false}
        disableColumnPicker
        onCreate={onCreate}
      />,
    )
    const createButton = screen.getByRole('button', { name: '新規作成' })
    fireEvent.click(createButton)
    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})

describe('DataTable - bordered / striped (両モード)', () => {
  it('bordered=true で <table> に tableBordered class が付く (client モード)', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} bordered />)
    const table = container.querySelector('table')
    expect(table?.className).toMatch(/tableBordered/)
  })

  it('striped=true で <table> に tableStriped class が付く (client モード)', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} striped />)
    const table = container.querySelector('table')
    expect(table?.className).toMatch(/tableStriped/)
  })

  it('bordered=true で <table> に tableBordered class が付く (server モード)', () => {
    const { container } = render(
      <DataTable mode="server" columns={columns} rows={rows} getRowKey={(r) => r.id} bordered />,
    )
    const table = container.querySelector('table')
    expect(table?.className).toMatch(/tableBordered/)
  })

  it('striped=true で <table> に tableStriped class が付く (server モード)', () => {
    const { container } = render(
      <DataTable mode="server" columns={columns} rows={rows} getRowKey={(r) => r.id} striped />,
    )
    const table = container.querySelector('table')
    expect(table?.className).toMatch(/tableStriped/)
  })

  it('default (bordered/striped 未指定) では両 variant class が付く', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />)
    const table = container.querySelector('table')
    expect(table?.className).toMatch(/tableBordered/)
    expect(table?.className).toMatch(/tableStriped/)
  })

  it('bordered=false / striped=false で明示的に opt-out できる', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} bordered={false} striped={false} />,
    )
    const table = container.querySelector('table')
    expect(table?.className).not.toMatch(/tableBordered/)
    expect(table?.className).not.toMatch(/tableStriped/)
  })
})

describe('DataTable - server モード showSearch / showFilters', () => {
  const search = { value: '', onChange: vi.fn() }
  const filters = [
    {
      key: 'status',
      label: 'ステータス',
      options: [{ value: 'active', label: '有効' }],
      value: null,
      onChange: vi.fn(),
    },
  ]

  it('default (showSearch 未指定) で search prop が渡れば検索 box が出る', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={search}
      />,
    )
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('showSearch=false で search prop が渡っても検索 box が出ない', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={search}
        showSearch={false}
      />,
    )
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('default (showFilters 未指定) で filters prop が渡ればフィルタ select が出る', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        filters={filters}
      />,
    )
    expect(container.querySelector('[data-component="select"]')).toBeInTheDocument()
  })

  it('showFilters=false で filters prop が渡ってもフィルタ select が出ない', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        filters={filters}
        showFilters={false}
      />,
    )
    expect(container.querySelector('[data-component="select"]')).toBeNull()
  })
})

describe('DataTable - collapsible (funnel + チップ要約 / 件数・リセット常時表示)', () => {
  it('collapsible=true で funnel アイコンの toggle ボタンが出る', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible
      />,
    )
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toBeInTheDocument()
  })

  it('collapsible=true で内部 Toggleable が描画される (data-component="toggleable")', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible
      />,
    )
    expect(container.querySelector('[data-component="toggleable"]')).toBeInTheDocument()
  })

  it('collapsible=true (defaultOpen=true) では filter row が開いて search が見える', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible
      />,
    )
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('collapsible={{ defaultOpen: false }} で aria-expanded が false', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible={{ defaultOpen: false }}
      />,
    )
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('defaultCollapsed=true (旧 API) で aria-expanded が false (互換)', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible
        defaultCollapsed
      />,
    )
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('defaultCollapsed=true でも collapsible.defaultOpen=true が優先される', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible={{ defaultOpen: true }}
        defaultCollapsed
      />,
    )
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('actions は Toggleable の外で render される (collapsed でも見える)', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        collapsible={{ defaultOpen: false }}
        actions={<button type="button">新規作成</button>}
      />,
    )
    const toggleable = container.querySelector('[data-component="toggleable"]')
    const actionButton = screen.getByRole('button', { name: '新規作成' })
    expect(toggleable).toBeInTheDocument()
    expect(toggleable?.contains(actionButton)).toBe(false)
    expect(actionButton).toBeInTheDocument()
  })

  it('collapsible 未指定では funnel ボタンも Toggleable も出ない', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
      />,
    )
    expect(container.querySelector('[data-component="toggleable"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'フィルタを切り替える' })).toBeNull()
  })

  it('active な search / filter がないときはチップも funnel バッジも出ない', () => {
    const { container } = render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        filters={[{ key: 'status', label: '状態', value: null, onChange: vi.fn(), options: [] }]}
        collapsible
      />,
    )
    // funnel ボタンは icon のみで数値テキストを持たない (バッジ廃止)
    const toggleBtn = screen.getByRole('button', { name: 'フィルタを切り替える' })
    expect(toggleBtn.textContent?.trim()).toBe('')
    expect(container.querySelector('[class*="filterBadge"]')).toBeNull()
    expect(container.querySelector('[class*="filterChip"]')).toBeNull()
  })

  it('適用中フィルタを「ラベル: 選択肢」のチップで要約表示する', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        filters={[
          {
            key: 'dept',
            label: '部署',
            value: '2',
            onChange: vi.fn(),
            options: [
              { value: '1', label: '管理部' },
              { value: '2', label: '営業部' },
            ],
          },
        ]}
        collapsible
      />,
    )
    expect(screen.getByText('部署: 営業部')).toBeInTheDocument()
  })

  it('search.value が非空のとき検索チップが出る (funnel に数値バッジは出ない)', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: 'foo', onChange: vi.fn() }}
        collapsible
      />,
    )
    expect(screen.getByText('検索: "foo"')).toBeInTheDocument()
    const toggleBtn = screen.getByRole('button', { name: 'フィルタを切り替える' })
    expect(toggleBtn.textContent?.trim()).toBe('')
  })

  it('search.value が空白のみのときはチップを出さない', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '   ', onChange: vi.fn() }}
        collapsible
      />,
    )
    expect(screen.queryByText(/検索:/)).toBeNull()
  })

  it('複数の適用中フィルタを複数チップで表示する', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: 'foo', onChange: vi.fn() }}
        filters={[
          { key: 'status', label: '状態', value: 'OK', onChange: vi.fn(), options: [] },
          { key: 'role', label: '権限', value: 'admin', onChange: vi.fn(), options: [] },
        ]}
        collapsible
      />,
    )
    expect(screen.getByText('検索: "foo"')).toBeInTheDocument()
    // options 不一致 (空 options) のときは生値でフォールバック表示
    expect(screen.getByText('状態: OK')).toBeInTheDocument()
    expect(screen.getByText('権限: admin')).toBeInTheDocument()
  })

  it('チップの × で該当 filter の onChange(null) が呼ばれる', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        filters={[
          {
            key: 'dept',
            label: '部署',
            value: '2',
            onChange,
            options: [{ value: '2', label: '営業部' }],
          },
        ]}
        collapsible
      />,
    )
    await user.click(screen.getByRole('button', { name: '部署: 営業部 を解除' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('検索チップの × で search.onChange("") が呼ばれる', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: 'foo', onChange }}
        collapsible
      />,
    )
    await user.click(screen.getByRole('button', { name: '検索: "foo" を解除' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('最小化 (defaultOpen=false) でも件数とリセットが常時表示される / 入力は隠れる', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        totalCount={42}
        onReset={vi.fn()}
        collapsible={{ defaultOpen: false }}
      />,
    )
    // 件数・リセットは常時表示 (Toggleable の外)
    expect(screen.getByText('42 件')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'フィルタをリセット' })).toBeInTheDocument()
    // 検索入力は折りたたまれている (aria-expanded=false)
    expect(screen.getByRole('button', { name: 'フィルタを切り替える' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('リセットは適用中フィルタが無くても常時表示される', () => {
    render(
      <DataTable
        mode="server"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        search={{ value: '', onChange: vi.fn() }}
        onReset={vi.fn()}
        collapsible
      />,
    )
    expect(screen.getByRole('button', { name: 'フィルタをリセット' })).toBeInTheDocument()
  })
})

describe('DataTable - animated モード', () => {
  it('animated でもヘッダと行を描画する', () => {
    render(<DataTable columns={columns} rows={rows} animated />)
    expect(screen.getByText('氏名')).toBeInTheDocument()
    expect(screen.getByText('田中 太郎')).toBeInTheDocument()
    expect(screen.getByText('鈴木 一郎')).toBeInTheDocument()
  })

  it('animated + variant 指定でも値を描画する', () => {
    render(<DataTable columns={columns} rows={rows} animated animationVariant="slideLeft" />)
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
  })

  it('animated でも rows 0 件は emptyMessage を表示する', () => {
    render(<DataTable columns={columns} rows={[]} animated emptyMessage="該当なし" />)
    expect(screen.getByText('該当なし')).toBeInTheDocument()
  })

  it('animated で visibleColumns を絞ると非表示列はヘッダに出ない', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        animated
        visibleColumns={['name', 'status']}
        onColumnsChange={vi.fn()}
      />,
    )
    expect(screen.getByText('氏名')).toBeInTheDocument()
    expect(screen.queryByText('スコア')).toBeNull()
  })
})

describe('DataTable - 非表示列はソートからも外れる', () => {
  const sortableCols: Column<Row>[] = [
    { key: 'name', label: '氏名', sortable: true },
    { key: 'score', label: 'スコア', sortable: true, align: 'right' },
  ]

  it('client: 多列ソート中に列を隠すと、その列がソートから外れ順位が繰り上がる', () => {
    const { rerender } = render(
      <DataTable
        columns={sortableCols}
        rows={rows}
        visibleColumns={['name', 'score']}
        onColumnsChange={vi.fn()}
      />,
    )
    // score → name の順でクリックして 2 列ソート (score=①, name=②)
    fireEvent.click(screen.getByText('スコア').closest('th')!)
    fireEvent.click(screen.getByText('氏名').closest('th')!)
    expect(screen.getByText('氏名').closest('th')!.textContent).toContain('②')

    // score を非表示にすると sort からも外れ、残った name の順位バッジは消える (1 列のみ)
    rerender(
      <DataTable
        columns={sortableCols}
        rows={rows}
        visibleColumns={['name']}
        onColumnsChange={vi.fn()}
      />,
    )
    const nameTh = screen.getByText('氏名').closest('th')!
    expect(nameTh.textContent).not.toContain('②')
    expect(nameTh.textContent).not.toContain('①')
    expect(screen.queryByText('スコア')).toBeNull()
  })

  it('server: 非表示列は onSortItemsChange で sort から除外される', () => {
    const onSortItemsChange = vi.fn()
    render(
      <DataTable
        mode="server"
        columns={sortableCols}
        rows={rows}
        getRowKey={(r) => r.id}
        visibleColumns={['name']}
        onColumnsChange={vi.fn()}
        sort={{
          items: [
            { columnKey: 'name', order: 'asc' },
            { columnKey: 'score', order: 'desc' },
          ],
          onSortClick: vi.fn(),
          onSortItemsChange,
        }}
      />,
    )
    // score は非表示なので sort から除外され、name だけ残る
    expect(onSortItemsChange).toHaveBeenCalledWith([{ columnKey: 'name', order: 'asc' }])
  })
})
