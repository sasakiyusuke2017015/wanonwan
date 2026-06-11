import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SideNav } from './SideNav';

describe('SideNav（汎用）', () => {
  it('サイドナビが表示される', () => {
    const { container } = render(<SideNav width={60} topOffset={48} />);
    expect(container.querySelector('[data-component="SideNav"]')).toBeInTheDocument();
  });

  it('width が正しく適用される', () => {
    const { container } = render(<SideNav width={100} topOffset={48} />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveStyle({ width: '100px' });
  });

  it('topOffset が正しく適用される', () => {
    const { container } = render(<SideNav width={60} topOffset={60} />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveStyle({ top: '60px' });
  });

  it('isOpen=true の場合、left:0 になる', () => {
    const { container } = render(<SideNav width={60} topOffset={48} isOpen={true} />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveStyle({ left: '0' });
  });

  it('isOpen=false の場合、left が負の値になる', () => {
    const { container } = render(<SideNav width={60} topOffset={48} isOpen={false} />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveStyle({ left: '-60px' });
  });

  it('bgColor が正しく適用される', () => {
    const { container } = render(<SideNav width={60} topOffset={48} bgColor="#123456" />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveStyle({ backgroundColor: '#123456' });
  });

  it('children が表示される', () => {
    render(
      <SideNav width={60} topOffset={48}>
        <div>Nav Content</div>
      </SideNav>
    );
    expect(screen.getByText('Nav Content')).toBeInTheDocument();
  });

  it('className が追加される', () => {
    const { container } = render(<SideNav width={60} topOffset={48} className="custom-class" />);
    const sideNav = container.querySelector('[data-component="SideNav"]');
    expect(sideNav).toHaveClass('custom-class');
  });
});
