import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Collapse } from './Collapse'

const meta: Meta<typeof Collapse> = {
  title: 'Molecules/Collapse',
  component: Collapse,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof Collapse>

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--color-border, #e5e7eb)',
  borderRadius: 8,
  padding: 16,
  marginTop: 8,
  background: 'var(--color-bg-surface, #fff)',
}

function Demo({ initialOpen, rows }: { initialOpen: boolean; rows: number }) {
  const [open, setOpen] = useState(initialOpen)
  const regionId = 'collapse-demo'
  return (
    <div style={{ maxWidth: 420 }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((v) => !v)}
        style={{
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 6,
          padding: '6px 12px',
          cursor: 'pointer',
        }}
      >
        {open ? '閉じる' : '開く'}
      </button>
      <Collapse open={open} id={regionId}>
        <div style={panelStyle}>
          {Array.from({ length: rows }, (_, i) => (
            <p key={i} style={{ margin: '4px 0' }}>
              行 {i + 1}: 中身の高さは自動実測されます
            </p>
          ))}
        </div>
      </Collapse>
    </div>
  )
}

export const Default: Story = {
  render: () => <Demo initialOpen rows={3} />,
}

export const StartClosed: Story = {
  render: () => <Demo initialOpen={false} rows={3} />,
}

/** 中身が高くても max-height の上限に縛られず滑らかに開く。 */
export const TallContent: Story = {
  render: () => <Demo initialOpen={false} rows={20} />,
}
