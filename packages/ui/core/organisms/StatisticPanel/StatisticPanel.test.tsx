import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatisticPanel } from './StatisticPanel';

describe('StatisticPanel', () => {
  it('データがない場合、emptyMessageが表示される', () => {
    render(<StatisticPanel totalValue={0} />);
    expect(screen.getByText('該当データなし')).toBeInTheDocument();
  });

  it('カスタムemptyMessageが表示される', () => {
    render(<StatisticPanel totalValue={0} emptyMessage="データなし" />);
    expect(screen.getByText('データなし')).toBeInTheDocument();
  });

  it('totalValue > 0の場合、data-component属性が設定される', () => {
    const items = [
      {
        statusDef: { value: 1, color: 'green', label: '完了', shortLabel: '完' },
        value: 5,
      },
    ];
    const { container } = render(<StatisticPanel items={items} totalValue={5} />);
    expect(container.querySelector('[data-component="statistic-panel"]')).toBeInTheDocument();
  });
});
