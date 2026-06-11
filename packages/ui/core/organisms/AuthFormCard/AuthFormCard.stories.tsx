import type { Meta, StoryObj } from '@storybook/react';

import { AuthFormCard } from './AuthFormCard';

const meta: Meta<typeof AuthFormCard> = {
  title: 'レイアウト/AuthFormCard',
  component: AuthFormCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof AuthFormCard>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-center">ログイン</h2>
        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input type="email" placeholder="example@mail.com" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input type="password" placeholder="8文字以上" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="w-full bg-blue-500 text-white rounded py-2">ログイン</button>
      </div>
    ),
  },
};

export const CustomCopyright: Story = {
  args: {
    copyrightText: '© 2026 My Company',
    children: <p className="text-center">フォームコンテンツ</p>,
  },
};

export const PasswordReset: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-center">パスワードリセット</h2>
        <p className="text-sm text-gray-500 text-center">
          登録済みのメールアドレスを入力してください
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input type="email" placeholder="example@mail.com" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="w-full bg-blue-500 text-white rounded py-2">リセットリンクを送信</button>
        <p className="text-xs text-center text-blue-500 cursor-pointer">ログインに戻る</p>
      </div>
    ),
  },
};

export const SignUp: Story = {
  args: {
    copyrightText: '© 2026 SMS DataTech',
    children: (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-center">アカウント作成</h2>
        <div>
          <label className="block text-sm font-medium mb-1">ユーザー名</label>
          <input type="text" placeholder="taro_yamada" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input type="email" placeholder="example@mail.com" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">パスワード</label>
          <input type="password" placeholder="8文字以上" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">パスワード（確認）</label>
          <input type="password" placeholder="もう一度入力" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="w-full bg-green-600 text-white rounded py-2">アカウントを作成</button>
      </div>
    ),
  },
};
