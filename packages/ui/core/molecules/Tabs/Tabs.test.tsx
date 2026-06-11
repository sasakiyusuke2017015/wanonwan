import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'tab1', label: 'タブ1', content: <div>コンテンツ1</div> },
  { id: 'tab2', label: 'タブ2', content: <div>コンテンツ2</div> },
  { id: 'tab3', label: 'タブ3', content: <div>コンテンツ3</div> },
];

describe('Tabs', () => {
  it('全てのタブラベルが表示される', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText('タブ1')).toBeInTheDocument();
    expect(screen.getByText('タブ2')).toBeInTheDocument();
    expect(screen.getByText('タブ3')).toBeInTheDocument();
  });

  it('デフォルトで最初のタブのコンテンツが表示される', () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
  });

  it('タブをクリックするとコンテンツが切り替わる', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} />);
    await user.click(screen.getByText('タブ2'));
    expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
  });

  it('onTabChangeが呼ばれる', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();
    render(<Tabs tabs={tabs} onTabChange={handleTabChange} />);
    await user.click(screen.getByText('タブ2'));
    expect(handleTabChange).toHaveBeenCalledWith('tab2');
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<Tabs tabs={tabs} />);
    expect(container.querySelector('[data-component="tabs"]')).toBeInTheDocument();
  });
});
