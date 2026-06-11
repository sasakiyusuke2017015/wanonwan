import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplayButton } from './ReplayButton';

describe('ReplayButton', () => {
  it('デフォルトラベル「再生」が表示される', () => {
    render(<ReplayButton onClick={() => {}} />);
    expect(screen.getByText('再生')).toBeInTheDocument();
  });

  it('カスタムラベルが表示される', () => {
    render(<ReplayButton onClick={() => {}} label="リプレイ" />);
    expect(screen.getByText('リプレイ')).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ReplayButton onClick={handleClick} />);
    await user.click(screen.getByText('再生'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<ReplayButton onClick={() => {}} />);
    expect(container.querySelector('[data-component="replay-button"]')).toBeInTheDocument();
  });
});
