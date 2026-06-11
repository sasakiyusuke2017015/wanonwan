import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Header } from './Header';

describe('Header（汎用）', () => {
  it('ヘッダーが表示される', () => {
    const { container } = render(<Header height={48} />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<Header height={48} />);
    const header = container.querySelector('[data-component="Header"]');
    expect(header).toBeInTheDocument();
  });

  it('height が正しく適用される', () => {
    const { container } = render(<Header height={60} />);
    const header = container.querySelector('header');
    expect(header).toHaveStyle({ height: '60px' });
  });

  it('bgColor が正しく適用される', () => {
    const { container } = render(<Header height={48} bgColor="#123456" />);
    const header = container.querySelector('header');
    expect(header).toHaveStyle({ backgroundColor: '#123456' });
  });

  it('textColor が正しく適用される', () => {
    const { container } = render(<Header height={48} textColor="#ffffff" />);
    const header = container.querySelector('header');
    expect(header).toHaveStyle({ color: '#ffffff' });
  });

  it('borderColor が正しく適用される', () => {
    const { container } = render(<Header height={48} borderColor="#000000" />);
    const header = container.querySelector('header');
    expect(header).toHaveStyle({ borderBottom: '3px solid #000000' });
  });

  it('leftContent が表示される', () => {
    render(<Header height={48} leftContent={<div>Left</div>} />);
    expect(screen.getByText('Left')).toBeInTheDocument();
  });

  it('centerContent が表示される', () => {
    render(<Header height={48} centerContent={<div>Center</div>} />);
    expect(screen.getByText('Center')).toBeInTheDocument();
  });

  it('rightContent が表示される', () => {
    render(<Header height={48} rightContent={<div>Right</div>} />);
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('className が追加される', () => {
    const { container } = render(<Header height={48} className="custom-class" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-class');
  });
});
