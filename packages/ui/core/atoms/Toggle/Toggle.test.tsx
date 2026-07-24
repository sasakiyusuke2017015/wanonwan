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

  // 寸法値そのものは SCSS Modules の責務なので、公開契約である data-size で検証する
  // (Tailwind ユーティリティ前提の .w-8 等はスタイル移行で消滅している)
  it.each(['small', 'medium', 'large'] as const)('size=%s が data-size に反映される', (size) => {
    const { container } = render(<Toggle size={size} />);
    expect(container.querySelector('[data-component="toggle"]')).toHaveAttribute('data-size', size);
  });

  // label の有無で data-size を付ける要素が変わるため、両方の分岐を通す
  it('label 付きでも data-size が反映される', () => {
    const { container } = render(<Toggle label="有効" size="large" />);
    expect(container.querySelector('[data-component="toggle"]')).toHaveAttribute(
      'data-size',
      'large',
    );
  });
});
