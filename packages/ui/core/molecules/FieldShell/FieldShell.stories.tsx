import type { Meta, StoryObj } from '@storybook/react'

import { FieldShell } from './FieldShell'

const meta: Meta<typeof FieldShell> = {
  title: 'Molecules/FieldShell',
  component: FieldShell,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof FieldShell>

const demoInput = ({
  id,
  describedBy,
  invalid,
}: {
  id: string
  describedBy: string | undefined
  invalid: boolean
}) => (
  <input
    id={id}
    aria-describedby={describedBy}
    aria-invalid={invalid}
    placeholder="入力してください"
    style={{
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: 6,
      padding: '8px 12px',
      width: 280,
    }}
  />
)

export const Required: Story = {
  args: { label: '会社名', required: true, children: demoInput },
}

export const Optional: Story = {
  args: { label: '説明', description: '一覧・詳細に表示されます', children: demoInput },
}

export const WithError: Story = {
  args: {
    label: '会社名',
    required: true,
    error: '会社名を入力してください',
    children: demoInput,
  },
}

export const NoBadge: Story = {
  args: { label: 'メモ', showOptionalBadge: false, children: demoInput },
}
