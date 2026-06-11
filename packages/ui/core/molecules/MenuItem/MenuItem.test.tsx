import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';



import { MenuItem } from '../../molecules/MenuItem/MenuItem';

describe('MenuItem', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(<MenuItem label="テスト項目" />);
    expect(container.querySelector('[data-component="menu-item"]')).toBeInTheDocument();
    expect(screen.getByText('テスト項目')).toBeInTheDocument();
  });

  it('label が表示される', () => {
    render(<MenuItem label="設定" />);
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('アイコン名（文字列）を渡すとIconコンポーネントがレンダリングされる', () => {
    const { container } = render(
      <MenuItem icon={'gear'} label="設定" />
    );
    // Icon コンポーネントは svg 要素としてレンダリングされる
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('アイコン（ReactNode）を渡すとそのまま表示される', () => {
    render(<MenuItem icon={<span data-testid="custom-icon">🔧</span>} label="設定" />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('アイコンなしでもレンダリングできる', () => {
    const { container } = render(<MenuItem label="項目" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('クリックすると onClick が呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<MenuItem label="クリック" onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('クリックすると onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(<MenuItem label="閉じる" onClose={handleClose} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('onClick と onClose の両方が設定されている場合、両方呼ばれる', async () => {
    const handleClick = vi.fn();
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <MenuItem label="実行" onClick={handleClick} onClose={handleClose} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<MenuItem label="項目" />);
    expect(container.querySelector('[data-component="menu-item"]')).toBeInTheDocument();
  });

  it('button 要素としてレンダリングされる', () => {
    render(<MenuItem label="ボタン" />);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });
});
