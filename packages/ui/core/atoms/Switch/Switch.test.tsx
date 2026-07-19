import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('ラベルが表示される', () => {
    render(<Switch label="通知を有効化" checked={false} />);
    expect(screen.getByText('通知を有効化')).toBeInTheDocument();
  });

  it('ラベルなしで表示される', () => {
    const { container } = render(<Switch checked={false} />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('role="switch" が付与される', () => {
    render(<Switch checked={false} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('checked状態が正しく適用される', () => {
    render(<Switch checked={true} />);
    const input = screen.getByRole('switch');
    expect(input).toBeChecked();
  });

  it('unchecked状態が正しく適用される', () => {
    render(<Switch checked={false} />);
    const input = screen.getByRole('switch');
    expect(input).not.toBeChecked();
  });

  it('クリックでonChangeに次の値 (生値) が渡る', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch checked={false} onChange={handleChange} />);

    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('ON 状態でクリックすると false が渡る', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch checked={true} onChange={handleChange} />);

    await user.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('disabled状態では変更できない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch checked={false} onChange={handleChange} disabled />);
    const input = screen.getByRole('switch');

    expect(input).toBeDisabled();
    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it.each(['default', 'primary', 'neutral'] as const)(
    'variantが%sの場合、data-variant属性が設定される',
    (variant) => {
      const { container } = render(<Switch checked={false} variant={variant} />);
      const toggle = container.querySelector('[data-component="switch"]');
      expect(toggle).toHaveAttribute('data-variant', variant);
    }
  );

  it.each(['small', 'medium', 'large'] as const)(
    'sizeが%sの場合、対応するサイズクラスが付く',
    (size) => {
      const { container } = render(<Switch checked={false} size={size} />);
      const toggleContainer = container.querySelector(`.${size}`);
      expect(toggleContainer).toBeInTheDocument();
    }
  );
});
