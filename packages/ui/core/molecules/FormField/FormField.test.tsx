import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from './FormField';

describe('FormField', () => {
  it('FormFieldがレンダリングされる', () => {
    const { container } = render(<FormField />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<FormField label="ユーザー名" />);
    expect(screen.getByText('ユーザー名')).toBeInTheDocument();
  });

  it('required マークが表示される', () => {
    render(<FormField label="メールアドレス" required />);
    expect(screen.getByText('必須')).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(<FormField label="パスワード" error="パスワードが短すぎます" />);
    expect(screen.getByText('パスワードが短すぎます')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(
      <FormField label="カスタム">
        <div>カスタムコンテンツ</div>
      </FormField>
    );
    expect(screen.getByText('カスタムコンテンツ')).toBeInTheDocument();
  });

  it('Input として使用できる (type, value, onChange)', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <FormField
        label="メール"
        type="email"
        value=""
        onChange={handleChange}
        placeholder="example@example.com"
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('example@example.com');

    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<FormField className="custom-form-field" />);
    expect(container.firstChild).toHaveClass('custom-form-field');
  });

  it('mb-4 クラスがデフォルトで適用される', () => {
    const { container } = render(<FormField />);
    expect(container.firstChild).toHaveClass('mb-4');
  });

  it('id属性が正しく適用される', () => {
    const { container } = render(<FormField id="test-field" />);
    expect(container.firstChild).toHaveAttribute('id', 'test-field');
  });

  it('style属性が適用される', () => {
    const { container } = render(<FormField style={{ backgroundColor: 'red' }} />);
    const div = container.firstChild as HTMLDivElement;
    expect(div.style.backgroundColor).toBe('red');
  });
});
