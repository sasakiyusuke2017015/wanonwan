import type { Meta, StoryObj } from '@storybook/react'

import { FormGrid } from './FormGrid'

const meta: Meta<typeof FormGrid> = {
  title: 'Molecules/FormGrid',
  component: FormGrid,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof FormGrid>

const box = (label: string) => (
  <div
    style={{
      border: '1px dashed var(--color-border, #d1d5db)',
      borderRadius: 6,
      background: 'var(--color-gray-50, #f9fafb)',
      padding: '10px 12px',
      fontSize: 12,
      color: 'var(--color-text-muted, #6b7280)',
    }}
  >
    {label}
  </div>
)

/** 幅トークン 4 段の見え方。short×3 = 1 行、half×2 = 1 行、wide+short = 1 行。 */
export const WidthTokens: Story = {
  render: () => (
    <FormGrid>
      <FormGrid.Item width="short">{box('short (1/3)')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('short (1/3)')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('short (1/3)')}</FormGrid.Item>
      <FormGrid.Item width="half">{box('half (1/2)')}</FormGrid.Item>
      <FormGrid.Item width="half">{box('half (1/2)')}</FormGrid.Item>
      <FormGrid.Item width="wide">{box('wide (2/3)')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('short (1/3)')}</FormGrid.Item>
      <FormGrid.Item width="full">{box('full (1 行占有)')}</FormGrid.Item>
    </FormGrid>
  ),
}

/**
 * newRow の折り返し。2 つ目の short に newRow を付けると、1 行目は
 * short 1 つ分だけで穴が残り、以降は次の行から並ぶ（意図した挙動）。
 */
export const WrapAndNewRow: Story = {
  render: () => (
    <FormGrid>
      <FormGrid.Item width="short">{box('short')}</FormGrid.Item>
      <FormGrid.Item width="short" newRow>
        {box('short + newRow（ここから行を変える）')}
      </FormGrid.Item>
      <FormGrid.Item width="short">{box('short（続きは同じ行）')}</FormGrid.Item>
    </FormGrid>
  ),
}

/** マスタ CRUD フォーム相当の配置例（名称 wide + コード/表示順 short、説明 full）。 */
export const MasterFormExample: Story = {
  render: () => (
    <FormGrid>
      <FormGrid.Item width="wide">{box('名称（wide）')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('コード（short）')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('色（short）')}</FormGrid.Item>
      <FormGrid.Item width="short">{box('表示順（short）')}</FormGrid.Item>
      <FormGrid.Item width="full">
        <div
          style={{
            border: '1px dashed var(--color-border, #d1d5db)',
            borderRadius: 6,
            background: 'var(--color-gray-50, #f9fafb)',
            padding: '10px 12px',
            fontSize: 12,
            color: 'var(--color-text-muted, #6b7280)',
            minHeight: 72,
          }}
        >
          説明（full / textarea）
        </div>
      </FormGrid.Item>
    </FormGrid>
  ),
}
