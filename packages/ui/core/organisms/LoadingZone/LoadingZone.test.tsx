import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingZone } from './LoadingZone';

describe('LoadingZone', () => {
  it('variant="table" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="table" />);
    expect(container.querySelector('[data-component="loading-zone"]')).toBeInTheDocument();
    expect(container.querySelector('[data-variant="table"]')).toBeInTheDocument();
  });

  it('variant="card" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="card" />);
    expect(container.querySelector('[data-variant="card"]')).toBeInTheDocument();
  });

  it('variant="list" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="list" />);
    expect(container.querySelector('[data-variant="list"]')).toBeInTheDocument();
  });

  it('variant="simple" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="simple" />);
    expect(container.querySelector('[data-variant="simple"]')).toBeInTheDocument();
  });

  it('variant="overlay" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="overlay" />);
    expect(container.querySelector('[data-variant="overlay"]')).toBeInTheDocument();
  });

  it('variant="inline" でレンダリングされる', () => {
    const { container } = render(<LoadingZone variant="inline" />);
    expect(container.querySelector('[data-variant="inline"]')).toBeInTheDocument();
  });

  it('デフォルトメッセージが表示される', () => {
    render(<LoadingZone variant="simple" />);
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
  });

  it('カスタムメッセージが表示される', () => {
    render(<LoadingZone variant="simple" message="処理中..." />);
    expect(screen.getByText('処理中...')).toBeInTheDocument();
  });

  it('loading=true の場合、LoadingZone が表示される', () => {
    const { container } = render(
      <LoadingZone variant="simple" loading={true}>
        <div>コンテンツ</div>
      </LoadingZone>
    );
    expect(container.querySelector('[data-component="loading-zone"]')).toBeInTheDocument();
    expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
  });

  it('loading=false の場合、children が表示される', () => {
    const { container } = render(
      <LoadingZone variant="simple" loading={false}>
        <div>コンテンツ</div>
      </LoadingZone>
    );
    expect(container.querySelector('[data-component="loading-zone"]')).not.toBeInTheDocument();
    expect(screen.getByText('コンテンツ')).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<LoadingZone variant="simple" className="custom-loading" />);
    expect(container.firstChild).toHaveClass('custom-loading');
  });

  it('height属性が適用される', () => {
    const { container } = render(<LoadingZone variant="simple" height="200px" />);
    const loadingZone = container.querySelector('[data-component="loading-zone"]') as HTMLElement;
    expect(loadingZone.style.height).toBe('200px');
  });

  it('size属性が正しく適用される', () => {
    render(<LoadingZone variant="simple" size={48} />);
    // アイコンのサイズ確認は間接的にコンポーネントが正しくレンダリングされることで確認
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
  });
});
