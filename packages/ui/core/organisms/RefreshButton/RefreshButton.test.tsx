import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefreshButton } from './RefreshButton';

describe('RefreshButton', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<RefreshButton onRefresh={() => {}} />);
    expect(container.querySelector('[data-component="refresh-button"]')).toBeInTheDocument();
  });

  it('dataUpdatedAtが未指定の場合「...」が表示される', () => {
    render(<RefreshButton onRefresh={() => {}} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('ボタンクリック時にonRefreshが呼ばれる', async () => {
    const handleRefresh = vi.fn();
    const user = userEvent.setup();
    render(<RefreshButton onRefresh={handleRefresh} />);
    await user.click(screen.getByTitle('データを更新'));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
