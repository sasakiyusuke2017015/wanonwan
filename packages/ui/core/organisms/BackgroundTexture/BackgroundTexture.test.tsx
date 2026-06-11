import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundTexture } from './BackgroundTexture';

describe('BackgroundTexture', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<BackgroundTexture theme="wood" />);
    expect(container.querySelector('[data-component="background-texture"]')).toBeInTheDocument();
  });

  it('data-theme属性が正しく設定される', () => {
    const { container } = render(<BackgroundTexture theme="fabric" />);
    const el = container.querySelector('[data-component="background-texture"]');
    expect(el).toHaveAttribute('data-theme', 'fabric');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<BackgroundTexture theme="wood" className="custom-bg" />);
    const el = container.querySelector('[data-component="background-texture"]');
    expect(el).toHaveClass('custom-bg');
  });
});
