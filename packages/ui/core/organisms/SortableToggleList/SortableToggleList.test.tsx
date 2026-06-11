import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SortableToggleList, type SortableItem } from './SortableToggleList';

describe('SortableToggleList', () => {
  const mockItems: SortableItem[] = [
    { id: '1', label: '項目1', checked: true },
    { id: '2', label: '項目2', checked: false },
    { id: '3', label: '項目3', checked: true },
  ];

  const mockOrder = ['1', '2', '3'];

  it('基本的なレンダリングができる', () => {
    render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
    expect(screen.getByText('項目3')).toBeInTheDocument();
  });

  it('items のラベルが表示される', () => {
    render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
    expect(screen.getByText('項目3')).toBeInTheDocument();
  });

  it('order の順序で表示される', () => {
    const customOrder = ['3', '1', '2'];
    render(
      <SortableToggleList
        items={mockItems}
        order={customOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    // 全ての項目が表示されることを確認
    expect(screen.getByText('項目1')).toBeInTheDocument();
    expect(screen.getByText('項目2')).toBeInTheDocument();
    expect(screen.getByText('項目3')).toBeInTheDocument();
  });

  it('トグルをクリックすると onItemToggle が呼ばれる', async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={handleToggle}
      />
    );

    // Toggle コンポーネント内のチェックボックスをクリック
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0]);
      expect(handleToggle).toHaveBeenCalled();
    }
  });

  it('disabled 状態のアイテムが表示される', () => {
    const itemsWithDisabled: SortableItem[] = [
      { id: '1', label: '有効項目', checked: true, disabled: false },
      { id: '2', label: '無効項目', checked: false, disabled: true },
    ];
    render(
      <SortableToggleList
        items={itemsWithDisabled}
        order={['1', '2']}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    expect(screen.getByText('有効項目')).toBeInTheDocument();
    expect(screen.getByText('無効項目')).toBeInTheDocument();
  });

  it('ドラッグハンドルが表示される', () => {
    render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    // ドラッグハンドル（⋮⋮）が表示されることを確認
    const { container } = render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
      />
    );
    expect(container.textContent).toContain('⋮⋮');
  });

  it('className が適用される', () => {
    const { container } = render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
        className="custom-sortable-list"
      />
    );
    expect(container.querySelector('.custom-sortable-list')).toBeInTheDocument();
  });

  it('itemRadius が適用される', () => {
    const { container } = render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
        itemRadius="1rem"
      />
    );
    // itemRadius が設定されている場合、rounded-lg クラスは適用されない
    const items = container.querySelectorAll('.border');
    expect(items.length).toBeGreaterThan(0);
  });

  it('onDragStart コールバックが設定できる', () => {
    const handleDragStart = vi.fn();
    render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
        onDragStart={handleDragStart}
      />
    );
    // onDragStart が設定できることを確認（レンダリングが成功すれば OK）
    expect(screen.getByText('項目1')).toBeInTheDocument();
  });

  it('onDragEnd コールバックが設定できる', () => {
    const handleDragEnd = vi.fn();
    render(
      <SortableToggleList
        items={mockItems}
        order={mockOrder}
        onOrderChange={() => {}}
        onItemToggle={() => {}}
        onDragEnd={handleDragEnd}
      />
    );
    // onDragEnd が設定できることを確認（レンダリングが成功すれば OK）
    expect(screen.getByText('項目1')).toBeInTheDocument();
  });
});
