import type { Meta, StoryObj } from '@storybook/react'

import { PageHeaderIconNav } from './PageHeaderIconNav'

const meta: Meta<typeof PageHeaderIconNav> = {
  title: 'Molecules/PageHeaderIconNav',
  component: PageHeaderIconNav,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof PageHeaderIconNav>

/** 戻るだけの最小構成（マスタ CRUD / 組織 new・edit 相当）。 */
export const BackOnly: Story = {
  args: {
    items: [{ icon: 'arrow-left', label: '一覧に戻る', href: '#' }],
  },
}

/** 対象ユーザー + 戻る（試験 / コース edit 相当。admin のときだけ users を渡す想定）。 */
export const WithTargets: Story = {
  args: {
    items: [
      { icon: 'users', label: '対象ユーザー', href: '#targets' },
      { icon: 'arrow-left', label: '一覧に戻る', href: '#' },
    ],
  },
}
