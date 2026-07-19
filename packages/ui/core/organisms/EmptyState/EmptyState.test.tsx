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

  it('variant 未指定で default class が当たり、dashed class は当たらない', () => {
    const { container } = render(<EmptyState title="空" />);
    const root = container.querySelector('[data-component="empty-state"]') as HTMLElement;
    expect(root.className).not.toMatch(/dashed/);
  });

  it('variant="dashed" で dashed class が当たる', () => {
    const { container } = render(<EmptyState title="空" variant="dashed" />);
    const root = container.querySelector('[data-component="empty-state"]') as HTMLElement;
    expect(root.className).toMatch(/dashed/);
  });

  it('variant="default" で dashed class は当たらない (明示指定でも安全)', () => {
    const { container } = render(<EmptyState title="空" variant="default" />);
    const root = container.querySelector('[data-component="empty-state"]') as HTMLElement;
    expect(root.className).not.toMatch(/dashed/);
  });
});
