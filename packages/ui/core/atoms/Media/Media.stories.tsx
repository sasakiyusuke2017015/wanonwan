import { Media, MediaProps } from './Media';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Media> = {
  title: '表示/コンテンツ/Media',
  component: Media,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '画像のパス(相対パスまたは絶対パス)',
    },
    alt: {
      control: 'text',
      description: '代替テキスト',
    },
    size: {
      control: { type: 'range', min: 16, max: 400, step: 8 },
      description: '正方形の場合のサイズ(width/height両方に適用)',
    },
    width: {
      control: { type: 'range', min: 16, max: 400, step: 8 },
      description: '幅(sizeより優先)',
    },
    height: {
      control: { type: 'range', min: 16, max: 400, step: 8 },
      description: '高さ(sizeより優先)',
    },
    objectFit: {
      control: { type: 'select' },
      options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
      description: '画像の収まり方',
    },
    rounded: {
      control: 'boolean',
      description: '角丸表示',
    },
    circle: {
      control: 'boolean',
      description: '円形表示',
    },
    loading: {
      control: { type: 'select' },
      options: ['lazy', 'eager'],
      description: '読み込み方式',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: '/images/favicon.svg',
    alt: 'App favicon',
    size: 64,
  },
};

export const DifferentSizes: Story = {
  render: () => {
    const sizes = [32, 48, 64, 96, 128];

    return (
      <div className="flex items-center space-x-4 p-4">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col items-center space-y-2">
            <Media
              src="/images/favicon.svg"
              alt={`App favicon ${size}px`}
              size={size}
            />
            <span className="text-fluid-sm text-gray-600">{size}px</span>
          </div>
        ))}
      </div>
    );
  },
};

export const ObjectFitOptions: Story = {
  render: () => {
    const fitOptions: Array<{ fit: MediaProps['objectFit']; label: string }> = [
      { fit: 'contain', label: 'Contain' },
      { fit: 'cover', label: 'Cover' },
      { fit: 'fill', label: 'Fill' },
      { fit: 'none', label: 'None' },
      { fit: 'scale-down', label: 'Scale Down' },
    ];

    return (
      <div className="grid grid-cols-3 gap-4 p-4">
        {fitOptions.map(({ fit, label }) => (
          <div key={fit} className="flex flex-col items-center space-y-2">
            <Media
              src="/images/favicon.svg"
              alt={`Object fit ${fit}`}
              width={80}
              height={80}
              objectFit={fit}
              className="border border-gray-300"
            />
            <span className="text-fluid-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const ShapeVariations: Story = {
  render: () => (
    <div className="flex items-center space-x-6 p-4">
      <div className="flex flex-col items-center space-y-2">
        <Media src="/images/favicon.svg" alt="Default shape" size={80} />
        <span className="text-fluid-sm text-gray-600">Default</span>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Media
          src="/images/favicon.svg"
          alt="Rounded shape"
          size={80}
          rounded
        />
        <span className="text-fluid-sm text-gray-600">Rounded</span>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Media
          src="/images/favicon.svg"
          alt="Circle shape"
          size={80}
          circle
        />
        <span className="text-fluid-sm text-gray-600">Circle</span>
      </div>
    </div>
  ),
};

export const ErrorHandling: Story = {
  render: () => (
    <div className="flex items-center space-x-6 p-4">
      <div className="flex flex-col items-center space-y-2">
        <Media src="/nonexistent-image.jpg" alt="Broken image" size={80} />
        <span className="text-fluid-sm text-gray-600">Broken Image</span>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Media
          src="/nonexistent-image.jpg"
          alt="With fallback"
          size={80}
          fallbackSrc="/images/favicon.svg"
        />
        <span className="text-fluid-sm text-gray-600">With Fallback</span>
      </div>
    </div>
  ),
};

export const DifferentFormats: Story = {
  render: () => {
    const formats = [
      { src: '/images/favicon.svg', type: 'PNG' },
      { src: '/images/favicon.svg', type: 'SVG' },
      // 他の形式のサンプルファイルがあれば追加
    ];

    return (
      <div className="flex items-center space-x-6 p-4">
        {formats.map(({ src, type }) => (
          <div key={type} className="flex flex-col items-center space-y-2">
            <Media
              src={src}
              alt={`${type} format`}
              size={80}
              fallbackSrc="/images/favicon.svg"
            />
            <span className="text-fluid-sm text-gray-600">{type}</span>
          </div>
        ))}
      </div>
    );
  },
};

export const ResponsiveExample: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <h3 className="text-fluid-lg font-medium">レスポンシブ画像</h3>
      <Media
        src="/images/favicon.svg"
        alt="Responsive image"
        className="h-auto w-full max-w-xs"
        objectFit="contain"
      />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Media src="/images/favicon.svg" alt="Favicon" size={32} />
        <span>アプリケーションのアイコン</span>
      </div>

      <div className="flex items-center space-x-4">
        <Media
          src="/images/favicon.svg"
          alt="Large favicon"
          size={64}
          circle
        />
        <div>
          <h4 className="font-medium">プロフィール画像スタイル</h4>
          <p className="text-fluid-sm text-gray-600">円形表示でアバター風に</p>
        </div>
      </div>
    </div>
  ),
};
