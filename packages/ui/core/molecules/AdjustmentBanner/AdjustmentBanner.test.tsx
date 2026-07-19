import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdjustmentBanner } from './AdjustmentBanner';

describe('AdjustmentBanner', () => {
  it('メッセージを表示する', () => {
    render(<AdjustmentBanner message="この機能は調整中です" />);
    expect(screen.getByText('この機能は調整中です')).toBeInTheDocument();
  });

  it('タイトル「調整中」が表示される', () => {
    render(<AdjustmentBanner message="テスト" />);
    expect(screen.getByText('調整中')).toBeInTheDocument();
  });

  it('Bannerコンポーネントのvariantがinfoである', () => {
    const { container } = render(<AdjustmentBanner message="テスト" />);
    const banner = container.querySelector('[data-component="Banner"]');
    expect(banner).toHaveClass('banner--info');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <AdjustmentBanner message="テスト" className="custom-class" />
    );
    // className は内側の Banner に渡される
    const banner = container.querySelector('[data-component="Banner"]');
    expect(banner).toHaveClass('custom-class');
  });
});
