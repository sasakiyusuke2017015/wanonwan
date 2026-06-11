import { BackgroundImage } from './BackgroundImage';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BackgroundImage> = {
  title: '表示/コンテンツ/BackgroundImage',
  component: BackgroundImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '背景画像を表示するコンポーネント。透明度を調整可能。',
      },
    },
  },
  argTypes: {
    src: {
      control: 'text',
      description: '背景画像のURL',
    },
    opacity: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: '透明度(0-100)',
    },
    showFloatingElements: {
      control: 'boolean',
      description: 'フローティング要素（光る円）を表示するかどうか',
    },
    floatingElements: {
      control: 'object',
      description: 'カスタムフローティング要素の配列',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    opacity: 60,
  },
};

export const HighOpacity: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    opacity: 90,
  },
};

export const LowOpacity: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    opacity: 30,
  },
};

export const NatureBackground: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    opacity: 60,
  },
};

// フローティング要素あり
export const WithFloatingElements: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    opacity: 40,
    showFloatingElements: true,
  },
};

// カスタムフローティング要素
export const CustomFloatingElements: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    opacity: 30,
    showFloatingElements: true,
    floatingElements: [
      {
        position: 'top-1/4 left-1/4',
        size: 'w-64 h-64',
        gradient: 'from-red-400/30 to-yellow-400/40',
        blur: 'blur-3xl',
      },
      {
        position: 'bottom-1/4 right-1/4',
        size: 'w-80 h-80',
        gradient: 'from-blue-400/25 to-cyan-400/35',
        blur: 'blur-3xl',
        animationDelay: '1s',
      },
    ],
  },
};

// ログイン画面風
export const LoginStyle: Story = {
  args: {
    src: '/images/back_login.webp',
    opacity: 20,
    showFloatingElements: true,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          backgroundColor: '#1a202c',
        }}
      >
        <Story />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '48px',
              borderRadius: '24px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              ログイン
            </h1>
            <p style={{ color: '#666' }}>
              背景画像 + フローティング要素の組み合わせ
            </p>
          </div>
        </div>
      </div>
    ),
  ],
};
