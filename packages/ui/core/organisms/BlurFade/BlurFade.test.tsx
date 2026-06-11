import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlurFade } from './blur-fade';

describe('BlurFade', () => {
  it('子要素が表示される', () => {
    render(<BlurFade>テストコンテンツ</BlurFade>);
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<BlurFade>内容</BlurFade>);
    expect(container.querySelector('[data-component="blur-fade"]')).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<BlurFade className="custom-fade">内容</BlurFade>);
    const el = container.querySelector('[data-component="blur-fade"]');
    expect(el).toHaveClass('custom-fade');
  });
});
