import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';



import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('基本的なレンダリングができる', () => {
    render(<LoadingOverlay isVisible={true} />);
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
  });

  it('isVisible=true の場合、オーバーレイが表示される', () => {
    render(<LoadingOverlay isVisible={true} />);
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
  });

  it('isVisible=false の場合、オーバーレイが表示されない', () => {
    render(<LoadingOverlay isVisible={false} />);
    expect(screen.queryByText('データを読み込んでいます...')).not.toBeInTheDocument();
  });

  it('message が表示される', () => {
    render(<LoadingOverlay isVisible={true} message="処理中です" />);
    expect(screen.getByText('処理中です')).toBeInTheDocument();
  });

  it('icon が指定された場合、Icon コンポーネントが表示される', () => {
    const { container } = render(
      <LoadingOverlay isVisible={true} icon={'spinner'} />
    );
    // Icon コンポーネントは svg 要素
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('icon が未指定の場合、デフォルトのスピナーが表示される', () => {
    const { container } = render(<LoadingOverlay isVisible={true} />);
    // デフォルトスピナーは animate-spin クラスを持つ div
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('iconSize が適用される', () => {
    const { container } = render(
      <LoadingOverlay
        isVisible={true}
        icon={'spinner'}
        iconSize={100}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accentBgColor が適用される（スピナー）', () => {
    const { container } = render(
      <LoadingOverlay isVisible={true} accentBgColor="#ff0000" />
    );
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveStyle({ borderColor: '#ff0000' });
  });

  it('minDisplayTime による最低表示時間が機能する', async () => {
    const onHideComplete = vi.fn();
    const { rerender } = render(
      <LoadingOverlay
        isVisible={true}
        minDisplayTime={100}
        onHideComplete={onHideComplete}
      />
    );

    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();

    // すぐに非表示にリクエスト
    rerender(
      <LoadingOverlay
        isVisible={false}
        minDisplayTime={100}
        onHideComplete={onHideComplete}
      />
    );

    // minDisplayTime 経過後に非表示になることを確認
    await waitFor(
      () => {
        expect(screen.queryByText('データを読み込んでいます...')).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });
});
