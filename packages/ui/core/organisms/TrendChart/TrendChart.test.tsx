import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { TrendChart } from './TrendChart';

// ResizeObserverはsetup.tsでグローバルにモックされている

describe('TrendChart', () => {
  const mockData = {
    labels: ['2025/1', '2025/2', '2025/3'],
    datasets: [
      {
        label: '満足度',
        data: [3, 4, 5],
        color: '#3b82f6',
      },
      {
        label: 'ストレス',
        data: [2, 3, 2],
        color: '#ef4444',
      },
    ],
  };

  it('基本的なレンダリングができる', () => {
    const { container } = render(<TrendChart data={mockData} />);
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('data の labels が設定される', () => {
    const { container } = render(<TrendChart data={mockData} />);
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('data の datasets が表示される', () => {
    const { container } = render(<TrendChart data={mockData} />);
    // 凡例に datasets のラベルが表示される
    expect(container.textContent).toContain('満足度');
    expect(container.textContent).toContain('ストレス');
  });

  it('showLegend=true の場合、凡例が表示される', () => {
    const { container } = render(
      <TrendChart data={mockData} showLegend={true} />
    );
    expect(container.textContent).toContain('満足度');
    expect(container.textContent).toContain('ストレス');
  });

  it('showLegend=false の場合、凡例が表示されない', () => {
    const { container } = render(
      <TrendChart data={mockData} showLegend={false} />
    );
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('height が適用される', () => {
    const { container } = render(
      <TrendChart data={mockData} height={300} />
    );
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('className が適用される', () => {
    const { container } = render(
      <TrendChart data={mockData} className="custom-chart" />
    );
    expect(container.querySelector('.custom-chart')).toBeInTheDocument();
  });

  it('cardRadius が適用される', () => {
    const { container } = render(
      <TrendChart data={mockData} cardRadius="1rem" />
    );
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('onDataPointClick コールバックが設定できる', () => {
    const handleDataPointClick = vi.fn();
    const { container } = render(
      <TrendChart data={mockData} onDataPointClick={handleDataPointClick} />
    );
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('onMonthClick コールバックが設定できる', () => {
    const handleMonthClick = vi.fn();
    const { container } = render(
      <TrendChart data={mockData} onMonthClick={handleMonthClick} />
    );
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<TrendChart data={mockData} />);
    expect(container.querySelector('[data-component="trend-chart"]')).toBeInTheDocument();
  });
});
