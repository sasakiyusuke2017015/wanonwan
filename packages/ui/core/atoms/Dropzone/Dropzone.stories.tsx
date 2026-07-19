import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Dropzone } from './Dropzone'

const meta: Meta<typeof Dropzone> = {
  title: 'フォーム/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof Dropzone>

export const Default: Story = {
  args: {
    onFiles: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export const WithHelperText: Story = {
  args: {
    onFiles: () => undefined,
    helperText: 'html, pdf, md (各 5 MiB まで)',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export const CustomLabel: Story = {
  args: {
    onFiles: () => undefined,
    label: '教材ファイルをここにドロップ',
    helperText: 'HTML / PDF / Markdown 形式 (合計 50 MiB まで)',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Large: Story = {
  args: {
    onFiles: () => undefined,
    size: 'large',
    multiple: true,
    label: 'ファイルをまとめてドロップして節を追加',
    helperText: 'md / pdf / html は 1 ファイルが 1 節になります',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '640px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Disabled: Story = {
  args: {
    onFiles: () => undefined,
    label: 'ドロップ無効 (例: 既に最大数アップロード済み)',
    disabled: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
}

export const Interactive: Story = {
  render: () => {
    const InteractiveDropzone = () => {
      const [received, setReceived] = useState<string[]>([])
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '480px' }}>
          <Dropzone
            accept=".html,.pdf,.md"
            multiple
            onFiles={(files) => setReceived(files.map((f) => `${f.name} (${f.size} B)`))}
            label="HTML / PDF / Markdown をドロップ or 選択"
            helperText="複数選択可"
          />
          {received.length > 0 && (
            <ul style={{ fontSize: '12px', color: '#475569', listStyle: 'disc', paddingLeft: '1.25rem' }}>
              {received.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )
    }
    return <InteractiveDropzone />
  },
}
