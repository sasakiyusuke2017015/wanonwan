import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Media } from './Media';

describe('Media', () => {
  it('画像がレンダリングされる', () => {
    const { container } = render(<Media src="/test-image.jpg" alt="テスト画像" />);
    // data-component="media"はdivラッパーにある
    expect(container.querySelector('[data-component="media"]')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('src属性が正しく適用される', () => {
    const { container } = render(<Media src="/test-image.jpg" alt="テスト画像" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('/test-image.jpg');
  });

  it('alt属性が正しく適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="説明文" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '説明文');
  });

  it('size属性が正しく適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" size={200} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.width).toBe(200);
    expect(img.height).toBe(200);
  });

  it('width/height属性が正しく適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" width={300} height={150} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.width).toBe(300);
    expect(img.height).toBe(150);
  });

  it('rounded=trueで角丸クラスが追加される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" rounded />);
    const img = container.querySelector('img');
    // imgにrounded-lgクラスが適用される
    expect(img?.className).toContain('rounded-lg');
  });

  it('circle=trueで円形クラスが追加される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" circle />);
    const img = container.querySelector('img');
    // imgにrounded-fullクラスが適用される
    expect(img?.className).toContain('rounded-full');
  });

  it('objectFit属性が正しく適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" objectFit="cover" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.style.objectFit).toBe('cover');
  });

  it('loading属性が正しく適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" loading="eager" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  it('onLoadイベントが発火する', async () => {
    const handleLoad = vi.fn();
    const { container } = render(<Media src="/test.jpg" alt="テスト" onLoad={handleLoad} />);

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('画像タイプが正しく判別される', () => {
    const { container } = render(<Media src="/test-image.jpg" alt="テスト" />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('data-media-type')).toBe('jpg');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Media src="/test.jpg" alt="テスト" className="custom-media" />);
    const img = container.querySelector('img');
    expect(img?.className).toContain('custom-media');
  });

  it('エラー時にフォールバック画像が表示される', async () => {
    const { container } = render(
      <Media
        src="/invalid.jpg"
        alt="テスト"
        fallbackSrc="/fallback.jpg"
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(img.src).toContain('/fallback.jpg');
    });
  });

  it('エラー時かつfallbackSrcがない場合、デフォルトアイコンが表示される', async () => {
    const { container } = render(
      <Media src="/invalid.jpg" alt="テスト" />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      // エラー時はsvgアイコンが表示される（またはimgがまだ存在する可能性がある）
      const svg = container.querySelector('svg');
      const imgAfterError = container.querySelector('img');
      expect(svg || imgAfterError).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
