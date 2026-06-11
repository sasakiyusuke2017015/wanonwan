import { useState } from 'react';

import type { Meta } from '@storybook/react';

import { SideNav } from './SideNav';

const meta: Meta<typeof SideNav> = {
  title: 'テンプレート/SideNav',
  component: SideNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default = {
  args: {
    width: 240,
    topOffset: 0,
    isOpen: true,
    bgColor: '#F9FAFB',
    children: (
      <nav className="p-4 space-y-2">
        <div className="px-3 py-2 rounded hover:bg-gray-200 cursor-pointer">ホーム</div>
        <div className="px-3 py-2 rounded hover:bg-gray-200 cursor-pointer">設定</div>
        <div className="px-3 py-2 rounded hover:bg-gray-200 cursor-pointer">ヘルプ</div>
      </nav>
    ),
  },
};

const ToggleExample = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ height: 400 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 left-64 z-50 rounded bg-blue-500 px-3 py-1 text-white text-sm"
      >
        {isOpen ? '閉じる' : '開く'}
      </button>
      <SideNav width={240} topOffset={0} isOpen={isOpen} bgColor="#F9FAFB">
        <nav className="p-4 space-y-2">
          <div className="px-3 py-2 rounded hover:bg-gray-200 cursor-pointer">メニュー1</div>
          <div className="px-3 py-2 rounded hover:bg-gray-200 cursor-pointer">メニュー2</div>
        </nav>
      </SideNav>
    </div>
  );
};

export const Toggleable = {
  render: () => <ToggleExample />,
};
