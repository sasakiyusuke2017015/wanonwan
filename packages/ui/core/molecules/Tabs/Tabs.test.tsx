import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'tab1', label: 'タブ1', content: <div>コンテンツ1</div> },
  { id: 'tab2', label: 'タブ2', content: <div>コンテンツ2</div> },
  { id: 'tab3', label: 'タブ3', content: <div>コンテンツ3</div> },
];

const linkTabs = [
  { id: 'cert', label: '認定試験', href: '/admin/questions?purpose=cert' },
  { id: 'check', label: '理解度チェック', href: '/admin/questions?purpose=check' },
];

describe('Tabs', () => {
  describe('panel mode (default)', () => {
    it('全てのタブラベルが表示される', () => {
      render(<Tabs tabs={tabs} />);
      expect(screen.getByText('タブ1')).toBeInTheDocument();
      expect(screen.getByText('タブ2')).toBeInTheDocument();
      expect(screen.getByText('タブ3')).toBeInTheDocument();
    });

    it('デフォルトで最初のタブのコンテンツが表示される', () => {
      render(<Tabs tabs={tabs} />);
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
    });

    it('タブをクリックするとコンテンツが切り替わる', async () => {
      const user = userEvent.setup();
      render(<Tabs tabs={tabs} />);
      await user.click(screen.getByText('タブ2'));
      expect(screen.getByText('コンテンツ2')).toBeInTheDocument();
    });

    it('onTabChangeが呼ばれる', async () => {
      const handleTabChange = vi.fn();
      const user = userEvent.setup();
      render(<Tabs tabs={tabs} onTabChange={handleTabChange} />);
      await user.click(screen.getByText('タブ2'));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    it('data-component属性が設定される', () => {
      const { container } = render(<Tabs tabs={tabs} />);
      expect(container.querySelector('[data-component="tabs"]')).toBeInTheDocument();
    });

    it('mode 省略時は panel モードとして既存挙動を維持する (後方互換)', async () => {
      const handleTabChange = vi.fn();
      const user = userEvent.setup();
      render(<Tabs tabs={tabs} onTabChange={handleTabChange} />);
      // panel content が描画されている
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument();
      // クリックで切替 + onTabChange が呼ばれる
      await user.click(screen.getByText('タブ3'));
      expect(handleTabChange).toHaveBeenCalledWith('tab3');
      expect(screen.getByText('コンテンツ3')).toBeInTheDocument();
      // anchor は描画されない
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('keepMounted', () => {
    it('全パネルをマウントし、非アクティブは hidden にする', () => {
      render(<Tabs tabs={tabs} activeTab="tab2" keepMounted />)
      // 3 パネルすべて DOM にある（常時マウント）
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
      expect(screen.getByText('コンテンツ2')).toBeInTheDocument()
      expect(screen.getByText('コンテンツ3')).toBeInTheDocument()
      const panels = screen.getAllByRole('tabpanel', { hidden: true })
      expect(panels).toHaveLength(3)
      // アクティブ (tab2) のパネルだけ hidden でない
      const visible = panels.filter((p) => !p.hasAttribute('hidden'))
      expect(visible).toHaveLength(1)
      expect(visible[0]).toHaveTextContent('コンテンツ2')
    })

    it('タブ切替は再マウントせず hidden の付け替えで行う（onTabChange 制御）', async () => {
      const onTabChange = vi.fn()
      const user = userEvent.setup()
      const { rerender } = render(
        <Tabs tabs={tabs} activeTab="tab1" onTabChange={onTabChange} keepMounted />,
      )
      await user.click(screen.getByText('タブ3'))
      expect(onTabChange).toHaveBeenCalledWith('tab3')
      // controlled: 親が activeTab を更新すると hidden が付け替わる
      rerender(<Tabs tabs={tabs} activeTab="tab3" onTabChange={onTabChange} keepMounted />)
      const visible = screen
        .getAllByRole('tabpanel', { hidden: true })
        .filter((p) => !p.hasAttribute('hidden'))
      expect(visible).toHaveLength(1)
      expect(visible[0]).toHaveTextContent('コンテンツ3')
    })
  })

  describe('link mode', () => {
    it('anchor (<a href>) が tabs 数だけ render される', () => {
      render(<Tabs mode="link" tabs={linkTabs} activeId="cert" />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/admin/questions?purpose=cert');
      expect(links[1]).toHaveAttribute('href', '/admin/questions?purpose=check');
      // panel content は描画されない
      expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    });

    it('activeId 一致の anchor のみに aria-current="page" が付く', () => {
      render(<Tabs mode="link" tabs={linkTabs} activeId="check" />);
      const certLink = screen.getByRole('link', { name: '認定試験' });
      const checkLink = screen.getByRole('link', { name: '理解度チェック' });
      expect(certLink).not.toHaveAttribute('aria-current');
      expect(checkLink).toHaveAttribute('aria-current', 'page');
    });

    it('renderAnchor 経由でカスタム要素を描画できる', () => {
      const renderAnchor = vi.fn(
        ({ href, className, children, ...rest }) => (
          <a data-testid="custom-anchor" href={href} className={className} {...rest}>
            {children}
          </a>
        ),
      );
      render(
        <Tabs
          mode="link"
          tabs={linkTabs}
          activeId="cert"
          renderAnchor={renderAnchor}
        />,
      );
      const customAnchors = screen.getAllByTestId('custom-anchor');
      expect(customAnchors).toHaveLength(2);
      expect(renderAnchor).toHaveBeenCalledTimes(2);
    });

    it('role="tablist" が付いた wrapper を持つ', () => {
      render(<Tabs mode="link" tabs={linkTabs} activeId="cert" />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
      // 内部の <a> には role="tab" を付けない方針
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('role', 'tab');
      });
    });
  });

  describe('folder variant', () => {
    it('variant 省略時は data-variant="underline" (後方互換)', () => {
      const { container } = render(<Tabs tabs={tabs} />);
      expect(container.querySelector('[data-component="tabs"]')).toHaveAttribute(
        'data-variant',
        'underline',
      );
    });

    it('panel mode で variant="folder" を data-variant に反映する', () => {
      const { container } = render(<Tabs tabs={tabs} variant="folder" />);
      expect(container.querySelector('[data-component="tabs"]')).toHaveAttribute(
        'data-variant',
        'folder',
      );
    });

    it('link mode で variant="folder" でも anchor を描画する', () => {
      const { container } = render(
        <Tabs mode="link" tabs={linkTabs} activeId="cert" variant="folder" />,
      );
      expect(container.querySelector('[data-component="tabs"]')).toHaveAttribute(
        'data-variant',
        'folder',
      );
      expect(screen.getByText('認定試験').closest('a')).toHaveAttribute(
        'href',
        '/admin/questions?purpose=cert',
      );
    });
  });
});
