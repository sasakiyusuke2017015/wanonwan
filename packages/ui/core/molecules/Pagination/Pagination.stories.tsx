import { useState } from 'react'

import { Pagination } from './Pagination'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Pagination> = {
  title: 'ナビゲーション/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0 } },
    boundaryCount: { control: { type: 'number', min: 0 } },
    prevLabel: { control: 'text' },
    nextLabel: { control: 'text' },
    className: { control: 'text' },
    onPageChange: { action: 'pageChanged' },
  },
}

export default meta
type Story = StoryObj<typeof Pagination>

/** 基本的な使用例 (5 ページ、現在 1 ページ目) */
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
  },
}

/** 中央 (10 ページ中 6 ページ目、左右に省略あり) */
export const MiddlePage: Story = {
  args: {
    currentPage: 6,
    totalPages: 10,
  },
}

/** 右端 (10 ページ中 9 ページ目) */
export const NearEnd: Story = {
  args: {
    currentPage: 9,
    totalPages: 10,
  },
}

/** 大量ページ (100 ページ中 50 ページ目) */
export const ManyPages: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
  },
}

/** siblingCount=2 (現在ページの両側 2 個ずつ) */
export const WiderSibling: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    siblingCount: 2,
  },
}

/** boundaryCount=2 (両端 2 個ずつ) */
export const WiderBoundary: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    boundaryCount: 2,
  },
}

/** ページが 1 のみ (何もレンダリングしない) */
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
}

/** インタラクティブ (state 連動) */
export const Interactive: Story = {
  render: function InteractivePagination() {
    const [page, setPage] = useState(1)
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">現在のページ: {page} / 20</p>
        <Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
      </div>
    )
  },
}

/** 英語ラベル */
export const EnglishLabels: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    prevLabel: 'Previous',
    nextLabel: 'Next',
  },
}
