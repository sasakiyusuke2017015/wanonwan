import type { Meta, StoryObj } from '@storybook/react'

import { Animated } from './Animated'
import { ReplayButton } from '../../molecules/ReplayButton/ReplayButton'
import { useRemountKey } from '../../hooks/useRemountKey'

const meta: Meta<typeof Animated> = {
  title: 'アニメーション/Card',
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
 * Card - SlideRight（デフォルト）
 */
export const SlideRight: Story = {
  render: function SlideRightStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Animated
              key={`${key}-${index}`}
              show={true}
              category="card"
              variant="slideRight"
              index={index}
            >
              <div className="rounded-lg border-2 border-purple-200 bg-purple-100 p-6 text-center">
                <div className="text-fluid-2xl font-bold text-purple-700">カード {index + 1}</div>
                <div className="mt-2 text-fluid-xs text-purple-600">右からスライド（バウンシー）</div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Card - SlideDown
 */
export const SlideDown: Story = {
  render: function SlideDownStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Animated
              key={`${key}-${index}`}
              show={true}
              category="card"
              variant="slideDown"
              index={index}
            >
              <div className="rounded-lg border-2 border-blue-200 bg-blue-100 p-6 text-center">
                <div className="text-fluid-2xl font-bold text-blue-700">カード {index + 1}</div>
                <div className="mt-2 text-fluid-xs text-blue-600">上からスライド（バウンシー）</div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Card - Speed 比較
 */
export const SpeedComparison: Story = {
  render: function SpeedComparisonStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-6">
        <ReplayButton onClick={remount} label="すべて再生" />
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">通常速度 (speed = 1.0)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated
                  key={`normal-${key}-${index}`}
                  show={true}
                  category="card"
                  variant="slideRight"
                  index={index}
                  speed={1.0}
                >
                  <div className="rounded-lg border-2 border-purple-200 bg-purple-100 p-4 text-center text-fluid-sm font-bold text-purple-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">高速 (speed = 2.0)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated
                  key={`fast-${key}-${index}`}
                  show={true}
                  category="card"
                  variant="slideRight"
                  index={index}
                  speed={2.0}
                >
                  <div className="rounded-lg border-2 border-green-200 bg-green-100 p-4 text-center text-fluid-sm font-bold text-green-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">低速 (speed = 0.5)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated
                  key={`slow-${key}-${index}`}
                  show={true}
                  category="card"
                  variant="slideRight"
                  index={index}
                  speed={0.5}
                >
                  <div className="rounded-lg border-2 border-orange-200 bg-orange-100 p-4 text-center text-fluid-sm font-bold text-orange-700">
                    カード {index + 1}
                  </div>
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
 * Card - 全バリアント比較
 */
export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-6">
        <ReplayButton onClick={remount} label="すべて再生" />
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">SlideRight</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated key={`right-${key}-${index}`} show={true} category="card" variant="slideRight" index={index}>
                  <div className="rounded-lg border-2 border-purple-200 bg-purple-100 p-4 text-center text-fluid-sm font-bold text-purple-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">SlideDown</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated key={`down-${key}-${index}`} show={true} category="card" variant="slideDown" index={index}>
                  <div className="rounded-lg border-2 border-blue-200 bg-blue-100 p-4 text-center text-fluid-sm font-bold text-blue-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">FadeIn</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated key={`fade-${key}-${index}`} show={true} category="card" variant="fadeIn" index={index}>
                  <div className="rounded-lg border-2 border-green-200 bg-green-100 p-4 text-center text-fluid-sm font-bold text-green-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">ScaleUp</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated key={`scale-${key}-${index}`} show={true} category="card" variant="scaleUp" index={index}>
                  <div className="rounded-lg border-2 border-orange-200 bg-orange-100 p-4 text-center text-fluid-sm font-bold text-orange-700">
                    カード {index + 1}
                  </div>
                </Animated>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-fluid-sm font-bold text-gray-700">BounceIn</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <Animated key={`bounce-${key}-${index}`} show={true} category="card" variant="bounceIn" index={index}>
                  <div className="rounded-lg border-2 border-pink-200 bg-pink-100 p-4 text-center text-fluid-sm font-bold text-pink-700">
                    カード {index + 1}
                  </div>
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
 * Card - FadeIn
 */
export const FadeIn: Story = {
  render: function FadeInStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="card" variant="fadeIn" index={index}>
              <div className="rounded-lg border-2 border-green-200 bg-green-100 p-6 text-center">
                <div className="text-fluid-2xl font-bold text-green-700">カード {index + 1}</div>
                <div className="mt-2 text-fluid-xs text-green-600">フェードイン</div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Card - ScaleUp
 */
export const ScaleUp: Story = {
  render: function ScaleUpStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="card" variant="scaleUp" index={index}>
              <div className="rounded-lg border-2 border-orange-200 bg-orange-100 p-6 text-center">
                <div className="text-fluid-2xl font-bold text-orange-700">カード {index + 1}</div>
                <div className="mt-2 text-fluid-xs text-orange-600">拡大</div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Card - BounceIn
 */
export const BounceIn: Story = {
  render: function BounceInStory() {
    const { key, remount } = useRemountKey()
    return (
      <div className="space-y-4">
        <ReplayButton onClick={remount} label="再生" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <Animated key={`${key}-${index}`} show={true} category="card" variant="bounceIn" index={index}>
              <div className="rounded-lg border-2 border-pink-200 bg-pink-100 p-6 text-center">
                <div className="text-fluid-2xl font-bold text-pink-700">カード {index + 1}</div>
                <div className="mt-2 text-fluid-xs text-pink-600">バウンス</div>
              </div>
            </Animated>
          ))}
        </div>
      </div>
    )
  },
}
