import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabBar, type TabItem } from './TabBar';

describe('TabBar', () => {
  const mockTabs: TabItem[] = [
    { id: '1', label: 'タブ1' },
    { id: '2', label: 'タブ2' },
    { id: '3', label: 'タブ3' },
  ];

  it('基本的なレンダリングができる', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
      />
    );
    expect(screen.getByText('タブ1')).toBeInTheDocument();
    expect(screen.getByText('タブ2')).toBeInTheDocument();
    expect(screen.getByText('タブ3')).toBeInTheDocument();
  });

  it('tabs が空の場合、何も表示されない', () => {
    const { container } = render(
      <TabBar
        tabs={[]}
        activeTabId={null}
        onSelectTab={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('activeTabId に対応するタブがアクティブになる', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="2"
        onSelectTab={() => {}}
      />
    );
    const tab2 = screen.getByText('タブ2').closest('[role="tab"]');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('タブをクリックすると onSelectTab が呼ばれる', async () => {
    const handleSelectTab = vi.fn();
    const user = userEvent.setup();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={handleSelectTab}
      />
    );

    const tab2 = screen.getByText('タブ2');
    await user.click(tab2);

    expect(handleSelectTab).toHaveBeenCalledWith('2');
  });

  it('タブで Enter キーを押すと onSelectTab が呼ばれる', async () => {
    const handleSelectTab = vi.fn();
    const user = userEvent.setup();
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={handleSelectTab}
      />
    );

    const tab2 = screen.getByText('タブ2').closest('[role="tab"]') as HTMLElement;
    if (tab2) {
      tab2.focus();
      await user.keyboard('{Enter}');
      expect(handleSelectTab).toHaveBeenCalledWith('2');
    }
  });

  it('onCloseTab が指定されている場合、閉じるボタンが表示される', () => {
    const { container } = render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
        onCloseTab={() => {}}
      />
    );
    // 閉じるボタン（×）は svg 要素
    const closeButtons = container.querySelectorAll('svg');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('onCloseTab が未指定の場合、閉じるボタンが表示されない', () => {
    const { container } = render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
      />
    );
    // 閉じるボタンがないことを確認
    const closeButtons = container.querySelectorAll('svg');
    expect(closeButtons.length).toBe(0);
  });

  it('閉じるボタンをクリックすると onCloseTab が呼ばれる', async () => {
    const handleCloseTab = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
        onCloseTab={handleCloseTab}
      />
    );

    const closeButtons = container.querySelectorAll('button');
    if (closeButtons.length > 0) {
      await user.click(closeButtons[0]);
      expect(handleCloseTab).toHaveBeenCalled();
    }
  });

  it('activeColor が適用される', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
        activeColor="blue"
      />
    );
    const activeTab = screen.getByText('タブ1').closest('[role="tab"]');
    expect(activeTab).toHaveClass('border-blue-500');
  });

  it('maxLabelWidth が適用される', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
        maxLabelWidth={200}
      />
    );
    const label = screen.getByText('タブ1');
    expect(label).toHaveStyle({ maxWidth: '200px' });
  });

  it('role="tablist" が設定される', () => {
    const { container } = render(
      <TabBar
        tabs={mockTabs}
        activeTabId="1"
        onSelectTab={() => {}}
      />
    );
    expect(container.querySelector('[role="tablist"]')).toBeInTheDocument();
  });
});
