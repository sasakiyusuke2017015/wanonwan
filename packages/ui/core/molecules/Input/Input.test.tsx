import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';


describe('Input', () => {
  it('入力フィールドがレンダリングされる', () => {
    render(<Input placeholder="テスト入力" />);
    expect(screen.getByPlaceholderText('テスト入力')).toBeInTheDocument();
  });

  it('値が正しく表示される', () => {
    render(<Input value="テスト値" onChange={() => {}} />);
    expect(screen.getByDisplayValue('テスト値')).toBeInTheDocument();
  });

  it('onChange イベントが発火する', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="入力" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('入力');

    await user.type(input, 'abc');
    expect(handleChange).toHaveBeenCalled();
  });

  it('disabled 状態では入力できない', () => {
    render(<Input placeholder="無効" disabled />);
    const input = screen.getByPlaceholderText('無効') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('type属性が正しく適用される', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('アイコンが表示される', () => {
    const { container } = render(<Input icon={'person'} placeholder="Icon" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('アイコンクリックイベントが発火する', async () => {
    const handleIconClick = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Input icon={'person'} onIconClick={handleIconClick} placeholder="Icon" />
    );

    const icon = container.querySelector('svg');
    if (icon) {
      await user.click(icon);
      expect(handleIconClick).toHaveBeenCalledTimes(1);
    }
  });

  it('onFocus イベントが発火する', async () => {
    const handleFocus = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="Focus" onFocus={handleFocus} />);
    const input = screen.getByPlaceholderText('Focus');

    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
  });

  it('onBlur イベントが発火する', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="Blur" onBlur={handleBlur} />);
    const input = screen.getByPlaceholderText('Blur');

    await user.click(input);
    await user.tab(); // フォーカスを外す

    expect(handleBlur).toHaveBeenCalled();
  });

  it('onKeyDown イベントが発火する', async () => {
    const handleKeyDown = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="KeyDown" onKeyDown={handleKeyDown} />);
    const input = screen.getByPlaceholderText('KeyDown');

    await user.type(input, '{Enter}');
    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('classNameが正しく適用される', () => {
    const { container } = render(<Input className="custom-input" placeholder="Custom" />);
    const wrapper = container.querySelector('.custom-input');
    expect(wrapper).toBeInTheDocument();
  });
});
