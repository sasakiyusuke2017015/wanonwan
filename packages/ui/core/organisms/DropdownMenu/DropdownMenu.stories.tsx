import { MenuItemList } from '../MenuItemList/MenuItemList';


import { DropdownMenu } from './DropdownMenu';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DropdownMenu> = {
  title: 'ナビゲーション/メニュー/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1e40af' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline'],
    },
    menuWidth: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// 基本的な使用例
// ========================================

export const Default: Story = {
  args: {
    icon: 'bell',
    variant: 'default',
    menuWidth: 'w-60',
    menuContent: (closeMenu: () => void) => (
      <MenuItemList
        menuItems={[
          { label: 'お知らせ１' },
          { label: 'お知らせ２' },
          { label: 'お知らせ３' },
        ]}
        onClose={closeMenu}
      />
    ),
  },
};

export const Outline: Story = {
  args: {
    icon: 'bell',
    variant: 'outline',
    menuWidth: 'w-60',
    menuContent: (closeMenu: () => void) => (
      <MenuItemList
        menuItems={[
          { label: 'お知らせ１' },
          { label: 'お知らせ２' },
          { label: 'お知らせ３' },
        ]}
        onClose={closeMenu}
      />
    ),
  },
};

export const WithLabel: Story = {
  args: {
    label: 'ユーザー名',
    icon: 'person',
    variant: 'default',
    menuWidth: 'w-64',
    menuContent: (closeMenu: () => void) => (
      <MenuItemList
        menuHeader={
          <div>
            <p className="text-fluid-sm font-medium text-gray-900">山田 太郎</p>
            <p className="mt-0.5 text-fluid-xs text-gray-500">USER001</p>
            <p className="mt-1 text-fluid-xs text-gray-500">yamada@example.com</p>
          </div>
        }
        menuItems={[
          {
            icon: 'gear',
            label: '設定',
            onClick: () => window.alert('設定を開く'),
          },
          {
            icon: 'door-out',
            label: 'ログアウト',
            onClick: () => window.alert('ログアウト'),
          },
        ]}
        onClose={closeMenu}
      />
    ),
  },
};

export const WithLabelOutline: Story = {
  args: {
    label: 'ユーザー名',
    icon: 'person',
    variant: 'outline',
    menuWidth: 'w-64',
    menuContent: (closeMenu: () => void) => (
      <MenuItemList
        menuHeader={
          <div>
            <p className="text-fluid-sm font-medium text-gray-900">山田 太郎</p>
            <p className="mt-0.5 text-fluid-xs text-gray-500">USER001</p>
            <p className="mt-1 text-fluid-xs text-gray-500">yamada@example.com</p>
          </div>
        }
        menuItems={[
          {
            icon: 'gear',
            label: '設定',
            onClick: () => window.alert('設定を開く'),
          },
          {
            icon: 'door-out',
            label: 'ログアウト',
            onClick: () => window.alert('ログアウト'),
          },
        ]}
        onClose={closeMenu}
      />
    ),
  },
};

// ========================================
// 各種アイコンのバリエーション
// ========================================

export const VariousIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <DropdownMenu
        icon={'bell'}
        variant="default"
        menuWidth="w-60"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuItems={[
              { label: '通知１' },
              { label: '通知２' },
              { label: '通知３' },
            ]}
            onClose={closeMenu}
          />
        )}
      />

      <DropdownMenu
        icon={'gear'}
        variant="default"
        menuWidth="w-48"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuItems={[
              { label: '一般設定' },
              { label: 'セキュリティ' },
              { label: 'プライバシー' },
            ]}
            onClose={closeMenu}
          />
        )}
      />

      <DropdownMenu
        icon={'person'}
        variant="default"
        menuWidth="w-52"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuItems={[
              { label: 'プロフィール' },
              { label: 'アカウント設定' },
              { label: 'ログアウト' },
            ]}
            onClose={closeMenu}
          />
        )}
      />
    </div>
  ),
};

// ========================================
// Variant 比較
// ========================================

export const VariantComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-fluid-lg font-semibold text-white">Default Variant</h3>
        <div className="flex gap-4">
          <DropdownMenu
            icon={'bell'}
            variant="default"
            menuWidth="w-60"
            menuContent={(closeMenu: () => void) => (
              <MenuItemList
                menuItems={[{ label: 'アイテム１' }, { label: 'アイテム２' }]}
                onClose={closeMenu}
              />
            )}
          />

          <DropdownMenu
            label="メニュー"
            icon={'hamburger'}
            variant="default"
            menuWidth="w-60"
            menuContent={(closeMenu: () => void) => (
              <MenuItemList
                menuItems={[{ label: 'アイテム１' }, { label: 'アイテム２' }]}
                onClose={closeMenu}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-fluid-lg font-semibold text-white">Outline Variant</h3>
        <div className="flex gap-4">
          <DropdownMenu
            icon={'bell'}
            variant="outline"
            menuWidth="w-60"
            menuContent={(closeMenu: () => void) => (
              <MenuItemList
                menuItems={[{ label: 'アイテム１' }, { label: 'アイテム２' }]}
                onClose={closeMenu}
              />
            )}
          />

          <DropdownMenu
            label="メニュー"
            icon={'hamburger'}
            variant="outline"
            menuWidth="w-60"
            menuContent={(closeMenu: () => void) => (
              <MenuItemList
                menuItems={[{ label: 'アイテム１' }, { label: 'アイテム２' }]}
                onClose={closeMenu}
              />
            )}
          />
        </div>
      </div>
    </div>
  ),
};

// ========================================
// 実用例
// ========================================

export const UserMenuExample: Story = {
  render: () => (
    <div className="flex gap-4">
      {/* Default スタイル */}
      <DropdownMenu
        label="山田 太郎"
        icon={'person'}
        variant="default"
        menuWidth="w-64"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuHeader={
              <div>
                <p className="text-fluid-sm font-medium text-gray-900">山田 太郎</p>
                <p className="mt-0.5 text-fluid-xs text-gray-500">USER001</p>
                <p className="mt-1 text-fluid-xs text-gray-500">yamada@example.com</p>
                <p className="mt-1 text-fluid-xs text-gray-500">営業本部</p>
                <p className="text-fluid-xs text-gray-500">営業1部</p>
                <p className="text-fluid-xs text-gray-500">課長</p>
              </div>
            }
            menuItems={[
              {
                icon: 'person',
                label: 'プロフィール',
                onClick: () => window.alert('プロフィールを表示'),
              },
              {
                icon: 'gear',
                label: '設定',
                onClick: () => window.alert('設定を開く'),
              },
              {
                icon: 'door-out',
                label: 'ログアウト',
                onClick: () => window.alert('ログアウト'),
              },
            ]}
            onClose={closeMenu}
          />
        )}
      />

      {/* Outline スタイル */}
      <DropdownMenu
        label="山田 太郎"
        icon={'person'}
        variant="outline"
        menuWidth="w-64"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuHeader={
              <div>
                <p className="text-fluid-sm font-medium text-gray-900">山田 太郎</p>
                <p className="mt-0.5 text-fluid-xs text-gray-500">USER001</p>
                <p className="mt-1 text-fluid-xs text-gray-500">yamada@example.com</p>
                <p className="mt-1 text-fluid-xs text-gray-500">営業本部</p>
                <p className="text-fluid-xs text-gray-500">営業1部</p>
                <p className="text-fluid-xs text-gray-500">課長</p>
              </div>
            }
            menuItems={[
              {
                icon: 'person',
                label: 'プロフィール',
                onClick: () => window.alert('プロフィールを表示'),
              },
              {
                icon: 'gear',
                label: '設定',
                onClick: () => window.alert('設定を開く'),
              },
              {
                icon: 'door-out',
                label: 'ログアウト',
                onClick: () => window.alert('ログアウト'),
              },
            ]}
            onClose={closeMenu}
          />
        )}
      />
    </div>
  ),
};

export const NotificationMenuExample: Story = {
  render: () => (
    <div className="flex gap-4">
      {/* Default スタイル */}
      <DropdownMenu
        icon={'bell'}
        variant="default"
        menuWidth="w-80"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuHeader={<div className="font-semibold text-gray-900">通知</div>}
            menuItems={[
              {
                label: '新しいメッセージが届いています',
                onClick: () => window.alert('メッセージを表示'),
              },
              {
                label: '承認待ちのタスクがあります',
                onClick: () => window.alert('タスクを表示'),
              },
              {
                label: 'システムメンテナンスのお知らせ',
                onClick: () => window.alert('お知らせを表示'),
              },
            ]}
            onClose={closeMenu}
          />
        )}
      />

      {/* Outline スタイル */}
      <DropdownMenu
        icon={'bell'}
        variant="outline"
        menuWidth="w-80"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuHeader={<div className="font-semibold text-gray-900">通知</div>}
            menuItems={[
              {
                label: '新しいメッセージが届いています',
                onClick: () => window.alert('メッセージを表示'),
              },
              {
                label: '承認待ちのタスクがあります',
                onClick: () => window.alert('タスクを表示'),
              },
              {
                label: 'システムメンテナンスのお知らせ',
                onClick: () => window.alert('お知らせを表示'),
              },
            ]}
            onClose={closeMenu}
          />
        )}
      />
    </div>
  ),
};

// ========================================
// 新しい.Item構造を使用（トランプカードアニメーション）
// ========================================

export const WithCardDealAnimation: Story = {
  render: () => (
    <div className="flex gap-4">
      <DropdownMenu
        icon={'bell'}
        label="通知"
        variant="default"
        menuWidth="w-80"
        menuContent={(closeMenu: () => void) => (
          <MenuItemList
            menuHeader={
              <div className="font-semibold text-gray-900">
                🃏 トランプカードアニメーション
              </div>
            }
            onClose={closeMenu}
          >
            <MenuItemList.Item onClick={() => window.alert('アイテム1')}>
              <div className="flex items-center gap-3">
                <span className="text-fluid-2xl">📧</span>
                <div>
                  <div className="font-medium">新しいメッセージ</div>
                  <div className="text-fluid-xs text-gray-500">5分前</div>
                </div>
              </div>
            </MenuItemList.Item>
            <MenuItemList.Item onClick={() => window.alert('アイテム2')}>
              <div className="flex items-center gap-3">
                <span className="text-fluid-2xl">✅</span>
                <div>
                  <div className="font-medium">タスク完了</div>
                  <div className="text-fluid-xs text-gray-500">10分前</div>
                </div>
              </div>
            </MenuItemList.Item>
            <MenuItemList.Item onClick={() => window.alert('アイテム3')}>
              <div className="flex items-center gap-3">
                <span className="text-fluid-2xl">👤</span>
                <div>
                  <div className="font-medium">新しいフォロワー</div>
                  <div className="text-fluid-xs text-gray-500">30分前</div>
                </div>
              </div>
            </MenuItemList.Item>
            <MenuItemList.Item onClick={() => window.alert('アイテム4')}>
              <div className="flex items-center gap-3">
                <span className="text-fluid-2xl">💬</span>
                <div>
                  <div className="font-medium">コメントがあります</div>
                  <div className="text-fluid-xs text-gray-500">1時間前</div>
                </div>
              </div>
            </MenuItemList.Item>
            <MenuItemList.Item onClick={() => window.alert('アイテム5')}>
              <div className="flex items-center gap-3">
                <span className="text-fluid-2xl">🔔</span>
                <div>
                  <div className="font-medium">システム通知</div>
                  <div className="text-fluid-xs text-gray-500">2時間前</div>
                </div>
              </div>
            </MenuItemList.Item>
          </MenuItemList>
        )}
      />
    </div>
  ),
};

export const UserMenuWithAnimation: Story = {
  render: () => (
    <DropdownMenu
      label="山田 太郎"
      icon={'person'}
      variant="default"
      menuWidth="w-72"
      menuContent={(closeMenu: () => void) => (
        <MenuItemList
          menuHeader={
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-fluid-lg">
                山田
              </div>
              <div>
                <p className="text-fluid-sm font-bold text-gray-900">山田 太郎</p>
                <p className="text-fluid-xs text-gray-500">yamada@example.com</p>
              </div>
            </div>
          }
          onClose={closeMenu}
        >
          <MenuItemList.Item onClick={() => window.alert('プロフィール')}>
            <div className="flex items-center gap-3">
              <span className="text-fluid-xl">👤</span>
              <span>プロフィール</span>
            </div>
          </MenuItemList.Item>
          <MenuItemList.Item onClick={() => window.alert('アカウント設定')}>
            <div className="flex items-center gap-3">
              <span className="text-fluid-xl">⚙️</span>
              <span>アカウント設定</span>
            </div>
          </MenuItemList.Item>
          <MenuItemList.Item onClick={() => window.alert('お気に入り')}>
            <div className="flex items-center gap-3">
              <span className="text-fluid-xl">⭐</span>
              <span>お気に入り</span>
            </div>
          </MenuItemList.Item>
          <MenuItemList.Item onClick={() => window.alert('ヘルプ')}>
            <div className="flex items-center gap-3">
              <span className="text-fluid-xl">❓</span>
              <span>ヘルプ</span>
            </div>
          </MenuItemList.Item>
          <MenuItemList.Item onClick={() => window.alert('ログアウト')}>
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-fluid-xl">🚪</span>
              <span>ログアウト</span>
            </div>
          </MenuItemList.Item>
        </MenuItemList>
      )}
    />
  ),
};
