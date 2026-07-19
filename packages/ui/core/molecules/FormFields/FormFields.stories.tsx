import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { ColorField } from './ColorField'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { TextField } from './TextField'
import { TextareaField } from './TextareaField'
import { ToggleChipsField } from './ToggleChipsField'
import { UnitNumberField } from './UnitNumberField'

const meta: Meta = {
  title: 'Molecules/FormFields',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

/** マスタ編集フォーム相当。フィールドキットだけで 1 枚の統一されたフォームが組める。 */
export const MasterForm: Story = {
  render: () => {
    const [name, setName] = useState('')
    const [order, setOrder] = useState('')
    const [company, setCompany] = useState<string | number | undefined>(undefined)
    const [color, setColor] = useState('#3B82F6')
    const [desc, setDesc] = useState('')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <TextField
          label="部署名"
          required
          value={name}
          onChange={setName}
          placeholder="例: 開発部"
          error={name.trim() ? undefined : '部署名を入力してください'}
        />
        <SelectField
          label="会社"
          required
          value={company}
          onChange={setCompany}
          options={[
            { value: 1, label: '株式会社A' },
            { value: 2, label: '株式会社B' },
          ]}
        />
        <NumberField label="表示順" value={order} onChange={setOrder} placeholder="0" />
        <ColorField label="色" value={color} onChange={setColor} />
        <TextareaField
          label="説明"
          value={desc}
          onChange={setDesc}
          description="一覧・詳細に表示されます"
        />
      </div>
    )
  },
}

/** 単位付き数値 + トグルチップの複合フィールドキット。試験・コースフォーム相当。 */
export const CompositeFields: Story = {
  render: () => {
    const [timeLimit, setTimeLimit] = useState('60')
    const [estimate, setEstimate] = useState('90')
    const [estimateUnit, setEstimateUnit] = useState('min')
    const [validity, setValidity] = useState('3')
    const [tagIds, setTagIds] = useState<number[]>([2])
    const [categoryIds, setCategoryIds] = useState<number[]>([1])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <UnitNumberField
          label="制限時間"
          showOptionalBadge={false}
          unit="分"
          min={1}
          max={300}
          step={5}
          value={timeLimit}
          onChange={setTimeLimit}
        />
        <UnitNumberField
          label="修了目安時間"
          description="受講者がコースを修了するまでの目安時間"
          unitOptions={[
            { value: 'min', label: '分' },
            { value: 'hour', label: '時間' },
          ]}
          unitValue={estimateUnit}
          onUnitChange={setEstimateUnit}
          value={estimate}
          onChange={setEstimate}
          placeholder="例: 90"
        />
        <UnitNumberField
          label="認定の有効期限"
          showOptionalBadge={false}
          unit="年"
          min={0}
          max={99}
          maxWidth={120}
          value={validity}
          onChange={setValidity}
          error={Number(validity) > 99 ? '99 年以下で入力してください' : undefined}
        />
        <ToggleChipsField
          label="タグ"
          description="複数選択できます（未選択チップには色ドット）"
          options={[
            { value: 1, label: '生成AI', color: '#f59e0b' },
            { value: 2, label: 'セキュリティ', color: '#3b82f6' },
            { value: 3, label: '社内規程' },
          ]}
          value={tagIds}
          onChange={setTagIds}
        />
        <ToggleChipsField
          label="コースカテゴリ"
          description="checkIcon で選択中にチェックマーク"
          checkIcon
          options={[
            { value: 1, label: '基礎' },
            { value: 2, label: '応用' },
            { value: 3, label: '実践' },
          ]}
          value={categoryIds}
          onChange={setCategoryIds}
        />
      </div>
    )
  },
}
