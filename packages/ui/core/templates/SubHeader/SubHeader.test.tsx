import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SubHeader } from './SubHeader';

describe('SubHeader（汎用）', () => {
  it('サブヘッダーが表示される', () => {
    const { container } = render(<SubHeader topOffset={48} />);
    expect(container.querySelector('[data-component="SubHeader"]')).toBeInTheDocument();
  });

  it('topOffset が正しく適用される', () => {
    const { container } = render(<SubHeader topOffset={60} />);
    const subHeader = container.querySelector('[data-component="SubHeader"]');
    expect(subHeader).toHaveStyle({ top: '60px' });
  });

  it('leftOffset が正しく適用される', () => {
    const { container } = render(<SubHeader topOffset={48} leftOffset={100} />);
    const subHeader = container.querySelector('[data-component="SubHeader"]');
    expect(subHeader).toHaveStyle({ left: '100px' });
  });

  it('leftOffset のデフォルト値は 0', () => {
    const { container } = render(<SubHeader topOffset={48} />);
    const subHeader = container.querySelector('[data-component="SubHeader"]');
    expect(subHeader).toHaveStyle({ left: '0px' });
  });

  it('children が表示される', () => {
    render(
      <SubHeader topOffset={48}>
        <div>SubHeader Content</div>
      </SubHeader>
    );
    expect(screen.getByText('SubHeader Content')).toBeInTheDocument();
  });

  it('className が追加される', () => {
    const { container } = render(<SubHeader topOffset={48} className="custom-class" />);
    const subHeader = container.querySelector('[data-component="SubHeader"]');
    expect(subHeader).toHaveClass('custom-class');
  });
});
