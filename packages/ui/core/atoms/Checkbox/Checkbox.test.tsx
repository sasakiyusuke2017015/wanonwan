import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('チェックボックスがレンダリングされる', () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Checkbox label="同意する" />);
    expect(screen.getByText('同意する')).toBeInTheDocument();
  });

  it('onChange イベントが発火する', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Checkbox onChange={handleChange} />);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('checked 状態が正しく適用される', () => {
    const { container } = render(<Checkbox checked readOnly />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('disabled 状態では操作できない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Checkbox disabled onChange={handleChange} />);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('variant属性が正しく適用される', () => {
    const { container, rerender } = render(<Checkbox variant="default" />);
    expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument();

    rerender(<Checkbox variant="primary" />);
    expect(container.querySelector('[data-variant="primary"]')).toBeInTheDocument();
  });

  it('size属性が正しく適用される', () => {
    const { container, rerender } = render(<Checkbox size="small" />);
    let checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toHaveClass('h-3.5', 'w-3.5');

    rerender(<Checkbox size="medium" />);
    checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toHaveClass('h-4', 'w-4');

    rerender(<Checkbox size="large" />);
    checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toHaveClass('h-5', 'w-5');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Checkbox className="custom-checkbox" />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toHaveClass('custom-checkbox');
  });

  it('カスタムlabelClassNameが適用される', () => {
    render(<Checkbox label="テスト" labelClassName="custom-label" />);
    const label = screen.getByText('テスト');
    expect(label).toHaveClass('custom-label');
  });

  it('disabled時にcursor-not-allowedクラスが追加される', () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toHaveClass('cursor-not-allowed');
  });
});
