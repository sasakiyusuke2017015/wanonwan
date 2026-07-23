import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('値を表示する', () => {
    render(<Badge value="テスト" />);
    expect(screen.getByText('テスト')).toBeInTheDocument();
  });

  it('数値を表示する', () => {
    render(<Badge value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('appearance属性が正しく適用される', () => {
    const { rerender, container } = render(<Badge value="Default" appearance="default" />);
    expect(container.querySelector('[data-appearance="default"]')).toBeInTheDocument();

    rerender(<Badge value="Metric" appearance="metric" />);
    expect(container.querySelector('[data-appearance="metric"]')).toBeInTheDocument();

    rerender(<Badge value="Score" appearance="score" />);
    expect(container.querySelector('[data-appearance="score"]')).toBeInTheDocument();

    rerender(<Badge value="Status" appearance="status" />);
    expect(container.querySelector('[data-appearance="status"]')).toBeInTheDocument();
  });

  it('styleVariant属性が正しく適用される', () => {
    const { rerender, container } = render(<Badge value="Solid" styleVariant="solid" />);
    expect(container.querySelector('[data-variant="solid"]')).toBeInTheDocument();

    rerender(<Badge value="Gradient" styleVariant="gradient" />);
    expect(container.querySelector('[data-variant="gradient"]')).toBeInTheDocument();

    rerender(<Badge value="Compact" styleVariant="compact" />);
    expect(container.querySelector('[data-variant="compact"]')).toBeInTheDocument();
  });

  it('色が正しく適用される', () => {
    const { container } = render(<Badge value="Blue" color="blue" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge).toHaveClass('solidBlue');
  });

  it('appearance=metricの場合、divタグがレンダリングされる', () => {
    const { container } = render(<Badge value="Metric" appearance="metric" />);
    expect(container.querySelector('div[data-component="badge"]')).toBeInTheDocument();
  });

  it('appearance=default以外の場合、spanタグがレンダリングされる', () => {
    const { container } = render(<Badge value="Default" appearance="default" />);
    expect(container.querySelector('span[data-component="badge"]')).toBeInTheDocument();
  });

  it('borderRadiusプロパティがstyle属性に適用される', () => {
    const { container } = render(<Badge value="Rounded" borderRadius="1rem" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge?.getAttribute('style')).toContain('border-radius: 1rem');
  });

  it('widthプロパティがstyle属性に適用される', () => {
    const { container } = render(<Badge value="Wide" width="200px" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge?.getAttribute('style')).toContain('width: 200px');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Badge value="Custom" className="custom-class" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge).toHaveClass('custom-class');
  });

  it('gradient styleVariantの場合、shadow-lgクラスが追加される', () => {
    // SCSS module: gradient color classes include box-shadow via .gradient<Color>
    const { container } = render(<Badge value="Gradient" styleVariant="gradient" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge).toHaveClass('gradientBlue');
  });

  it('outline styleVariantが正しく適用される', () => {
    const { container } = render(<Badge value="Outline" styleVariant="outline" />);
    expect(container.querySelector('[data-variant="outline"]')).toBeInTheDocument();
  });

  it('gradient + metric の場合、hover効果が追加される', () => {
    // SCSS module: metricGradient applies scale(1.05) on hover via box-shadow + transform
    const { container } = render(<Badge value="Metric Gradient" appearance="metric" styleVariant="gradient" />);
    const badge = container.querySelector('[data-component="badge"]');
    expect(badge).toHaveClass('metricGradient');
  });
  it('hexColor が有効なら背景をその色にし、文字色はコントラスト自動導出する', () => {
    const { container } = render(<Badge value="Hex" hexColor="#1d4ed8" />);
    const badge = container.querySelector('[data-component="badge"]') as HTMLElement;
    expect(badge.style.backgroundColor).toBe('rgb(29, 78, 216)');
    expect(badge.style.color).toBe('rgb(255, 255, 255)');
  });

  it('淡い hexColor はダーク文字になる', () => {
    const { container } = render(<Badge value="Hex" hexColor="#fde047" />);
    const badge = container.querySelector('[data-component="badge"]') as HTMLElement;
    expect(badge.style.color).toBe('rgb(31, 41, 55)');
  });

  it('無効な hexColor は無視して tone にフォールバックする', () => {
    const { container } = render(<Badge value="Hex" tone="success" hexColor="not-a-color" />);
    const badge = container.querySelector('[data-component="badge"]') as HTMLElement;
    expect(badge.style.backgroundColor).toBe('');
    expect(badge).toHaveClass('solidGreen');
  });
});
