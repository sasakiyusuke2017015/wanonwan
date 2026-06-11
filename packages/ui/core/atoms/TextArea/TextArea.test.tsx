import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('テキストエリアがレンダリングされる', () => {
    const { container } = render(<TextArea />);
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<TextArea label="コメント" id="comment" />);
    expect(screen.getByText('コメント')).toBeInTheDocument();
  });

  it('required時にアスタリスクが表示される', () => {
    render(<TextArea label="コメント" id="comment" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('placeholder が表示される', () => {
    render(<TextArea placeholder="ここに入力してください" />);
    expect(screen.getByPlaceholderText('ここに入力してください')).toBeInTheDocument();
  });

  it('value が表示される', () => {
    const { container } = render(<TextArea value="テスト文章" readOnly />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('テスト文章');
  });

  it('onChange イベントが発火する', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<TextArea onChange={handleChange} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.type(textarea, 'テスト');
    expect(handleChange).toHaveBeenCalled();
  });

  it('onFocus イベントが発火する', async () => {
    const handleFocus = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<TextArea onFocus={handleFocus} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.click(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('onBlur イベントが発火する', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<TextArea onBlur={handleBlur} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await user.click(textarea);
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('disabled 状態では入力できない', () => {
    const { container } = render(<TextArea disabled />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
  });

  it('variant属性が正しく適用される', () => {
    const { container, rerender } = render(<TextArea variant="default" />);
    expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument();

    rerender(<TextArea variant="dark" />);
    expect(container.querySelector('[data-variant="dark"]')).toBeInTheDocument();

    rerender(<TextArea variant="outlined" />);
    expect(container.querySelector('[data-variant="outlined"]')).toBeInTheDocument();
  });

  it('size属性が正しく適用される', () => {
    const { container, rerender } = render(<TextArea size="small" />);
    expect(container.querySelector('[data-size="small"]')).toBeInTheDocument();

    rerender(<TextArea size="medium" />);
    expect(container.querySelector('[data-size="medium"]')).toBeInTheDocument();

    rerender(<TextArea size="large" />);
    expect(container.querySelector('[data-size="large"]')).toBeInTheDocument();
  });

  it('error時にエラーメッセージが表示される', () => {
    render(<TextArea error errorMessage="入力内容にエラーがあります" />);
    expect(screen.getByText('入力内容にエラーがあります')).toBeInTheDocument();
  });

  it('error時にエラースタイルが適用される', () => {
    const { container } = render(<TextArea error />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('border-2', 'border-red-500');
  });

  it('rows属性が正しく適用される', () => {
    const { container } = render(<TextArea rows={6} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('borderRadiusプロパティがstyle属性に適用される', () => {
    const { container } = render(<TextArea borderRadius="1rem" />);
    const textarea = container.querySelector('textarea');
    expect(textarea?.getAttribute('style')).toContain('border-radius: 1rem');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<TextArea className="custom-textarea" />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('custom-textarea');
  });
});
