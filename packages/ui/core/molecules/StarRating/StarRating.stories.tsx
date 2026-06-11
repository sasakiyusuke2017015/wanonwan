import type { Meta, StoryObj } from '@storybook/react'

import { StarRating } from './StarRating'

const meta: Meta<typeof StarRating> = {
  title: 'データ可視化/その他/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '0.5単位で星評価を表示するコンポーネント。値×2→四捨五入→÷2のロジックで0.5刻みの評価を実現します。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'number', min: 0, max: 5, step: 0.1 },
      description: '評価値(0-5)',
    },
    maxStars: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: '最大星数',
    },
    size: {
      control: { type: 'number', min: 10, max: 50, step: 2 },
      description: '星のサイズ(px)',
    },
    showValue: {
      control: 'boolean',
      description: '評価値を数値で表示するかどうか',
    },
    className: {
      control: 'text',
      description: 'カスタムCSSクラス',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rating: 3.2,
    showValue: true,
  },
}

export const RatingExamples: Story = {
  args: { rating: 3.0 },
  render: function RatingExamplesStory() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">様々な評価値(0.5単位での四捨五入)</h3>
          <div className="grid grid-cols-1 gap-2">
            {[1.0, 1.7, 2.3, 2.8, 3.2, 3.8, 4.4, 5.0].map((rating) => (
              <div key={rating} className="flex w-80 items-center justify-between">
                <span className="w-20">{rating}:</span>
                <StarRating rating={rating} showValue={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

export const WithoutValue: Story = {
  args: {
    rating: 3.8,
    showValue: false,
  },
}

export const DifferentSizes: Story = {
  args: { rating: 3.5 },
  render: function DifferentSizesStory() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">異なるサイズ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-16">小 (16px):</span>
              <StarRating rating={3.5} size={16} showValue={true} />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16">中 (24px):</span>
              <StarRating rating={3.5} size={24} showValue={true} />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16">大 (32px):</span>
              <StarRating rating={3.5} size={32} showValue={true} />
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const DifferentMaxStars: Story = {
  args: { rating: 3.0 },
  render: function DifferentMaxStarsStory() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">異なる最大星数</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="w-16">3つ星:</span>
              <StarRating rating={2.3} maxStars={3} showValue={true} />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16">5つ星:</span>
              <StarRating rating={3.8} maxStars={5} showValue={true} />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16">10つ星:</span>
              <StarRating rating={7.2} maxStars={10} showValue={true} />
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const EmployeeEvaluation: Story = {
  args: { rating: 4.0 },
  render: function EmployeeEvaluationStory() {
    return (
      <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-fluid-lg font-semibold">メンバー評価</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center">
            <div className="mb-2 text-fluid-sm text-gray-500">満足度</div>
            <StarRating rating={4.2} size={24} showValue={true} />
          </div>
          <div className="text-center">
            <div className="mb-2 text-fluid-sm text-gray-500">業務負荷</div>
            <StarRating rating={2.8} size={24} showValue={true} />
          </div>
          <div className="text-center">
            <div className="mb-2 text-fluid-sm text-gray-500">職場環境</div>
            <StarRating rating={3.7} size={24} showValue={true} />
          </div>
          <div className="text-center">
            <div className="mb-2 text-fluid-sm text-gray-500">人間関係</div>
            <StarRating rating={4.1} size={24} showValue={true} />
          </div>
          <div className="text-center">
            <div className="mb-2 text-fluid-sm text-gray-500">ストレス</div>
            <StarRating rating={3.3} size={24} showValue={true} />
          </div>
        </div>
      </div>
    )
  },
}

export const EdgeCases: Story = {
  args: { rating: 2.5 },
  render: function EdgeCasesStory() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">エッジケース</h3>
          <div className="space-y-3">
            {[0.0, 0.24, 0.25, 0.74, 0.75, 5.0].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <span className="w-20">{rating}:</span>
                <StarRating rating={rating} showValue={true} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
