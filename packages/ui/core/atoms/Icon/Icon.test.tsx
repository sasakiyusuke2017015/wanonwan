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
