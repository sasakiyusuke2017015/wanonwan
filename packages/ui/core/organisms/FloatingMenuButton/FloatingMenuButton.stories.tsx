import { useState } from 'react';

import type { Meta } from '@storybook/react';

import { FloatingMenuButton } from './FloatingMenuButton';

const meta: Meta<typeof FloatingMenuButton> = {
  title: 'ナビゲーション/メニュー/FloatingMenuButton',
  component: FloatingMenuButton,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

const InteractiveExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <p className="p-4 text-gray-600">
        ボタンの状態: {isOpen ? '開' : '閉'}
      </p>
      <FloatingMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
};

export const Default = {
  render: () => <InteractiveExample />,
};

const CustomColorsExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <FloatingMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        backgroundColor="#3B82F6"
        borderColor="#2563EB"
        color="#ffffff"
        position="bottom-right"
        size={32}
      />
    </div>
  );
};

export const CustomColors = {
  render: () => <CustomColorsExample />,
};

const TopRightExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <p className="p-4 text-gray-600">
        position: top-right / サイズ: 48px
      </p>
      <FloatingMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        position="top-right"
        size={48}
      />
    </div>
  );
};

export const TopRightLarge = {
  render: () => <TopRightExample />,
};

const SmallButtonExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <p className="p-4 text-gray-600">
        小さいボタン (20px) / 赤系カラー
      </p>
      <FloatingMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        size={20}
        backgroundColor="#DC2626"
        borderColor="#B91C1C"
        color="#ffffff"
        position="bottom-left"
      />
    </div>
  );
};

export const SmallRed = {
  render: () => <SmallButtonExample />,
};

const OpenStateExample = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <p className="p-4 text-gray-600">
        初期状態: 開いた状態
      </p>
      <FloatingMenuButton
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        position="bottom-right"
      />
    </div>
  );
};

export const InitiallyOpen = {
  render: () => <OpenStateExample />,
};
