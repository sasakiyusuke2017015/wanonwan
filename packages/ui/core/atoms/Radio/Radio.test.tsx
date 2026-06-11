import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from './Radio';

describe('Radio', () => {
  it('ラジオボタンがレンダリングされる', () => {
    const { container } = render(<Radio />);
    const radio = container.querySelector('input[type="radio"]');
    expect(radio).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Radio label="オプション1" />);
    expect(screen.getByText('オプション1')).toBeInTheDocument();
  });

  it('onChange イベントが発火する', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Radio onChange={handleChange} />);

    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    await user.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('checked 状態が正しく適用される', () => {
    const { container } = render(<Radio checked readOnly />);
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it('disabled 状態では操作できない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Radio disabled onChange={handleChange} />);

    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio).toBeDisabled();
    await user.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('variant属性が正しく適用される', () => {
    const { container, rerender } = render(<Radio variant="default" />);
    expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument();

    rerender(<Radio variant="primary" />);
    expect(container.querySelector('[data-variant="primary"]')).toBeInTheDocument();
  });

  it('size属性が正しく適用される', () => {
    const { container, rerender } = render(<Radio size="small" />);
    let radio = container.querySelector('input[type="radio"]');
    expect(radio).toHaveClass('h-3.5', 'w-3.5');

    rerender(<Radio size="medium" />);
    radio = container.querySelector('input[type="radio"]');
    expect(radio).toHaveClass('h-4', 'w-4');

    rerender(<Radio size="large" />);
    radio = container.querySelector('input[type="radio"]');
    expect(radio).toHaveClass('h-5', 'w-5');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Radio className="custom-radio" />);
    const radio = container.querySelector('input[type="radio"]');
    expect(radio).toHaveClass('custom-radio');
  });

  it('カスタムlabelClassNameが適用される', () => {
    render(<Radio label="テスト" labelClassName="custom-label" />);
    const label = screen.getByText('テスト');
    expect(label).toHaveClass('custom-label');
  });

  it('disabled時にcursor-not-allowedクラスが追加される', () => {
    const { container } = render(<Radio disabled />);
    const radio = container.querySelector('input[type="radio"]');
    expect(radio).toHaveClass('cursor-not-allowed');
  });

  it('name属性でグループ化される', () => {
    const { container } = render(
      <div>
        <Radio name="group1" value="option1" />
        <Radio name="group1" value="option2" />
      </div>
    );

    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios[0]).toHaveAttribute('name', 'group1');
    expect(radios[1]).toHaveAttribute('name', 'group1');
  });
});
