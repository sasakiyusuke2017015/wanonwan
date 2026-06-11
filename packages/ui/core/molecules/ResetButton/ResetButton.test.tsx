import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetButton } from './ResetButton';

describe('ResetButton', () => {
  it('デフォルトラベル「リセット」を表示する', () => {
    render(<ResetButton onClick={() => {}} />);
    expect(screen.getByText('リセット')).toBeInTheDocument();
  });

  it('カスタムラベルを表示する', () => {
    render(<ResetButton onClick={() => {}} label="クリア" />);
    expect(screen.getByText('クリア')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ResetButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態ではクリックイベントが発火しない', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<ResetButton onClick={handleClick} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('variantがdangerである', () => {
    render(<ResetButton onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'danger');
  });

  it('sizeがsmallである', () => {
    render(<ResetButton onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-size', 'small');
  });
});
