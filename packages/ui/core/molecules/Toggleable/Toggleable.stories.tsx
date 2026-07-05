import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Toggleable } from './Toggleable'

const meta: Meta<typeof Toggleable> = {
  title: 'molecules/Toggleable',
  component: Toggleable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Toggleable>

/**
 * 開閉ロジックだけを持つ headless primitive。
 * trigger は呼び出し側で `renderTrigger` 経由に描画する。
 * Section クロームのような視覚 (border / 背景) は持たない。
 */
export const Default: Story = {
  render: () => (
    <Toggleable
      defaultOpen={true}
      renderTrigger={({ isOpen, triggerProps }) => (
        <button {...triggerProps} style={{ padding: '4px 8px' }}>
          {isOpen ? '閉じる' : '開く'}
        </button>
      )}
    >
      <div style={{ padding: 8 }}>
        <p>開閉対象の中身。</p>
        <p>slide + fade で表示されます。</p>
      </div>
    </Toggleable>
  ),
}

export const InitiallyClosed: Story = {
  render: () => (
    <Toggleable
      defaultOpen={false}
      renderTrigger={({ isOpen, triggerProps }) => (
        <button {...triggerProps} style={{ padding: '4px 8px' }}>
          {isOpen ? '閉じる' : '開く'}
        </button>
      )}
    >
      <div style={{ padding: 8 }}>初期は閉じている。クリックで開く。</div>
    </Toggleable>
  ),
}

/** controlled モード: 親 state で開閉を管理する */
export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [open, setOpen] = useState(true)
      return (
        <div>
          <div style={{ marginBottom: 8 }}>
            親 state: {String(open)}{' '}
            <button onClick={() => setOpen((v) => !v)}>親から切替</button>
          </div>
          <Toggleable
            isOpen={open}
            onToggle={setOpen}
            renderTrigger={({ isOpen, triggerProps }) => (
              <button {...triggerProps} style={{ padding: '4px 8px' }}>
                {isOpen ? '閉じる (内側 trigger)' : '開く (内側 trigger)'}
              </button>
            )}
          >
            <div style={{ padding: 8 }}>controlled の中身。</div>
          </Toggleable>
        </div>
      )
    }
    return <ControlledExample />
  },
}
