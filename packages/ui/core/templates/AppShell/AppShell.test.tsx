import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('ヘッダー、サイドバー、メインコンテンツが表示される', () => {
    render(
      <AppShell
        header={<div>ヘッダー</div>}
        sidebar={<div>サイドバー</div>}
      >
        <div>メインコンテンツ</div>
      </AppShell>
    );
    expect(screen.getByText('ヘッダー')).toBeInTheDocument();
    expect(screen.getByText('サイドバー')).toBeInTheDocument();
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument();
  });

  it('ステータスバーが表示される', () => {
    render(
      <AppShell
        header={<div>ヘッダー</div>}
        sidebar={<div>サイドバー</div>}
        statusBar={<div>ステータス</div>}
      >
        <div>内容</div>
      </AppShell>
    );
    expect(screen.getByText('ステータス')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(
      <AppShell
        header={<div>H</div>}
        sidebar={<div>S</div>}
      >
        <div>M</div>
      </AppShell>
    );
    expect(container.querySelector('[data-component="AppShell"]')).toBeInTheDocument();
  });
});
