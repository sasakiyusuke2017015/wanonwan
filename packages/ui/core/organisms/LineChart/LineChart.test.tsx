import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LineChart } from './LineChart';

describe('LineChart', () => {
  const mockData = {
    labels: ['1月', '2月', '3月', '4月', '5月'],
    datasets: [
      {
        label: 'データセット1',
        data: [10, 20, 15, 25, 30],
        color: '#3b82f6',
      },
    ],
  };

  it('チャートがレンダリングされる', () => {
    const { container } = render(<LineChart data={mockData} />);
    expect(container.querySelector('[data-component="line-chart"]')).toBeInTheDocument();
  });

  it('SVG要素がレンダリングされる', () => {
    const { container } = render(<LineChart data={mockData} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('データがない場合に"No data"が表示される', () => {
    const { container } = render(<LineChart data={null!} />);
    expect(container.textContent).toBe('No data');
  });

  it('ラベルが正しく表示される', () => {
    const { container } = render(<LineChart data={mockData} />);
    const labels = container.querySelectorAll('text');
    const labelTexts = Array.from(labels).map((el) => el.textContent);
    expect(labelTexts.some((text) => text?.includes('1月'))).toBe(true);
    expect(labelTexts.some((text) => text?.includes('5月'))).toBe(true);
  });

  it('データポイントが正しく表示される', () => {
    const { container } = render(<LineChart data={mockData} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(mockData.datasets[0].data.length);
  });

  it('折れ線が表示される', () => {
    const { container } = render(<LineChart data={mockData} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
  });

  it('凡例が表示される', () => {
    const { container } = render(<LineChart data={mockData} />);
    const legendText = Array.from(container.querySelectorAll('text')).find(
      (el) => el.textContent === 'データセット1'
    );
    expect(legendText).toBeInTheDocument();
  });

  it('複数のデータセットが表示される', () => {
    const multiDatasetData = {
      labels: ['1月', '2月', '3月'],
      datasets: [
        { label: 'データA', data: [10, 20, 15], color: '#3b82f6' },
        { label: 'データB', data: [5, 15, 25], color: '#ef4444' },
      ],
    };
    const { container } = render(<LineChart data={multiDatasetData} />);
    const polylines = container.querySelectorAll('polyline');
    expect(polylines.length).toBe(2);
  });

  it('height属性が正しく適用される', () => {
    const { container } = render(<LineChart data={mockData} height={400} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<LineChart data={mockData} className="custom-chart" />);
    const chartDiv = container.querySelector('[data-component="line-chart"]');
    expect(chartDiv).toHaveClass('custom-chart');
  });
});
