import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('子要素が表示される', () => {
    render(<Card>カード内容</Card>);
    expect(screen.getByText('カード内容')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<Card>内容</Card>);
    expect(container.querySelector('[data-component="card"]')).toBeInTheDocument();
  });

  it('onClickが指定された場合、role="button"が付与される', () => {
    const { container } = render(<Card onClick={() => {}}>クリッカブル</Card>);
    const card = container.querySelector('[data-component="card"]');
    expect(card).toHaveAttribute('role', 'button');
  });

  it('onClickが未指定の場合、role属性は付与されない', () => {
    const { container } = render(<Card>通常</Card>);
    const card = container.querySelector('[data-component="card"]');
    expect(card).not.toHaveAttribute('role');
  });

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Card onClick={handleClick}>クリック</Card>);
    await user.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Card className="custom-class">内容</Card>);
    const card = container.querySelector('[data-component="card"]');
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<CardHeader>ヘッダー</CardHeader>);
    expect(container.querySelector('[data-component="card-header"]')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(<CardHeader>ヘッダー内容</CardHeader>);
    expect(screen.getByText('ヘッダー内容')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<CardContent>コンテンツ</CardContent>);
    expect(container.querySelector('[data-component="card-content"]')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(<CardContent>コンテンツ内容</CardContent>);
    expect(screen.getByText('コンテンツ内容')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<CardFooter>フッター</CardFooter>);
    expect(container.querySelector('[data-component="card-footer"]')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(<CardFooter>フッター内容</CardFooter>);
    expect(screen.getByText('フッター内容')).toBeInTheDocument();
  });
});
