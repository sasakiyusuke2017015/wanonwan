import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('子要素をレンダリングする', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByText('クリック')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>クリック</Button>);

    await user.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態ではクリックイベントが発火しない', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled enableHopEffect={false}>
        クリック
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('variantプロパティが正しく適用される', () => {
    const { rerender } = render(<Button variant="primary" enableHopEffect={false}>Primary</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');

    rerender(<Button variant="danger" enableHopEffect={false}>Danger</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger');
  });

  it('sizeプロパティが正しく適用される', () => {
    const { rerender } = render(<Button size="small" enableHopEffect={false}>Small</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'small');

    rerender(<Button size="large" enableHopEffect={false}>Large</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'large');
  });

  it('borderRadiusプロパティがstyle属性に適用される', () => {
    const { container } = render(<Button borderRadius="1rem" enableHopEffect={false}>Rounded</Button>);
    const button = container.querySelector('button[data-component="button"]');
    // happy-domではstyle属性を直接確認
    expect(button?.getAttribute('style')).toContain('border-radius: 1rem');
  });

  it('enableHopEffect=falseの場合、divラッパーが存在しない', () => {
    const { container } = render(
      <Button enableHopEffect={false}>No Hop</Button>
    );

    // ホップ効果なしの場合、直接buttonがレンダリングされる
    expect(container.querySelector('[role="button"][tabIndex]')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('enableHopEffect=trueの場合、divラッパーが存在する', () => {
    const { container } = render(
      <Button enableHopEffect={true}>With Hop</Button>
    );

    // ホップ効果ありの場合、divラッパーが存在する
    const wrapper = container.querySelector('[role="button"][tabIndex]');
    expect(wrapper).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    render(<Button className="custom-class" enableHopEffect={false}>Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('既定で fillSweep クラスが付く (shimmer は廃止)', () => {
    render(<Button enableHopEffect={false}>Save</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('fillSweep');
    expect(button.className).not.toContain('shimmer');
  });

  it('navPending=true で ShimmerOverlay を重ねる (children は残す・disabled にしない)', () => {
    const { container, rerender } = render(
      <Button enableHopEffect={false}>受講をはじめる</Button>
    )
    // 既定では出ない
    expect(
      container.querySelector('[data-component="shimmer-overlay"]')
    ).toBeNull()

    rerender(
      <Button navPending enableHopEffect={false}>
        受講をはじめる
      </Button>
    )
    const button = screen.getByRole('button')
    // children はそのまま表示
    expect(screen.getByText('受講をはじめる')).toBeInTheDocument()
    // shimmer overlay が重なる
    expect(
      container.querySelector('[data-component="shimmer-overlay"]')
    ).not.toBeNull()
    // navPending は disabled にしない (遷移はブラウザ/router に任せる)
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('data-nav-pending', 'true')
  })

  it('nav / ghost には fillSweep が付かない', () => {
    const { rerender } = render(
      <Button variant="ghost" enableHopEffect={false}>
        Ghost
      </Button>
    );
    expect(screen.getByRole('button').className).not.toContain('fillSweep');
    rerender(
      <Button variant="nav" enableHopEffect={false}>
        Nav
      </Button>
    );
    expect(screen.getByRole('button').className).not.toContain('fillSweep');
  });
});
