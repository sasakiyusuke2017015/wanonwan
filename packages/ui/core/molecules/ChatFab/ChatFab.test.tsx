import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatFab } from './ChatFab';

describe('ChatFab', () => {
  it('デフォルトのaria-labelが設定される', () => {
    render(<ChatFab onClick={() => {}} />);
    expect(screen.getByLabelText('チャットを開く')).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ChatFab onClick={handleClick} />);
    await user.click(screen.getByLabelText('チャットを開く'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<ChatFab onClick={() => {}} />);
    expect(container.querySelector('[data-component="chat-fab"]')).toBeInTheDocument();
  });

  it('カスタムaria-labelが設定される', () => {
    render(<ChatFab onClick={() => {}} ariaLabel="カスタムラベル" />);
    expect(screen.getByLabelText('カスタムラベル')).toBeInTheDocument();
  });
});
