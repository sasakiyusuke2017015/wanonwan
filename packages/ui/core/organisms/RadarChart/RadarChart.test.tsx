import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadarChart } from './RadarChart';

// screenはエラーメッセージのテストで使用

describe('RadarChart', () => {
  const sampleData = [
    { label: '項目A', value: 4 },
    { label: '項目B', value: 3 },
    { label: '項目C', value: 5 },
    { label: '項目D', value: 2 },
    { label: '項目E', value: 4 },
  ];

  it('data-component属性が正しく設定される', () => {
    const { container } = render(<RadarChart data={sampleData} animated={false} />);
    const chart = container.querySelector('[data-component="radar-chart"]');
    expect(chart).toBeInTheDocument();
  });

  it('データが3件未満の場合はエラーメッセージを表示する', () => {
    const insufficientData = [
      { label: '項目A', value: 4 },
      { label: '項目B', value: 3 },
    ];
    render(<RadarChart data={insufficientData} />);
    expect(screen.getByText('データが不足しています')).toBeInTheDocument();
  });

  it('showLabels=falseの場合、ラベルが表示されない', () => {
    const { container } = render(
      <RadarChart data={sampleData} showLabels={false} animated={false} />
    );
    const labels = container.querySelectorAll('text');
    expect(labels.length).toBe(0);
  });

  it('showLabels=trueの場合、ラベルが表示される', () => {
    const { container } = render(
      <RadarChart data={sampleData} showLabels={true} animated={false} />
    );
    const labels = container.querySelectorAll('text');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('sizeプロパティがコンテナのサイズに適用される', () => {
    const { container } = render(
      <RadarChart data={sampleData} size={300} animated={false} />
    );
    const chartContainer = container.querySelector('[data-component="radar-chart"]') as HTMLElement;
    expect(chartContainer).toHaveStyle({ width: '300px', height: '300px' });
  });

  it('SVG要素が正しく描画される', () => {
    const { container } = render(<RadarChart data={sampleData} animated={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('データポイントの数だけcircle要素が描画される', () => {
    const { container } = render(<RadarChart data={sampleData} animated={false} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(sampleData.length);
  });

  it('グリッドラインが正しく描画される', () => {
    const { container } = render(<RadarChart data={sampleData} animated={false} />);
    const gridPolygons = container.querySelectorAll('polygon[fill="none"]');
    expect(gridPolygons.length).toBeGreaterThan(0);
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <RadarChart data={sampleData} className="custom-class" animated={false} />
    );
    const chart = container.querySelector('[data-component="radar-chart"]');
    expect(chart?.className).toContain('custom-class');
  });

  it('fillColorとstrokeColorがpolygonに適用される', () => {
    const { container } = render(
      <RadarChart
        data={sampleData}
        fillColor="#ff0000"
        strokeColor="#00ff00"
        animated={false}
      />
    );
    const dataPolygon = container.querySelector('polygon[fill="#ff0000"]');
    expect(dataPolygon).toBeInTheDocument();
    expect(dataPolygon).toHaveAttribute('stroke', '#00ff00');
  });
});
