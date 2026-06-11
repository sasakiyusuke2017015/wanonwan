import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatisticList } from './StatisticList';

describe('StatisticList', () => {
  const mockItems = [
    {
      dotColor: 'bg-blue-500',
      label: '完了',
      labelColor: 'text-blue-600',
      value: 10,
      unit: '件',
    },
    {
      dotColor: 'bg-green-500',
      label: '進行中',
      labelColor: 'text-green-600',
      value: 5,
      unit: '件',
    },
  ];

  it('基本的なレンダリングができる', () => {
    const { container } = render(<StatisticList items={[]} />);
    expect(container.querySelector('[data-component="statistic-list"]')).toBeInTheDocument();
  });

  it('items が表示される', () => {
    render(<StatisticList items={mockItems} />);
    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('items の値が表示される', () => {
    render(<StatisticList items={mockItems} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('items の単位が表示される', () => {
    const { container } = render(<StatisticList items={mockItems} />);
    // 単位は値と同じ要素内にあるため、textContent で確認
    expect(container.textContent).toContain('10件');
    expect(container.textContent).toContain('5件');
  });

  it('totalLabel が表示される', () => {
    render(
      <StatisticList items={mockItems} totalLabel="全" totalValue={15} />
    );
    expect(screen.getByText('全')).toBeInTheDocument();
  });

  it('totalValue が表示される', () => {
    render(
      <StatisticList items={mockItems} totalLabel="全" totalValue={15} />
    );
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('totalUnit が表示される', () => {
    const { container } = render(
      <StatisticList
        items={mockItems}
        totalLabel="全"
        totalValue={15}
        totalUnit="件"
      />
    );
    expect(container.textContent).toContain('15件');
  });

  it('total が undefined の場合、合計が表示されない', () => {
    render(<StatisticList items={mockItems} />);
    expect(screen.queryByText('全')).not.toBeInTheDocument();
  });

  it('items と total がある場合、区切り線が表示される', () => {
    render(
      <StatisticList items={mockItems} totalLabel="全" totalValue={15} />
    );
    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('items が空で total がある場合、区切り線が表示されない', () => {
    render(
      <StatisticList items={[]} totalLabel="全" totalValue={0} />
    );
    expect(screen.queryByText('|')).not.toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(<StatisticList items={mockItems} />);
    expect(container.querySelector('[data-component="statistic-list"]')).toBeInTheDocument();
  });
});
