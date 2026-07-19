import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { ThumbnailCropper } from './ThumbnailCropper'
import type { CropOutput } from './cropImage'

const meta: Meta<typeof ThumbnailCropper> = {
  title: 'フォーム/ThumbnailCropper',
  component: ThumbnailCropper,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'サムネイル登録用の画像切り出しコンポーネント。JPG / PNG をアップロードし、' +
          '固定 aspect のフレーム内に収まるよう位置・ズームを調節して Canvas で切り出す。' +
          '切り出し結果 (Blob + プレビュー URL) を onCropped で返す presentational component。',
      },
    },
  },
  argTypes: {
    aspect: {
      control: { type: 'number', step: 0.1 },
      description: '切り出し枠の縦横比 (例: 1, 16/9, 4/3)',
    },
  },
}

export default meta

type Story = StoryObj<typeof ThumbnailCropper>

function Preview({ output }: { output: CropOutput | null }) {
  if (!output) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '12px', color: '#475569' }}>
        切り出し結果: {Math.round(output.blob.size / 1024)} KB / {output.blob.type}
      </span>
      <img
        src={output.url}
        alt="切り出しプレビュー"
        style={{ maxWidth: '240px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
      />
    </div>
  )
}

export const Square: Story = {
  render: () => {
    const Demo = () => {
      const [output, setOutput] = useState<CropOutput | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '480px' }}>
          <ThumbnailCropper aspect={1} onCropped={setOutput} onReset={() => setOutput(null)} />
          <Preview output={output} />
        </div>
      )
    }
    return <Demo />
  },
}

export const Widescreen: Story = {
  render: () => {
    const Demo = () => {
      const [output, setOutput] = useState<CropOutput | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '480px' }}>
          <ThumbnailCropper
            aspect={16 / 9}
            onCropped={setOutput}
            onReset={() => setOutput(null)}
            label="サムネイル画像を選択"
            helperText="JPG / PNG (16:9 推奨)"
          />
          <Preview output={output} />
        </div>
      )
    }
    return <Demo />
  },
}
