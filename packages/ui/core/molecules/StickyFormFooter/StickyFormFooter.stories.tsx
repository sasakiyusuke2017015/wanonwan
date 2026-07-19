import type { Meta, StoryObj } from '@storybook/react'
import { StickyFormFooter } from './StickyFormFooter'
import { Button } from '../Button'

type Story = StoryObj<typeof StickyFormFooter>

/**
 * 画面下部に固定するフォームのアクションバー。
 * 左に保存状態、右にキャンセル/保存ボタンを並べる。
 */
const meta: Meta<typeof StickyFormFooter> = {
  title: 'フィードバック/StickyFormFooter',
  component: StickyFormFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

export default meta

export const Default: Story = {
  render: () => (
    <div style={{ height: 200 }}>
      <StickyFormFooter status="すべての変更は保存済みです">
        <Button variant="outline">キャンセル</Button>
        <Button variant="primary" leftIcon="check">
          変更を保存
        </Button>
      </StickyFormFooter>
    </div>
  ),
}

export const WithoutStatus: Story = {
  render: () => (
    <div style={{ height: 200 }}>
      <StickyFormFooter>
        <Button variant="outline">キャンセル</Button>
        <Button variant="primary">ユーザーを作成</Button>
      </StickyFormFooter>
    </div>
  ),
}
