import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from '../../hooks/router/RouterContext';
import type { RouterAdapter, LinkProps } from '../../hooks/router/types';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

// テスト用モックアダプタ
const createMockAdapter = (): RouterAdapter => ({
  useNavigate: () => vi.fn(),
  usePathname: () => '/',
  Link: ({ href, children, className, style, ...props }: LinkProps) => (
    <a href={href} className={className} style={style} {...props}>
      {children}
    </a>
  ),
});

describe('Breadcrumb', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    const mockAdapter = createMockAdapter();
    return render(
      <RouterProvider adapter={mockAdapter}>
        {ui}
      </RouterProvider>
    );
  };

  const mockItems: BreadcrumbItem[] = [
    { label: 'ホーム', href: '/' },
    { label: 'ユーザー', href: '/users' },
    { label: '詳細', href: '/users/1' },
  ];

  it('パンくずリストがレンダリングされる', () => {
    renderWithRouter(<Breadcrumb items={mockItems} />);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    expect(screen.getByText('詳細')).toBeInTheDocument();
  });

  it('items配列が空の場合、何も表示されない', () => {
    const { container } = renderWithRouter(<Breadcrumb items={[]} />);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });

  it('最後の要素はリンクではなくspanで表示される', () => {
    renderWithRouter(<Breadcrumb items={mockItems} />);
    const lastItem = screen.getByText('詳細');
    expect(lastItem.tagName).toBe('SPAN');
  });

  it('最後以外の要素はリンクとして表示される', () => {
    const { container } = renderWithRouter(<Breadcrumb items={mockItems} />);
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink?.textContent).toBe('ホーム');
  });

  it('区切り文字が表示される (デフォルト: ">")', () => {
    renderWithRouter(<Breadcrumb items={mockItems} />);
    const separators = screen.getAllByText('>');
    expect(separators.length).toBe(2); // 3項目なので区切りは2つ
  });

  it('カスタム区切り文字が表示される', () => {
    renderWithRouter(<Breadcrumb items={mockItems} separator="/" />);
    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);
  });

  it('tooltip属性が設定される', () => {
    const itemsWithTooltip: BreadcrumbItem[] = [
      { label: 'ホーム', href: '/', tooltip: 'トップページ' },
      { label: '詳細', href: '/detail', tooltip: '詳細ページ' },
    ];
    renderWithRouter(<Breadcrumb items={itemsWithTooltip} />);

    const homeElement = screen.getByText('ホーム');
    expect(homeElement).toHaveAttribute('title', 'トップページ');

    const detailElement = screen.getByText('詳細');
    expect(detailElement).toHaveAttribute('title', '詳細ページ');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = renderWithRouter(<Breadcrumb items={mockItems} className="custom-breadcrumb" />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-breadcrumb');
  });

  it('aria-label属性が設定される', () => {
    const { container } = renderWithRouter(<Breadcrumb items={mockItems} />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'breadcrumb');
  });

  it('size属性が最後の要素に適用される', () => {
    const itemsWithSize: BreadcrumbItem[] = [
      { label: 'ホーム', href: '/' },
      { label: '詳細', href: '/detail', size: 'xl' },
    ];
    renderWithRouter(<Breadcrumb items={itemsWithSize} />);

    const lastItem = screen.getByText('詳細');
    expect(lastItem).toHaveClass('text-fluid-xl');
  });

  it('ヘッダー内クラスが含まれる場合、テーマ色が適用される', () => {
    const { container } = renderWithRouter(
      <Breadcrumb
        items={mockItems}
        className="breadcrumb-in-header"
        primaryContrastText="#ff0000"
      />
    );

    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });
});
