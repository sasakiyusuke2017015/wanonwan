import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('data-component属性が設定される', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[data-component="progress"]')).toBeInTheDocument();
  });

  it('aria属性が正しく設定される', () => {
    const { container } = render(<Progress value={30} max={100} />);
    const el = container.querySelector('[role="progressbar"]');
    expect(el).toBeInTheDocument();
    expect(el?.getAttribute('aria-valuenow')).toBe('30');
    expect(el?.getAttribute('aria-valuemin')).toBe('0');
    expect(el?.getAttribute('aria-valuemax')).toBe('100');
  });

  it('インジケーターの幅がvalue/maxに基づく', () => {
    const { container } = render(<Progress value={75} />);
    const indicator = container.querySelector('[data-component="progress"] > div');
    expect(indicator?.getAttribute('style')).toContain('width: 75%');
  });

  it('値が0未満の場合0%にクランプされる', () => {
    const { container } = render(<Progress value={-10} />);
    const indicator = container.querySelector('[data-component="progress"] > div');
    expect(indicator?.getAttribute('style')).toContain('width: 0%');
  });

  it('値がmax超の場合100%にクランプされる', () => {
    const { container } = render(<Progress value={150} />);
    const indicator = container.querySelector('[data-component="progress"] > div');
    expect(indicator?.getAttribute('style')).toContain('width: 100%');
  });

  it('カスタムmaxが反映される', () => {
    const { container } = render(<Progress value={50} max={200} />);
    const indicator = container.querySelector('[data-component="progress"] > div');
    expect(indicator?.getAttribute('style')).toContain('width: 25%');
  });

  it('showLabel=trueでラベルが表示される', () => {
    const { container } = render(<Progress value={60} showLabel />);
    expect(container.textContent).toContain('60%');
  });

  it('showLabel=falseでラベルが非表示', () => {
    const { container } = render(<Progress value={60} />);
    expect(container.textContent).not.toContain('60%');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Progress value={50} className="custom-class" />);
    const el = container.querySelector('[data-component="progress"]');
    expect(el).toHaveClass('custom-class');
  });
});
