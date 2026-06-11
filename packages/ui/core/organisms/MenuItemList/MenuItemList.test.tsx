import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';



import { MenuItemList } from './MenuItemList';

describe('MenuItemList', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(<MenuItemList />);
    expect(container.querySelector('[data-component="menu-item-list"]')).toBeInTheDocument();
  });

  it('menuHeader が表示される', () => {
    render(
      <MenuItemList menuHeader={<div data-testid="header">ヘッダー</div>} />
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('ヘッダー')).toBeInTheDocument();
  });

  it('menuItems 配列（旧方式）でメニューアイテムが表示される', () => {
    const menuItems = [
      { label: '項目1', icon: 'gear' },
      { label: '項目2', icon: 'person' },
    ];
    render(<MenuItemList menuItems={menuItems} />);

    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
  });

  it('menuItems の onClick が呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const menuItems = [{ label: 'クリック項目', onClick: handleClick }];
    render(<MenuItemList menuItems={menuItems} />);

    const button = screen.getByText('クリック項目');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('menuItems のクリックで onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    const menuItems = [{ label: '項目' }];
    render(<MenuItemList menuItems={menuItems} onClose={handleClose} />);

    const button = screen.getByText('項目');
    await user.click(button);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('children（Compound Component）でメニューアイテムが表示される', () => {
    render(
      <MenuItemList>
        <MenuItemList.Item>子要素1</MenuItemList.Item>
        <MenuItemList.Item>子要素2</MenuItemList.Item>
      </MenuItemList>
    );

    expect(screen.getByText('子要素1')).toBeInTheDocument();
    expect(screen.getByText('子要素2')).toBeInTheDocument();
  });

  it('MenuItemList.Item の onClick が呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItemList>
        <MenuItemList.Item onClick={handleClick}>
          クリック可能項目
        </MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByText('クリック可能項目');
    await user.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('MenuItemList.Item のクリックで onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItemList onClose={handleClose}>
        <MenuItemList.Item>項目</MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByText('項目');
    await user.click(item);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('preventClose=true の場合、onClose が呼ばれない', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItemList onClose={handleClose}>
        <MenuItemList.Item preventClose={true}>項目</MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByText('項目');
    await user.click(item);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('MenuItemList.Item が role="menuitem" を持つ', () => {
    render(
      <MenuItemList>
        <MenuItemList.Item>項目</MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByRole('menuitem');
    expect(item).toBeInTheDocument();
  });

  it('MenuItemList.Item で Enter キーを押すと onClick が呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItemList>
        <MenuItemList.Item onClick={handleClick}>項目</MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByRole('menuitem');
    item.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('MenuItemList.Item で Space キーを押すと onClick が呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItemList>
        <MenuItemList.Item onClick={handleClick}>項目</MenuItemList.Item>
      </MenuItemList>
    );

    const item = screen.getByRole('menuitem');
    item.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
