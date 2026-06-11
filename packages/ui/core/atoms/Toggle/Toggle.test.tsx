import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('ラベルが表示される', () => {
    render(<Toggle label="通知を有効化" />);
    expect(screen.getByText('通知を有効化')).toBeInTheDocument();
  });

  it('ラベルなしで表示される', () => {
    const { container } = render(<Toggle />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('checked状態が正しく適用される', () => {
    render(<Toggle checked={true} />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
  });

  it('unchecked状態が正しく適用される', () => {
    render(<Toggle checked={false} />);
    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  it('クリックでonChangeが呼ばれる', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Toggle onChange={handleChange} />);

    await user.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled状態では変更できない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Toggle onChange={handleChange} disabled />);
    const input = screen.getByRole('checkbox');

    expect(input).toBeDisabled();
    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('variantがdefaultの場合、data-variant属性が設定される', () => {
    const { container } = render(<Toggle variant="default" />);
    const toggle = container.querySelector('[data-component="toggle"]');
    expect(toggle).toHaveAttribute('data-variant', 'default');
  });

  it('variantがprimaryの場合、data-variant属性が設定される', () => {
    const { container } = render(<Toggle variant="primary" />);
    const toggle = container.querySelector('[data-component="toggle"]');
    expect(toggle).toHaveAttribute('data-variant', 'primary');
  });

  it('sizeがsmallの場合、小さいトグルが表示される', () => {
    const { container } = render(<Toggle size="small" />);
    const toggleContainer = container.querySelector('.w-8');
    expect(toggleContainer).toBeInTheDocument();
  });

  it('sizeがmediumの場合、中サイズのトグルが表示される', () => {
    const { container } = render(<Toggle size="medium" />);
    const toggleContainer = container.querySelector('.w-11');
    expect(toggleContainer).toBeInTheDocument();
  });

  it('sizeがlargeの場合、大きいトグルが表示される', () => {
    const { container } = render(<Toggle size="large" />);
    const toggleContainer = container.querySelector('.w-14');
    expect(toggleContainer).toBeInTheDocument();
  });
});
