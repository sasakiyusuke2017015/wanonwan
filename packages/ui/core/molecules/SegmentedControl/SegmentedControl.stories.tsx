import { useState } from 'react'

import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl'

/**
 * 常時展開・単一選択のセグメントコントロール（正準）。
 * 表示モード切替・フィルタの択一・設定の N 択などに使用します。
 */
export default {
  title: '入力/選択/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
N 択から 1 つ選ぶ横並びセグメント。選択位置へスライダーが滑らかに移動します。

- **4 バリアント**: default / primary / teal / dark
- **3 サイズ**: small / medium / large
- **icon-only**: \`showLabel={false}\` で省スペース表示 (旧 ViewModeToggle 用途)
- **ラベルのみ**: \`option.icon\` は任意 (旧 Segment 用途)
- a11y: radiogroup / radio + aria-checked
        `,
      },
    },
  },
}

const VIEW_OPTIONS: SegmentedControlOption[] = [
  { value: 'table', label: 'テーブル', icon: 'list' },
  { value: 'card', label: 'カード', icon: 'dashboard' },
]

const PLAIN_OPTIONS: SegmentedControlOption[] = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '有効のみ' },
  { value: 'inactive', label: '無効のみ' },
]

const Controlled = (props: { options: SegmentedControlOption[]; [key: string]: unknown }) => {
  const [value, setValue] = useState(props.options[0].value)
  return <SegmentedControl {...props} value={value} onChange={setValue} options={props.options} />
}

export const Basic = {
  render: () => <Controlled options={VIEW_OPTIONS} />,
}

export const LabelOnly = {
  render: () => <Controlled options={PLAIN_OPTIONS} />,
}

export const IconOnly = {
  render: () => <Controlled options={VIEW_OPTIONS} showLabel={false} />,
}

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Controlled options={VIEW_OPTIONS} variant="default" />
      <Controlled options={VIEW_OPTIONS} variant="primary" />
      <Controlled options={VIEW_OPTIONS} variant="teal" />
      <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
        <Controlled options={VIEW_OPTIONS} variant="dark" />
      </div>
    </div>
  ),
}

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
      <Controlled options={VIEW_OPTIONS} size="small" />
      <Controlled options={VIEW_OPTIONS} size="medium" />
      <Controlled options={VIEW_OPTIONS} size="large" />
    </div>
  ),
}

export const Disabled = {
  render: () => (
    <SegmentedControl
      value="table"
      onChange={() => {}}
      options={VIEW_OPTIONS}
      disabled
    />
  ),
}
