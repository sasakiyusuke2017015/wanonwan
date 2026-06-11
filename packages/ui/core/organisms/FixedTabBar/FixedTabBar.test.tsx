import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { FixedTabBar } from './FixedTabBar';

describe('FixedTabBar', () => {
  it('基本的なレンダリングができる', () => {
    render(
      <FixedTabBar isLeftPaneOpen={false}>
        <div>タブコンテンツ</div>
      </FixedTabBar>
    );
    expect(screen.getByText('タブコンテンツ')).toBeInTheDocument();
  });

  it('children が表示される', () => {
    render(
      <FixedTabBar isLeftPaneOpen={false}>
        <div data-testid="tab-content">タブバーの中身</div>
      </FixedTabBar>
    );
    expect(screen.getByTestId('tab-content')).toBeInTheDocument();
  });

  it('isLeftPaneOpen=false の場合、left が 0px に設定される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={false}>
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    const tabBar = container.querySelector('.fixed');
    expect(tabBar).toHaveStyle({ left: '0px' });
  });

  it('isLeftPaneOpen=true の場合、left が 36px に設定される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={true}>
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    const tabBar = container.querySelector('.fixed');
    // LAYOUT_SIZES.LEFT_PANE_WIDTH = 36px
    expect(tabBar).toHaveStyle({ left: '36px' });
  });

  it('className が適用される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={false} className="custom-tab-bar">
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    expect(container.querySelector('.custom-tab-bar')).toBeInTheDocument();
  });

  it('tabBorderRadius が適用される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={false} tabBorderRadius="1rem">
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    const tabBar = container.querySelector('.fixed');
    // インラインスタイルで borderBottomLeftRadius が設定されていることを確認
    expect(tabBar?.getAttribute('style')).toContain('border-bottom-left-radius');
  });

  it('固定位置のスタイルが適用される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={false}>
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    const tabBar = container.querySelector('.fixed');
    expect(tabBar).toHaveClass('fixed');
    expect(tabBar).toHaveClass('z-20');
  });

  it('right-0 クラスが適用される', () => {
    const { container } = render(
      <FixedTabBar isLeftPaneOpen={false}>
        <div>コンテンツ</div>
      </FixedTabBar>
    );
    const tabBar = container.querySelector('.fixed');
    expect(tabBar).toHaveClass('right-0');
  });
});
