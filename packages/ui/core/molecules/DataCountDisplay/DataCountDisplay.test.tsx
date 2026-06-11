import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataCountDisplay } from './DataCountDisplay';

describe('DataCountDisplay', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<DataCountDisplay totalCount={10} />);
    expect(container.querySelector('[data-component="data-count-display"]')).toBeInTheDocument();
  });

  it('「表示:」ラベルが表示される', () => {
    render(<DataCountDisplay totalCount={5} />);
    expect(screen.getByText(/表示/)).toBeInTheDocument();
  });

  it('loading中は「...」が表示される', () => {
    render(<DataCountDisplay totalCount={5} loading={true} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('selectedCount > 0の場合、「選択:」ラベルが表示される', () => {
    render(<DataCountDisplay totalCount={10} selectedCount={3} />);
    expect(screen.getByText(/選択/)).toBeInTheDocument();
  });
});
