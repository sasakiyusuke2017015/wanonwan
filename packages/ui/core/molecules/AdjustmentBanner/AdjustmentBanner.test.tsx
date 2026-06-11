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
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <AdjustmentBanner message="テスト" className="custom-class" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('custom-class');
  });
});
