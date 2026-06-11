import type { Meta, StoryObj } from '@storybook/react'

import { Animated } from './Animated'
import { ReplayButton } from '../../molecules/ReplayButton/ReplayButton'
import { useRemountKey } from '../../hooks/useRemountKey'

const meta: Meta<typeof Animated> = {
  title: 'アニメーション/TableRow',
  component: Animated,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    show: true,
    children: null,
  },
  argTypes: {
    speed: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.1 },
      description: 'アニメーション速度倍率（1.0 = 通常、2.0 = 2倍速、0.5 = 半分速）',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * TableRow - SlideDown
 */
export const SlideDown: Story = {
  render: function SlideDownStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="space-y-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="tableRow" variant="slideDown" index={index}>
              <div className="rounded bg-blue-100 px-4 py-3 text-fluid-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">行 {index + 1}</span>
                  <span className="text-blue-700">データサンプル</span>
                </div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * TableRow - Speed 比較
 */
export const SpeedComparison: Story = {
  render: function SpeedComparisonStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-6">
        <ReplayButton onClick={remount} label="すべて再生" />
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">通常速度 (speed = 1.0)</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`normal-${key}-${index}`} show={true} category="tableRow" variant="slideDown" index={index} speed={1.0}>
                  <div className="rounded bg-blue-100 px-3 py-2 text-fluid-xs text-blue-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">高速 (speed = 2.0)</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`fast-${key}-${index}`} show={true} category="tableRow" variant="slideDown" index={index} speed={2.0}>
                  <div className="rounded bg-green-100 px-3 py-2 text-fluid-xs text-green-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">低速 (speed = 0.5)</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`slow-${key}-${index}`} show={true} category="tableRow" variant="slideDown" index={index} speed={0.5}>
                  <div className="rounded bg-orange-100 px-3 py-2 text-fluid-xs text-orange-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/**
 * TableRow - FadeIn
 */
export const FadeIn: Story = {
  render: function FadeInStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="space-y-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="tableRow" variant="fadeIn" index={index}>
              <div className="rounded bg-green-100 px-4 py-3 text-fluid-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-900">行 {index + 1}</span>
                  <span className="text-green-700">フェードイン</span>
                </div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * TableRow - SlideLeft
 */
export const SlideLeft: Story = {
  render: function SlideLeftStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="space-y-1">
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="tableRow" variant="slideLeft" index={index}>
              <div className="rounded bg-purple-100 px-4 py-3 text-fluid-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-900">行 {index + 1}</span>
                  <span className="text-purple-700">左からスライド</span>
                </div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * TableRow - 全バリアント比較
 */
export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-6">
        <ReplayButton onClick={remount} label="すべて再生" />
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">SlideDown</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`down-${key}-${index}`} show={true} category="tableRow" variant="slideDown" index={index}>
                  <div className="rounded bg-blue-100 px-3 py-2 text-fluid-xs text-blue-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">FadeIn</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`fade-${key}-${index}`} show={true} category="tableRow" variant="fadeIn" index={index}>
                  <div className="rounded bg-green-100 px-3 py-2 text-fluid-xs text-green-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">SlideLeft</h3>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <Animated key={`left-${key}-${index}`} show={true} category="tableRow" variant="slideLeft" index={index}>
                  <div className="rounded bg-purple-100 px-3 py-2 text-fluid-xs text-purple-800">行 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
}
