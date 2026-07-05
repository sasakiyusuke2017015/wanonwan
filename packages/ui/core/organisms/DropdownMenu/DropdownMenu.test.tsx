// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { DropdownMenu } from './DropdownMenu';

// JSDOM の getBoundingClientRect はデフォルトで 0 を返す。位置計算に使う rect を
// 明示的にモックして、trigger / menu が「ちゃんとした矩形を持つ」状態を再現する。
function mockRects() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element,
  ) {
    // trigger 包み <div ref={triggerWrapRef}> と menu <div ref={menuRef}> の両方を
    // 同じ rect で返しても本テストの assertion には十分。trigger と menu を別の
    // rect にしたい場合は、各 element の data-* を見て分岐すればよい。
    return {
      top: 100,
      left: 200,
      right: 280,
      bottom: 130,
      width: 80,
      height: 30,
      x: 200,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect;
  });
}

describe('DropdownMenu', () => {
  beforeEach(() => {
    mockRects();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('基本的なレンダリングができる', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />,
    );
    expect(screen.getByText('メニュー')).toBeInTheDocument();
  });

  it('label が表示される', () => {
    render(
      <DropdownMenu label="テストメニュー" menuContent={<div>コンテンツ</div>} />,
    );
    expect(screen.getByText('テストメニュー')).toBeInTheDocument();
  });

  it('icon が表示される（IconName文字列）', () => {
    const { container } = render(
      <DropdownMenu label="メニュー" icon={'hamburger'} menuContent={<div>コンテンツ</div>} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('icon が表示される（ReactNode）', () => {
    render(
      <DropdownMenu
        label="メニュー"
        icon={<span data-testid="custom-icon">🔧</span>}
        menuContent={<div>コンテンツ</div>}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('初期状態ではメニューが閉じている', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />,
    );
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });

  it('ボタンをクリックするとメニューが開く', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();
  });

  it('メニューが開いている時にボタンをクリックすると閉じる', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />,
    );
    const button = screen.getByText('メニュー');
    fireEvent.click(button);
    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });

  it('menuContent が関数の場合、closeMenu コールバックが渡される', () => {
    render(
      <DropdownMenu
        label="メニュー"
        menuContent={(closeMenu) => (
          <div>
            <button onClick={closeMenu}>閉じる</button>
          </div>
        )}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    fireEvent.click(screen.getByText('閉じる'));
    expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
  });

  it('variant="outline" の場合、Button コンポーネントが使用される', () => {
    const { container } = render(
      <DropdownMenu variant="outline" label="アウトライン" menuContent={<div>コンテンツ</div>} />,
    );
    expect(container.querySelector('[data-component="button"]')).toBeInTheDocument();
  });

  it('variant="default" の場合、カスタムボタンが使用される', () => {
    render(
      <DropdownMenu variant="default" label="デフォルト" menuContent={<div>コンテンツ</div>} />,
    );
    const labelEl = screen.getByText('デフォルト');
    expect(labelEl.tagName).toBe('SPAN');
  });

  it('className が適用される', () => {
    const { container } = render(
      <DropdownMenu
        label="メニュー"
        menuContent={<div>コンテンツ</div>}
        className="custom-dropdown"
      />,
    );
    expect(container.querySelector('.custom-dropdown')).toBeInTheDocument();
  });

  // ---- 拡張機能 (placement / Esc / aria) ----

  it('placement="top-start" 指定時に menu の style が calculate の結果に一致する', () => {
    // trigger rect: top=100, bottom=130, left=200, right=280
    // menu rect: width=80, height=30 (mock 同値)
    // top-start: top = 100 - 8 - 30 = 62, left = 200
    render(
      <DropdownMenu
        label="メニュー"
        placement="top-start"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.position).toBe('fixed');
    expect(menu.style.top).toBe('62px');
    expect(menu.style.left).toBe('200px');
  });

  it('crossOffset で top-start の left が横方向にずれる', () => {
    // top-start: top = 100 - 8 - 30 = 62, left = trigger.left(200) + crossOffset(40) = 240
    render(
      <DropdownMenu
        label="メニュー"
        placement="top-start"
        crossOffset={40}
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.top).toBe('62px');
    expect(menu.style.left).toBe('240px');
  });

  it('placement="bottom-end" (default) の挙動', () => {
    // bottom-end: top = 130 + 8 = 138, left = 280 - 80 = 200
    render(
      <DropdownMenu label="メニュー" menuContent={<div data-testid="m">m</div>} />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.top).toBe('138px');
    expect(menu.style.left).toBe('200px');
  });

  // ---- animation prop ----

  it('animation prop default は expandFromTrigger (style.animation に dropMenuExpandFromTrigger が入る)', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div data-testid="m">m</div>} />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.animation).toContain('dropMenuExpandFromTrigger');
  });

  it('animation="fadeIn" で keyframe 名が dropMenuFadeIn になる', () => {
    render(
      <DropdownMenu
        label="メニュー"
        animation="fadeIn"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.animation).toContain('dropMenuFadeIn');
    expect(menu.style.animation).not.toContain('dropMenuExpandFromTrigger');
  });

  it('animation="none" で style.animation が空になる', () => {
    render(
      <DropdownMenu
        label="メニュー"
        animation="none"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.animation).toBe('');
  });

  it('animation="expandFromTrigger" で transformOrigin が trigger 中心 - menu 左上 の座標になる', () => {
    // mockRects: trigger / menu とも top=100, left=200, right=280, bottom=130, width=80, height=30
    // bottom-end (default): menu pos = { top: 138, left: 200 }
    // trigger center = ((200+280)/2, (100+130)/2) = (240, 115)
    // origin = (240 - 200, 115 - 138) = (40, -23) → "40px -23px"
    render(
      <DropdownMenu label="メニュー" menuContent={<div data-testid="m">m</div>} />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.style.transformOrigin).toBe('40px -23px');
  });

  it('animation="fadeIn" のときは transformOrigin が undefined (= 空文字)', () => {
    render(
      <DropdownMenu
        label="メニュー"
        animation="fadeIn"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    // 'expandFromTrigger' 以外では transformOrigin は設定しないので空文字 (jsdom デフォルト)
    expect(menu.style.transformOrigin).toBe('');
  });

  it('viewportMargin で menu が viewport から margin px 以上空いて clamp される', () => {
    // mockRects の trigger は left=200, right=280, top=100, bottom=130
    // jsdom default window.innerWidth = 1024, innerHeight = 768
    // bottom-end (default): raw left = 280 - 80 = 200, top = 138
    // viewport は 1024x768、margin=8 では clamp は走らない (200, 138 は範囲内)
    // → このテストでは、viewport を狭めて trigger が右端ぴったりにする状況を再現する
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 240 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 200 });
    render(
      <DropdownMenu
        label="メニュー"
        viewportMargin={8}
        animation="none"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    // viewport.width=240, menu.width=80, margin=8 → maxLeft = 240-80-8 = 152
    // raw left=200 → clamp → 152
    expect(menu.style.left).toBe('152px');
    // viewport.height=200, menu.height=30, margin=8 → maxTop = 200-30-8 = 162
    // raw top=138 → 範囲内 → そのまま
    expect(menu.style.top).toBe('138px');
    // restore
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  it('avoidTriggerOverlap: top-* で menu が縦に長く clamp されても trigger に被らない (上にはみ出す)', () => {
    // mockRects: trigger top=100, bottom=130 / menu height=30 だが、ここでは menu を
    // viewport より高くして「上に収まらない」状況を作る。getBoundingClientRect を
    // menu 用に大きい height で上書きする。
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      return {
        top: 100,
        left: 200,
        right: 280,
        bottom: 130,
        width: 80,
        height: 200, // menu が縦に長い
        x: 200,
        y: 100,
        toJSON: () => ({}),
      } as DOMRect;
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
    render(
      <DropdownMenu
        label="メニュー"
        placement="top-start"
        offset={8}
        avoidTriggerOverlap
        animation="none"
        menuContent={<div data-testid="m">m</div>}
      />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    const menu = screen.getByTestId('m').parentElement!;
    // raw top = trigger.top(100) - offset(8) - height(200) = -108
    // viewport clamp の min(8) で +8 に押し戻されると trigger(top=100) に被るが、
    // overlap 回避で top = trigger.top - offset - height = -108 のまま (上にはみ出す)
    expect(menu.style.top).toBe('-108px');
  });

  it('Esc キーでメニューが閉じる', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />,
    );
    fireEvent.click(screen.getByText('メニュー'));
    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });

  it('trigger に aria-haspopup / aria-expanded / aria-controls が付く', () => {
    render(
      <DropdownMenu label="メニュー" menuContent={<div data-testid="m">m</div>} />,
    );
    // Button は親 span を持つので、role=button な要素を取る
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-haspopup')).toBe('true');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBeTruthy();

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    const menuId = button.getAttribute('aria-controls')!;
    const menu = screen.getByTestId('m').parentElement!;
    expect(menu.id).toBe(menuId);
  });

  it('ariaLabel を渡すと icon-only trigger でも accessible name が付く', () => {
    render(
      <DropdownMenu
        icon={'hamburger'}
        ariaLabel="アカウントメニューを開く"
        menuContent={<div>m</div>}
      />,
    );
    const button = screen.getByRole('button', { name: 'アカウントメニューを開く' });
    expect(button).toBeInTheDocument();
  });

  it('メニュー外をクリックすると閉じる', () => {
    render(
      <div>
        <DropdownMenu label="メニュー" menuContent={<div>メニューコンテンツ</div>} />
        <button>外側</button>
      </div>,
    );
    fireEvent.click(screen.getByText('メニュー'));
    expect(screen.getByText('メニューコンテンツ')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('外側'));
    expect(screen.queryByText('メニューコンテンツ')).not.toBeInTheDocument();
  });
});
