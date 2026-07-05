import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'

import { Badge } from '../../atoms/Badge'

import { DataTable } from './DataTable'
import type { Column, FilterDef } from './types'

interface UserRow {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  score: number
  date: string
}

const users: UserRow[] = [
  { id: 'u1', name: '田中 太郎', status: 'active', score: 4.5, date: '2024-01-15' },
  { id: 'u2', name: '佐藤 花子', status: 'inactive', score: 3.2, date: '2024-02-20' },
  { id: 'u3', name: '鈴木 一郎', status: 'active', score: 5.0, date: '2024-03-01' },
  { id: 'u4', name: '高橋 美咲', status: 'pending', score: 2.8, date: '2024-03-10' },
  { id: 'u5', name: '伊藤 健太', status: 'active', score: 4.1, date: '2024-03-15' },
]

const basicColumns: Column<UserRow>[] = [
  { key: 'name', label: '氏名', sortable: true },
  { key: 'status', label: 'ステータス', sortable: true },
  { key: 'score', label: 'スコア', align: 'right', sortable: true },
  { key: 'date', label: '日付', sortable: true },
]

const meta: Meta<typeof DataTable> = {
  title: 'データ表示/テーブル/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

export const ClientDefault: Story = {
  name: 'Client モード (default)',
  render: () => <DataTable<UserRow> columns={basicColumns} rows={users} />,
}

export const Selectable: Story = {
  name: 'Client + 行選択',
  render: () => <DataTable<UserRow> columns={basicColumns} rows={users} selectable />,
}

export const KeySelection: Story = {
  name: 'Client + 安定キー選択 (絞り込み→全選択→保持)',
  render: function KeySelectionStory() {
    // selectedKeys は user_id の集合。ページ送り / 絞り込み / ソートを跨いで保持される。
    // pending を「ロック (選択不可)」として disabled checkbox にする例。
    const [selected, setSelected] = useState<Set<string | number>>(new Set(['u1']))
    const toggleOne = (key: string | number) =>
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    const toggleAll = (keys: Array<string | number>) =>
      setSelected((prev) => {
        const allSelected = keys.length > 0 && keys.every((k) => prev.has(k))
        const next = new Set(prev)
        if (allSelected) keys.forEach((k) => next.delete(k))
        else keys.forEach((k) => next.add(k))
        return next
      })
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">{selected.size} 件選択中</p>
        <DataTable<UserRow>
          columns={basicColumns}
          rows={users}
          selectable
          getRowKey={(r) => r.id}
          selectedKeys={selected}
          onToggleRowKey={(key) => toggleOne(key)}
          onToggleAllKeys={toggleAll}
          isRowSelectable={(r) => r.status !== 'pending'}
        />
      </div>
    )
  },
}

export const WithColumnPicker: Story = {
  name: 'Client + Column Picker',
  render: () => {
    return (
      <DataTable<UserRow>
        columns={basicColumns}
        rows={users}
        visibleColumns={['name', 'status', 'score', 'date']}
        onColumnsChange={() => {
          /* noop in story */
        }}
      />
    )
  },
}

export const Animated: Story = {
  name: 'Animated (行/列の表示・非表示)',
  render: function AnimatedStory() {
    const [visible, setVisible] = useState<string[]>(['name', 'status', 'score', 'date'])
    const [rowCount, setRowCount] = useState(users.length)
    const [variant, setVariant] = useState<'slideDown' | 'fadeIn' | 'slideLeft'>('slideDown')

    const toggleScore = () =>
      setVisible((prev) =>
        prev.includes('score') ? prev.filter((k) => k !== 'score') : [...prev, 'score'],
      )

    const btn: React.CSSProperties = {
      fontSize: 12,
      padding: '4px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5e1',
      background: '#fff',
      cursor: 'pointer',
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={btn} onClick={toggleScore}>
            列「スコア」を {visible.includes('score') ? '隠す' : '表示'}
          </button>
          <button style={btn} onClick={() => setRowCount((n) => Math.min(users.length, n + 1))}>
            行を追加
          </button>
          <button style={btn} onClick={() => setRowCount((n) => Math.max(0, n - 1))}>
            行を削除
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>variant:</span>
          {(['slideDown', 'fadeIn', 'slideLeft'] as const).map((v) => (
            <button
              key={v}
              style={{ ...btn, background: variant === v ? '#e0e7ff' : '#fff' }}
              onClick={() => setVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <DataTable<UserRow>
          columns={basicColumns}
          rows={users.slice(0, rowCount)}
          animated
          animationVariant={variant}
          visibleColumns={visible}
          onColumnsChange={setVisible}
          showSearch={false}
          showPagination={false}
        />
      </div>
    )
  },
}

const STATUS_TONE: Record<UserRow['status'], 'success' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
}

const STATUS_LABEL: Record<UserRow['status'], string> = {
  active: '有効',
  inactive: '無効',
  pending: '保留',
}

const reactNodeColumns: Column<UserRow>[] = [
  { key: 'name', label: '氏名' },
  {
    key: 'status',
    label: 'ステータス',
    align: 'center',
    render: (row) => (
      <Badge tone={STATUS_TONE[row.status]} size="small">
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  },
  {
    key: 'score',
    label: 'スコア',
    align: 'right',
    cellClassName: 'tabular-nums',
  },
  {
    key: 'date',
    label: '日付',
    render: (row) => (
      <a href={`#/users/${row.id}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>
        {row.date}
      </a>
    ),
  },
]

export const WithReactNodeCells: Story = {
  name: 'render で ReactNode セル (Badge / Link)',
  render: () => <DataTable<UserRow> columns={reactNodeColumns} rows={users} />,
}

export const ServerMode: Story = {
  name: 'Server モード (表示専用)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
        server-side pagination / フィルタ前提。検索・ページネーション・列ピッカは出ない。
        getRowKey は型レベル required。
      </p>
      <DataTable<UserRow>
        mode="server"
        columns={reactNodeColumns}
        rows={users}
        getRowKey={(row) => row.id}
      />
    </div>
  ),
}

const STATUS_FILTER_OPTIONS = [
  { value: 'active', label: '有効' },
  { value: 'inactive', label: '無効' },
  { value: 'pending', label: '保留' },
]

export const ServerWithToolbar: Story = {
  name: 'Server + toolbar (検索 / フィルタ / ページャ / 件数 / actions)',
  render: () => {
    // server モードは「定義を渡して UI 生成は DataTable、絞り込みは呼び出し側」。
    // story では state で疑似的に絞り込み + ページングを再現する。
    const ServerToolbarDemo = () => {
      const [q, setQ] = useState('')
      const [status, setStatus] = useState<string | null>(null)
      const [page, setPage] = useState(1)
      const pageSize = 3

      const filtered = useMemo(() => {
        return users.filter((u) => {
          if (q && !u.name.includes(q)) return false
          if (status && u.status !== status) return false
          return true
        })
      }, [q, status])

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
      const safePage = Math.min(page, totalPages)
      const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

      const filters: FilterDef[] = [
        {
          key: 'status',
          label: 'ステータス',
          options: STATUS_FILTER_OPTIONS,
          value: status,
          onChange: (v) => {
            setStatus(v)
            setPage(1)
          },
        },
      ]

      return (
        <DataTable<UserRow>
          mode="server"
          columns={reactNodeColumns}
          rows={pageRows}
          getRowKey={(row) => row.id}
          search={{
            value: q,
            onChange: (v) => {
              setQ(v)
              setPage(1)
            },
            placeholder: '氏名で検索',
          }}
          filters={filters}
          pagination={{ currentPage: safePage, totalPages, onPageChange: setPage }}
          totalCount={filtered.length}
          actions={
            <button
              type="button"
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #2563eb',
                color: '#2563eb',
              }}
            >
              + 新規
            </button>
          }
        />
      )
    }
    return <ServerToolbarDemo />
  },
}

export const ClientWithActions: Story = {
  name: 'Client + actions (内蔵検索 + 右端ボタン)',
  render: () => (
    <DataTable<UserRow>
      columns={reactNodeColumns}
      rows={users}
      actions={
        <button
          type="button"
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #2563eb',
            color: '#2563eb',
          }}
        >
          + 新規
        </button>
      }
    />
  ),
}

export const WithResetAndCollapse: Story = {
  name: 'Server + toolbar + リセット / 最小化 (funnel アイコン)',
  render: () => {
    // リセット (onReset) と最小化 (collapsible) を併用する例。
    // collapsible: true で Toolbar 左端に funnel アイコンボタンが出て検索/フィルタ入力を開閉する。
    // 最小化しても、適用中フィルタのチップ要約・件数・リセットは常時表示される。
    const ResetAndCollapseDemo = () => {
      const [q, setQ] = useState('')
      const [status, setStatus] = useState<string | null>(null)
      const [page, setPage] = useState(1)
      const pageSize = 3

      const filtered = useMemo(() => {
        return users.filter((u) => {
          if (q && !u.name.includes(q)) return false
          if (status && u.status !== status) return false
          return true
        })
      }, [q, status])

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
      const safePage = Math.min(page, totalPages)
      const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

      const filters: FilterDef[] = [
        {
          key: 'status',
          label: 'ステータス',
          options: STATUS_FILTER_OPTIONS,
          value: status,
          onChange: (v) => {
            setStatus(v)
            setPage(1)
          },
        },
      ]

      const handleReset = () => {
        setQ('')
        setStatus(null)
        setPage(1)
      }

      return (
        <DataTable<UserRow>
          mode="server"
          columns={reactNodeColumns}
          rows={pageRows}
          getRowKey={(row) => row.id}
          search={{
            value: q,
            onChange: (v) => {
              setQ(v)
              setPage(1)
            },
            placeholder: '氏名で検索',
          }}
          filters={filters}
          pagination={{ currentPage: safePage, totalPages, onPageChange: setPage }}
          totalCount={filtered.length}
          onReset={handleReset}
          collapsible
        />
      )
    }
    return <ResetAndCollapseDemo />
  },
}

export const WithRowActions: Story = {
  name: 'rowActions: アイコン操作列 (detail / edit / duplicate / delete)',
  render: () => (
    <DataTable<UserRow>
      columns={basicColumns}
      rows={users}
      rowActions={[
        { type: 'detail', onClick: (row) => alert(`詳細: ${row.name}`) },
        { type: 'edit', onClick: (row) => alert(`編集: ${row.name}`) },
        { type: 'duplicate', onClick: (row) => alert(`複製: ${row.name}`) },
        { type: 'delete', onDelete: (row) => alert(`削除: ${row.name}`) },
      ]}
    />
  ),
}

export const Bordered: Story = {
  name: 'Appearance: bordered (列間の縦罫線)',
  render: () => <DataTable<UserRow> columns={basicColumns} rows={users} bordered />,
}

export const Striped: Story = {
  name: 'Appearance: striped (偶数行 zebra)',
  render: () => <DataTable<UserRow> columns={basicColumns} rows={users} striped />,
}

export const Grid: Story = {
  name: 'Appearance: grid (bordered + striped)',
  render: () => <DataTable<UserRow> columns={basicColumns} rows={users} bordered striped />,
}

export const ServerModeWithShowSearchFalse: Story = {
  name: 'Server + showSearch=false (検索 prop を渡しても非表示)',
  render: () => {
    function ShowSearchFalseDemo() {
      const [q, setQ] = useState('')
      return (
        <DataTable<UserRow>
          mode="server"
          columns={basicColumns}
          rows={users}
          getRowKey={(row) => row.id}
          search={{ value: q, onChange: setQ, placeholder: '検索...' }}
          showSearch={false}
          totalCount={users.length}
        />
      )
    }
    return <ShowSearchFalseDemo />
  },
}

export const WithCollapsibleAndChips: Story = {
  name: 'Collapsible: 最小化でも適用中フィルタをチップ要約 + 件数 / リセット常時表示',
  render: () => {
    function ChipSummaryDemo() {
      // 初期で検索 + ステータスフィルタが入っており、最小化 (defaultOpen=false) でも
      // 「検索: "田中"」「ステータス: 有効」チップ + 件数 + リセットが常時見える。
      // funnel ボタンを押すと検索 / フィルタ入力を開閉できる。チップの × で個別解除。
      const [q, setQ] = useState('田中')
      const [status, setStatus] = useState<string | null>('active')

      const filters: FilterDef[] = [
        {
          key: 'status',
          label: 'ステータス',
          options: STATUS_FILTER_OPTIONS,
          value: status,
          onChange: setStatus,
        },
      ]

      const handleReset = () => {
        setQ('')
        setStatus(null)
      }

      return (
        <DataTable<UserRow>
          mode="server"
          columns={basicColumns}
          rows={users}
          getRowKey={(row) => row.id}
          search={{ value: q, onChange: setQ, placeholder: '氏名で検索' }}
          filters={filters}
          totalCount={users.length}
          onReset={handleReset}
          collapsible={{ defaultOpen: false }}
          actions={<button type="button">新規作成</button>}
        />
      )
    }
    return <ChipSummaryDemo />
  },
}
