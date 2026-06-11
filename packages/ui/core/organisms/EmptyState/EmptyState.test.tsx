import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('タイトルが表示される', () => {
    render(<EmptyState title="データがありません" />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('説明文が表示される', () => {
    render(<EmptyState title="空" description="データを追加してください" />);
    expect(screen.getByText('データを追加してください')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<EmptyState title="テスト" />);
    expect(container.querySelector('[data-component="empty-state"]')).toBeInTheDocument();
  });

  it('アクション要素が表示される', () => {
    render(<EmptyState title="空" action={<button>追加する</button>} />);
    expect(screen.getByText('追加する')).toBeInTheDocument();
  });
});
