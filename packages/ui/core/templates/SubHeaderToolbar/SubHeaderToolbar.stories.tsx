import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { DataCountDisplay } from '../../molecules/DataCountDisplay'
import type { FilterDef } from '../../organisms/DataTable/types'
import { SubHeader } from '../SubHeader'

import { SubHeaderToolbar } from './SubHeaderToolbar'

const meta: Meta<typeof SubHeaderToolbar> = {
  title: 'テンプレート/SubHeaderToolbar',
  component: SubHeaderToolbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj<typeof SubHeaderToolbar>

/** SubHeader (fixed バー) に載せた実運用形。funnel で検索 + filter が展開する。 */
export const Default: Story = {
  render: function DefaultStory() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | null>(null)
    const filters: FilterDef[] = [
      {
        key: 'status',
        label: '状態',
        value: status,
        onChange: setStatus,
        options: [
          { value: 'active', label: '有効' },
          { value: 'inactive', label: '無効' },
        ],
      },
    ]
    return (
      <div style={{ minHeight: 240 }}>
        <SubHeader topOffset={0}>
          <SubHeaderToolbar
            title="ユーザー管理"
            search={{ value: search, onChange: setSearch }}
            filters={filters}
            rowCountLabel={<DataCountDisplay totalCount={42} />}
            onCreate={() => {}}
            createLabel="ユーザーを追加"
            onReset={() => {
              setSearch('')
              setStatus(null)
            }}
          />
        </SubHeader>
        <div style={{ padding: '96px 16px 16px' }}>
          <p style={{ fontSize: 14, color: '#666' }}>
            本文領域 (テーブル等)。funnel の開閉で SubHeader の高さが変わる。
          </p>
        </div>
      </div>
    )
  },
}

/** 初期展開 (defaultOpen)。フィルタを主役にする画面向け。 */
export const DefaultOpen: Story = {
  render: function DefaultOpenStory() {
    const [search, setSearch] = useState('')
    return (
      <div style={{ minHeight: 200 }}>
        <SubHeader topOffset={0}>
          <SubHeaderToolbar
            title="回答一覧"
            defaultOpen
            search={{ value: search, onChange: setSearch }}
            rowCountLabel={<DataCountDisplay totalCount={128} />}
          />
        </SubHeader>
      </div>
    )
  },
}
