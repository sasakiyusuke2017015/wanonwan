import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthFormCard } from './AuthFormCard';

describe('AuthFormCard', () => {
  it('子要素が表示される', () => {
    render(<AuthFormCard><p>フォーム内容</p></AuthFormCard>);
    expect(screen.getByText('フォーム内容')).toBeInTheDocument();
  });

  it('デフォルトのコピーライトテキストが表示される', () => {
    render(<AuthFormCard><p>内容</p></AuthFormCard>);
    expect(screen.getByText('© 2026 SMS DataTech')).toBeInTheDocument();
  });

  it('カスタムコピーライトテキストが表示される', () => {
    render(<AuthFormCard copyrightText="© 2026 Custom"><p>内容</p></AuthFormCard>);
    expect(screen.getByText('© 2026 Custom')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<AuthFormCard><p>内容</p></AuthFormCard>);
    expect(container.querySelector('[data-component="auth-form-card"]')).toBeInTheDocument();
  });
});
