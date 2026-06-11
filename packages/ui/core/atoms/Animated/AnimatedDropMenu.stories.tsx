import type { Meta, StoryObj } from '@storybook/react'

import { Animated } from './Animated'
import { ReplayButton } from '../../molecules/ReplayButton/ReplayButton'
import { useRemountKey } from '../../hooks/useRemountKey'

const meta: Meta<typeof Animated> = {
  title: 'アニメーション/DropMenu',
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
 * DropMenu - SlideDown
 */
export const SlideDown: Story = {
  render: function SlideDownStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
          {[0, 1, 2, 3].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="dropMenu" variant="slideDown" index={index}>
              <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <span>メニュー項目 {index + 1}</span>
                  <span className="text-fluid-xs text-gray-500">⌘{index + 1}</span>
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
 * DropMenu - Speed 比較
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
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`normal-${key}-${index}`} show={true} category="dropMenu" variant="slideDown" index={index} speed={1.0}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-gray-100">項目 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">高速 (speed = 2.0)</h3>
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`fast-${key}-${index}`} show={true} category="dropMenu" variant="slideDown" index={index} speed={2.0}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-green-50">項目 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">低速 (speed = 0.5)</h3>
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`slow-${key}-${index}`} show={true} category="dropMenu" variant="slideDown" index={index} speed={0.5}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-orange-50">項目 {index + 1}</div>
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
 * DropMenu - FadeIn
 */
export const FadeIn: Story = {
  render: function FadeInStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
          {[0, 1, 2, 3].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="dropMenu" variant="fadeIn" index={index}>
              <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-green-50">
                <div className="flex items-center justify-between">
                  <span>メニュー項目 {index + 1}</span>
                  <span className="text-fluid-xs text-green-500">⌘{index + 1}</span>
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
 * DropMenu - ScaleY
 */
export const ScaleY: Story = {
  render: function ScaleYStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
          {[0, 1, 2, 3].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="dropMenu" variant="scaleY" index={index}>
              <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-purple-50">
                <div className="flex items-center justify-between">
                  <span>メニュー項目 {index + 1}</span>
                  <span className="text-fluid-xs text-purple-500">⌘{index + 1}</span>
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
 * DropMenu - 全バリアント比較
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
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`down-${key}-${index}`} show={true} category="dropMenu" variant="slideDown" index={index}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-gray-100">項目 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">FadeIn</h3>
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`fade-${key}-${index}`} show={true} category="dropMenu" variant="fadeIn" index={index}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-green-50">項目 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">ScaleY</h3>
            <div className="w-64 rounded-lg border border-gray-300 bg-white shadow-lg">
              {[0, 1, 2, 3].map((index) => (
                <Animated key={`scale-${key}-${index}`} show={true} category="dropMenu" variant="scaleY" index={index}>
                  <div className="border-b border-gray-200 px-4 py-2 text-fluid-sm text-gray-700 last:border-b-0 hover:bg-purple-50">項目 {index + 1}</div>
                </Animated>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
}
