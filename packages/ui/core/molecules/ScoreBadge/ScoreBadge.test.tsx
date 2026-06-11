import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScoreBadge } from './ScoreBadge';

describe('ScoreBadge', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<ScoreBadge score={4.5} />);
    expect(container.querySelector('[data-component="score-badge"]')).toBeInTheDocument();
  });

  it('スコア値が表示される', () => {
    const { container } = render(<ScoreBadge score={3.8} />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it('showValue=falseの場合、Badgeのvalueが空になる', () => {
    const { container } = render(<ScoreBadge score={4.0} showValue={false} />);
    expect(container.querySelector('[data-component="score-badge"]')).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<ScoreBadge score={2.0} className="custom" />);
    expect(container.querySelector('[data-component="score-badge"]')).toBeInTheDocument();
  });
});
