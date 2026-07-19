import type { Meta, StoryObj } from '@storybook/react'

import { DangerZone } from './DangerZone'

const meta: Meta<typeof DangerZone> = {
  title: 'フィードバック/通知/DangerZone',
  component: DangerZone,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DangerZone>

export const Default: Story = {
  render: () => (
    <DangerZone>
      <DangerZone.Item
        icon="eye-slashed"
        title="非公開（下書き）に戻す"
        description="受講者から見えなくなります。内容は保持され、再公開できます。"
        actionLabel="非公開にする"
        actionIcon="eye-slashed"
        onAction={() => {}}
      />
      <DangerZone.Item
        icon="trash"
        title="コースの削除"
        description="コースを完全に削除します。この操作は元に戻せません。"
        actionLabel="削除する"
        actionIcon="trash"
        onAction={() => {}}
      />
    </DangerZone>
  ),
}

export const DisabledWithReason: Story = {
  render: () => (
    <DangerZone>
      <DangerZone.Item
        icon="trash"
        title="試験の削除"
        description="試験を完全に削除します。この操作は元に戻せません。"
        actionLabel="削除する"
        actionIcon="trash"
        onAction={() => {}}
        disabled
        disabledReason="下書きに戻すと削除できます"
      />
    </DangerZone>
  ),
}

export const SuccessTone: Story = {
  render: () => (
    <DangerZone>
      <DangerZone.Item
        icon="check-circle"
        tone="success"
        title="アカウントの有効化"
        description="ログインと受講を再開できるようにし、同時に新しいパスワードを発行します。"
        actionLabel="有効化する"
        actionVariant="success"
        actionIcon="check"
        onAction={() => {}}
      />
      <DangerZone.Item
        icon="ban"
        title="アカウントの無効化"
        description="ログインと受講を停止します。データは保持され、後から有効化できます。"
        actionLabel="アカウントを無効化"
        actionIcon="ban"
        onAction={() => {}}
      />
    </DangerZone>
  ),
}
