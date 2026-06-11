import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';



import { DropdownMenu } from './DropdownMenu';

describe('DropdownMenu', () => {
  it('基本的なレンダリングができる', () => {
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>メニューコンテンツ</div>}
      />
    );
    expect(screen.getByText('メニュー')).toBeInTheDocument();
  });

  it('label が表示される', () => {
    render(
      <DropdownMenu
        label="テストメニュー"
        menuContent={<div>コンテンツ</div>}
      />
    );
    expect(screen.getByText('テストメニュー')).toBeInTheDocument();
  });

  it('icon が表示される（IconName文字列）', () => {
    const { container } = render(
      <DropdownMenu
        label="メニュー"
        icon={'hamburger'}
        menuContent={<div>コンテンツ</div>}
      />
    );
    // Icon コンポーネントは svg 要素
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('icon が表示される（ReactNode）', () => {
    render(
      <DropdownMenu
        label="メニュー"
        icon={<span data-testid="custom-icon">🔧</span>}
        menuContent={<div>コンテンツ</div>}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('初期状態ではメニューが閉じている', () => {
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>メニューコンテンツ</div>}
      />
    );
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });

  it('ボタンをクリックするとメニューが開く', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>メニューコンテンツ</div>}
      />
    );

    const button = screen.getByText('メニュー');
    await user.click(button);

    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();
  });

  it('メニューが開いている時にボタンをクリックすると閉じる', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>メニューコンテンツ</div>}
      />
    );

    const button = screen.getByText('メニュー');
    await user.click(button); // 開く
    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();

    await user.click(button); // 閉じる
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });

  it('menuContent が関数の場合、closeMenu コールバックが渡される', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={(closeMenu) => (
          <div>
            <button onClick={closeMenu}>閉じる</button>
          </div>
        )}
      />
    );

    const menuButton = screen.getByText('メニュー');
    await user.click(menuButton);

    const closeButton = screen.getByText('閉じる');
    await user.click(closeButton);

    expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
  });

  it('variant="outline" の場合、Button コンポーネントが使用される', () => {
    const { container } = render(
      <DropdownMenu
        variant="outline"
        label="アウトライン"
        menuContent={<div>コンテンツ</div>}
      />
    );
    // Button コンポーネントは data-component="button" を持つ
    expect(container.querySelector('[data-component="button"]')).toBeInTheDocument();
  });

  it('variant="default" の場合、カスタムボタンが使用される', () => {
    render(
      <DropdownMenu
        variant="default"
        label="デフォルト"
        menuContent={<div>コンテンツ</div>}
      />
    );
    const button = screen.getByText('デフォルト');
    expect(button.tagName).toBe('SPAN');
  });

  it('className が適用される', () => {
    const { container } = render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>コンテンツ</div>}
        className="custom-dropdown"
      />
    );
    expect(container.querySelector('.custom-dropdown')).toBeInTheDocument();
  });
});
