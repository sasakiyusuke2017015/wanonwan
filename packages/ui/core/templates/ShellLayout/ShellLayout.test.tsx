import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShellLayout } from './ShellLayout';

describe('ShellLayout', () => {
  it('ヘッダー、サイドバー、メインコンテンツが表示される', () => {
    render(
      <ShellLayout
        header={<div>ヘッダー</div>}
        sidebar={<div>サイドバー</div>}
      >
        <div>メインコンテンツ</div>
      </ShellLayout>
    );
    expect(screen.getByText('ヘッダー')).toBeInTheDocument();
    expect(screen.getByText('サイドバー')).toBeInTheDocument();
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
  });

  it('ステータスバーが表示される', () => {
    render(
      <ShellLayout
        header={<div>ヘッダー</div>}
        sidebar={<div>サイドバー</div>}
        statusBar={<div>ステータス</div>}
      >
        <div>内容</div>
      </ShellLayout>
    );
    expect(screen.getByText('ステータス')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(
      <ShellLayout
        header={<div>H</div>}
        sidebar={<div>S</div>}
      >
        <div>M</div>
      </ShellLayout>
    );
    expect(container.querySelector('[data-component="ShellLayout"]')).toBeInTheDocument();
  });
});
