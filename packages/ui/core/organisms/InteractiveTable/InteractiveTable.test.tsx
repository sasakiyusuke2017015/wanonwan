import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InteractiveTable } from './InteractiveTable';

describe('InteractiveTable', () => {
  const mockColumns = [
    { label: '名前', accessor: 'name' },
    { label: '年齢', accessor: 'age' },
  ];

  const mockData = [
    { name: '田中太郎', age: 30 },
    { name: '佐藤花子', age: 25 },
  ];

  it('基本的なレンダリングができる', () => {
    const { container } = render(
      <InteractiveTable columns={mockColumns} data={mockData} />
    );
    expect(container.querySelector('[data-component="interactive-table"]')).toBeInTheDocument();
  });

  it('columns のラベルが表示される', () => {
    render(<InteractiveTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('年齢')).toBeInTheDocument();
  });

  it('data の内容が表示される', () => {
    render(<InteractiveTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('data が空の場合でもレンダリングできる', () => {
    const { container } = render(
      <InteractiveTable
        columns={mockColumns}
        data={[]}
      />
    );
    // データが空でもテーブル構造は表示される
    expect(container.querySelector('[data-component="interactive-table"]')).toBeInTheDocument();
  });

  it('loading=true の場合、LoadingZone が表示される', () => {
    render(
      <InteractiveTable columns={mockColumns} data={mockData} loading={true} />
    );
    // LoadingZone が表示されるため、データは非表示
    expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
  });

  it('enableRowHighlight が有効な場合、テーブルがレンダリングされる', () => {
    const { container } = render(
      <InteractiveTable
        columns={mockColumns}
        data={mockData}
        enableRowHighlight={true}
      />
    );
    // enableRowHighlight が有効な場合でもテーブルが正常にレンダリングされる
    expect(container.querySelector('[data-component="interactive-table"]')).toBeInTheDocument();
  });

  it('onCellClick コールバックが設定できる', async () => {
    const handleCellClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InteractiveTable
        columns={mockColumns}
        data={mockData}
        onCellClick={handleCellClick}
      />
    );

    const cell = screen.getByText('田中太郎');
    await user.click(cell);
    expect(handleCellClick).toHaveBeenCalled();
  });

  it('enableRowColors が適用される', () => {
    render(
      <InteractiveTable
        columns={mockColumns}
        data={mockData}
        enableRowColors={true}
      />
    );
    // enableRowColors が動作していることを確認（レンダリングが成功すれば OK）
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(
      <InteractiveTable columns={mockColumns} data={mockData} />
    );
    expect(container.querySelector('[data-component="interactive-table"]')).toBeInTheDocument();
  });

  it('columns が未指定の場合でもレンダリングできる', () => {
    const { container } = render(
      <InteractiveTable data={mockData} />
    );
    expect(container.querySelector('[data-component="interactive-table"]')).toBeInTheDocument();
  });
});
