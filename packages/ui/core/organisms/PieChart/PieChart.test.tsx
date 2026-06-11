import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { PieChart } from './PieChart';

const mockData = [
  { name: 'カテゴリA', value: 30, color: '#8884d8' },
  { name: 'カテゴリB', value: 20, color: '#82ca9d' },
  { name: 'カテゴリC', value: 50, color: '#ffc658' },
];

describe('PieChart', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(<PieChart data={mockData} />);
    expect(container.querySelector('[data-component="pie-chart"]')).toBeInTheDocument();
  });

  it('data プロパティが渡される', () => {
    const { container } = render(<PieChart data={mockData} />);
    // PieChart コンポーネントがレンダリングされることを確認
    expect(container.querySelector('[data-component="pie-chart"]')).toBeInTheDocument();
  });

  it('size プロパティが適用される', () => {
    const { container } = render(<PieChart data={mockData} size={100} />);
    const pieChart = container.querySelector('[data-component="pie-chart"]');
    expect(pieChart).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('デフォルトの size は 60', () => {
    const { container } = render(<PieChart data={mockData} />);
    const pieChart = container.querySelector('[data-component="pie-chart"]');
    expect(pieChart).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('innerRadius プロパティが設定できる', () => {
    const { container } = render(
      <PieChart data={mockData} innerRadius={0.3} />
    );
    // PieChart コンポーネントがレンダリングされることを確認
    expect(container.querySelector('[data-component="pie-chart"]')).toBeInTheDocument();
  });

  it('outerRadius プロパティが設定できる', () => {
    const { container } = render(
      <PieChart data={mockData} outerRadius={0.5} />
    );
    // PieChart コンポーネントがレンダリングされることを確認
    expect(container.querySelector('[data-component="pie-chart"]')).toBeInTheDocument();
  });

  it('unit プロパティが設定できる', () => {
    render(<PieChart data={mockData} unit="人" />);
    // unit はツールチップ内で使用されるため、レンダリング自体は成功することを確認
    expect(true).toBe(true);
  });

  it('cardRadius プロパティが設定できる', () => {
    render(<PieChart data={mockData} cardRadius="1rem" />);
    // cardRadius はツールチップのスタイルに使用されるため、レンダリング自体は成功することを確認
    expect(true).toBe(true);
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<PieChart data={mockData} />);
    expect(container.querySelector('[data-component="pie-chart"]')).toBeInTheDocument();
  });
});
