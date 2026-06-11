import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatisticItem } from './StatisticItem';

describe('StatisticItem', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(
      <StatisticItem
        dotColor="bg-blue-500"
        label="テスト"
        labelColor="text-blue-600"
        value={10}
      />
    );
    expect(container.querySelector('[data-component="statistic-item"]')).toBeInTheDocument();
  });

  it('label が表示される', () => {
    render(
      <StatisticItem
        dotColor="bg-blue-500"
        label="完了"
        labelColor="text-blue-600"
        value={5}
      />
    );
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('value が表示される（数値）', () => {
    render(
      <StatisticItem
        dotColor="bg-green-500"
        label="項目"
        labelColor="text-green-600"
        value={42}
      />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('value が表示される（文字列）', () => {
    render(
      <StatisticItem
        dotColor="bg-red-500"
        label="状態"
        labelColor="text-red-600"
        value="完了"
      />
    );
    expect(screen.getByText('完了')).toBeInTheDocument();
  });

  it('unit が表示される', () => {
    const { container } = render(
      <StatisticItem
        dotColor="bg-purple-500"
        label="人数"
        labelColor="text-purple-600"
        value={10}
        unit="名"
      />
    );
    // value と unit は同じテキストノード内にあるため、まとめて確認
    expect(container.textContent).toContain('10名');
  });

  it('dotColor が適用される', () => {
    const { container } = render(
      <StatisticItem
        dotColor="bg-blue-500"
        label="テスト"
        labelColor="text-blue-600"
        value={1}
      />
    );
    const dot = container.querySelector('.bg-blue-500');
    expect(dot).toBeInTheDocument();
  });

  it('labelColor が適用される', () => {
    const { container } = render(
      <StatisticItem
        dotColor="bg-green-500"
        label="ラベル"
        labelColor="text-green-600"
        value={1}
      />
    );
    const label = container.querySelector('.text-green-600');
    expect(label).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(
      <StatisticItem
        dotColor="bg-blue-500"
        label="テスト"
        labelColor="text-blue-600"
        value={1}
      />
    );
    expect(container.querySelector('[data-component="statistic-item"]')).toBeInTheDocument();
  });
});
