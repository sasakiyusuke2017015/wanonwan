import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Icon } from './Icon';


describe('Icon', () => {
  it('SVGがレンダリングされる', () => {
    const { container } = render(<Icon name={'hamburger'} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sizeプロパティが正しく適用される', () => {
    const { container } = render(<Icon name={'hamburger'} size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('fillプロパティが正しく適用される', () => {
    const { container } = render(<Icon name={'hamburger'} fill="#ff0000" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('strokeプロパティが正しく適用される', () => {
    const { container } = render(<Icon name={'hamburger'} stroke="#00ff00" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('classNameが正しく適用される', () => {
    const { container } = render(<Icon name={'hamburger'} className="custom-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-icon');
  });

  it('onClickイベントが発火する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Icon name={'hamburger'} onClick={handleClick} />);

    const svg = container.querySelector('svg');
    if (svg) {
      await user.click(svg);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('ローディングアイコンがレンダリングされる', () => {
    const { container } = render(<Icon name={'spinner'} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('アニメーショントリガーが設定できる', () => {
    const { container } = render(
      <Icon
        name={'hamburger'}
        animationTrigger="hover"
        hoverScale={1.2}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('conditionアニメーションが設定できる', () => {
    const { container } = render(
      <Icon
        name={'hamburger'}
        animationTrigger="condition"
        condition={true}
        conditionAnimation={{ rotate: [0, 10, -10, 0] }}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

// P3-3 の union 縮小 (束③レビュー NICE-TO-HAVE) 後の残存値を固定する回帰テスト。
// SCSS 整理で class 付与や preset 解決が壊れたとき検出する。
describe('Icon 縮小後 API の回帰 (P3-3)', () => {
  it.each([
    ['pop', 'pop'],
    ['shake', 'shake'],
    ['spin', 'spin'],
  ] as const)('animation="%s" で class %s が付く (animate 既定 true)', (animation, cls) => {
    const { container } = render(<Icon name={'bell'} animation={animation} />);
    expect(container.querySelector('svg')?.classList.contains(cls)).toBe(true);
  });

  it('hover="pop" で hoverPop class が付く', () => {
    const { container } = render(<Icon name={'bell'} hover="pop" />);
    expect(container.querySelector('svg')?.classList.contains('hoverPop')).toBe(true);
  });

  it('hover="auto" は DEFAULT_HOVER_MAP 掲載アイコン (person=pop) で解決し、非掲載 (columns-3) では class なし', () => {
    const mapped = render(<Icon name={'person'} hover="auto" />);
    expect(mapped.container.querySelector('svg')?.classList.contains('hoverPop')).toBe(true);
    const unmapped = render(<Icon name={'columns-3'} hover="auto" />);
    expect(unmapped.container.querySelector('svg')?.classList.contains('hoverPop')).toBe(false);
  });

  it.each([
    ['spinner', 'spinner'],
    ['cube', 'loading-cube3d'],
    ['interview', 'loading-interview'],
  ] as const)('preset="%s" が data-icon="%s" に解決される', (preset, iconName) => {
    const { container } = render(<Icon preset={preset} />);
    expect(container.querySelector('svg')?.getAttribute('data-icon')).toBe(iconName);
  });
});
