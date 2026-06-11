import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DevelopmentBanner } from './DevelopmentBanner';

describe('DevelopmentBanner', () => {
  it('メッセージを表示する', () => {
    render(<DevelopmentBanner message="この機能は開発中です" />);
    expect(screen.getByText('この機能は開発中です')).toBeInTheDocument();
  });

  it('タイトル「開発中」が表示される', () => {
    render(<DevelopmentBanner message="テスト" />);
    expect(screen.getByText('開発中')).toBeInTheDocument();
  });

  it('Bannerコンポーネントのvariantがwarningである', () => {
    const { container } = render(<DevelopmentBanner message="テスト" />);
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('bg-amber-50', 'border-amber-200');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <DevelopmentBanner message="テスト" className="custom-class" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('custom-class');
  });
});
