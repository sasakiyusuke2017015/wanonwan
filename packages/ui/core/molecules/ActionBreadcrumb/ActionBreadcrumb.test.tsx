import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionBreadcrumb } from './ActionBreadcrumb';

describe('ActionBreadcrumb', () => {
  it('アイテムのラベルが表示される', () => {
    render(<ActionBreadcrumb items={[{ label: 'ホーム' }, { label: '設定' }]} />);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('デフォルトのセパレータ「/」が表示される', () => {
    render(<ActionBreadcrumb items={[{ label: 'ホーム' }, { label: '設定' }]} />);
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('カスタムセパレータが表示される', () => {
    render(<ActionBreadcrumb items={[{ label: 'A' }, { label: 'B' }]} separator=">" />);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('onClickが指定されたアイテムはボタンとして表示される', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ActionBreadcrumb items={[{ label: 'ホーム', onClick: handleClick }, { label: '現在地' }]} />);
    await user.click(screen.getByText('ホーム'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<ActionBreadcrumb items={[{ label: 'テスト' }]} />);
    expect(container.querySelector('[data-component="action-breadcrumb"]')).toBeInTheDocument();
  });
});
