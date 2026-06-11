import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FloatingElements } from './FloatingElements';

describe('FloatingElements', () => {
  it('デフォルトの浮遊要素がレンダリングされる', () => {
    const { container } = render(<FloatingElements />);
    const elements = container.querySelectorAll('.animate-pulse');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('カスタム要素が指定数レンダリングされる', () => {
    const customElements = [
      { position: 'top-0 left-0', size: 'w-10 h-10', gradient: 'from-red-400/10 to-blue-400/10', blur: 'blur-xl' },
      { position: 'bottom-0 right-0', size: 'w-20 h-20', gradient: 'from-green-400/10 to-yellow-400/10', blur: 'blur-2xl' },
    ];
    const { container } = render(<FloatingElements elements={customElements} />);
    const elements = container.querySelectorAll('.animate-pulse');
    expect(elements.length).toBe(2);
  });

  it('空の配列を渡すと何もレンダリングされない', () => {
    const { container } = render(<FloatingElements elements={[]} />);
    const elements = container.querySelectorAll('.animate-pulse');
    expect(elements.length).toBe(0);
  });
});
