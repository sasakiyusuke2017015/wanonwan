import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../hooks/router/RouterContext';
import type { RouterAdapter, LinkProps } from '../../hooks/router/types';
import { InternalLink } from './InternalLink';

// テスト用モックアダプタ
const createMockAdapter = (): RouterAdapter => ({
  useNavigate: () => vi.fn(),
  usePathname: () => '/',
  Link: ({ href, children, className, style, onClick, ...props }: LinkProps) => (
    <a href={href} className={className} style={style} onClick={onClick} {...props}>
      {children}
    </a>
  ),
});

describe('InternalLink', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    const mockAdapter = createMockAdapter();
    return render(
      <RouterProvider adapter={mockAdapter}>
        {ui}
      </RouterProvider>
    );
  };

  it('内部リンクがレンダリングされる', () => {
    renderWithRouter(<InternalLink to="/test">テストリンク</InternalLink>);
    expect(screen.getByText('テストリンク')).toBeInTheDocument();
  });

  it('to属性が正しく適用される', () => {
    const { container } = renderWithRouter(<InternalLink to="/dashboard">ダッシュボード</InternalLink>);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('variant属性が正しく適用される', () => {
    const mockAdapter = createMockAdapter();
    const { container, rerender } = render(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="link">リンク</InternalLink>
      </RouterProvider>
    );
    expect(container.querySelector('[data-variant="link"]')).toBeInTheDocument();

    rerender(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="button">ボタン</InternalLink>
      </RouterProvider>
    );
    expect(container.querySelector('[data-variant="button"]')).toBeInTheDocument();

    rerender(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="text">テキスト</InternalLink>
      </RouterProvider>
    );
    expect(container.querySelector('[data-variant="text"]')).toBeInTheDocument();
  });

  it('size属性が正しく適用される (variant=button)', () => {
    const mockAdapter = createMockAdapter();
    const { container, rerender } = render(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="button" size="small">小</InternalLink>
      </RouterProvider>
    );
    let link = container.querySelector('a');
    expect(link?.className).toContain('text-fluid-xs');

    rerender(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="button" size="medium">中</InternalLink>
      </RouterProvider>
    );
    link = container.querySelector('a');
    expect(link?.className).toContain('text-fluid-sm');

    rerender(
      <RouterProvider adapter={mockAdapter}>
        <InternalLink to="/test" variant="button" size="large">大</InternalLink>
      </RouterProvider>
    );
    link = container.querySelector('a');
    expect(link?.className).toContain('text-fluid-base');
  });

  it('color属性が正しく適用される', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" variant="button" color="primary">プライマリ</InternalLink>
    );
    const link = container.querySelector('a');
    expect(link?.className).toContain('bg-blue-600');
  });

  it('disabled状態ではspanタグがレンダリングされる', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" disabled>無効</InternalLink>
    );
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.className).toContain('cursor-not-allowed');
  });

  it('disabled状態ではonClickイベントが発火しない', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithRouter(
      <InternalLink to="/test" disabled onClick={handleClick}>無効</InternalLink>
    );

    const span = screen.getByText('無効');
    await user.click(span);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('showIcon=falseでアイコンが表示されない', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" showIcon={false}>アイコンなし</InternalLink>
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('showIcon=trueでアイコンが表示される (デフォルト)', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test">アイコンあり</InternalLink>
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('borderRadiusプロパティがstyle属性に適用される', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" borderRadius="1rem">テスト</InternalLink>
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('style')).toContain('border-radius: 1rem');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" className="custom-internal-link">テスト</InternalLink>
    );
    const link = container.querySelector('a');
    expect(link?.className).toContain('custom-internal-link');
  });

  it('onClickイベントが発火する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithRouter(
      <InternalLink to="/test" onClick={handleClick}>クリック</InternalLink>
    );

    const link = screen.getByText('クリック');
    await user.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disableScale=trueでhover:scale-105が適用されない', () => {
    const { container } = renderWithRouter(
      <InternalLink to="/test" disableScale>スケールなし</InternalLink>
    );
    const link = container.querySelector('a');
    expect(link?.className).not.toContain('hover:scale-105');
  });
});
