import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BackButton } from './BackButton';

describe('BackButton', () => {
  it('デフォルトラベル「戻る」が表示される', () => {
    render(<BackButton onClick={() => {}} />);
    expect(screen.getByText('戻る')).toBeInTheDocument();
  });

  it('カスタムラベルが表示される', () => {
    render(<BackButton onClick={() => {}} label="一覧に戻る" />);
    expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<BackButton onClick={handleClick} />);
    await user.click(screen.getByText('戻る'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<BackButton onClick={() => {}} />);
    expect(container.querySelector('[data-component="back-button"]')).toBeInTheDocument();
  });
});
