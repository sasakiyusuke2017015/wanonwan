import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer（汎用）', () => {
  it('children が未指定の場合、何も表示されない', () => {
    const { container } = render(<Footer height={40} />);
    expect(container.querySelector('footer')).not.toBeInTheDocument();
  });

  it('children が指定された場合、フッターが表示される', () => {
    render(<Footer height={40}>フッターコンテンツ</Footer>);
    expect(screen.getByText('フッターコンテンツ')).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<Footer height={40}>test</Footer>);
    const footer = container.querySelector('[data-component="Footer"]');
    expect(footer).toBeInTheDocument();
  });

  it('height が正しく適用される', () => {
    const { container } = render(<Footer height={60}>test</Footer>);
    const footer = container.querySelector('footer');
    expect(footer).toHaveStyle({ height: '60px' });
  });

  it('leftOffset が正しく適用される', () => {
    const { container } = render(
      <Footer height={40} leftOffset={100}>
        test
      </Footer>
    );
    const footer = container.querySelector('footer');
    expect(footer).toHaveStyle({ left: '100px' });
  });

  it('bottomOffset が正しく適用される', () => {
    const { container } = render(
      <Footer height={40} bottomOffset={50}>
        test
      </Footer>
    );
    const footer = container.querySelector('footer');
    expect(footer).toHaveStyle({ bottom: '50px' });
  });

  it('className が追加される', () => {
    const { container } = render(
      <Footer height={40} className="custom-class">
        test
      </Footer>
    );
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('style が追加される', () => {
    const { container } = render(
      <Footer height={40} style={{ backgroundColor: 'red' }}>
        test
      </Footer>
    );
    const footer = container.querySelector('footer');
    expect(footer).toHaveStyle({ backgroundColor: 'red' });
  });
});
