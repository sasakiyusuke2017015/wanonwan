'use client'

import { FC, useRef, useState, useEffect } from 'react';

interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface LineChartProps {
  data: ChartData;
  width?: string | number;
  height?: number;
  className?: string;
}

export const LineChart: FC<LineChartProps> = ({
  data,
  width = '100%',
  height = 300,
  className = '',
}) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState(800);
  const chartHeight = height;

  useEffect(() => {
    if (svgRef.current && typeof width === 'string' && width.includes('%')) {
      const parentWidth = svgRef.current.parentElement?.offsetWidth || 800;
      setChartWidth(parentWidth || 800);
    } else if (typeof width === 'number') {
      setChartWidth(width);
    }
  }, [width]);

  if (!data || !data.labels || !data.datasets) {
    return <div>No data</div>;
  }

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // 最大値・最小値を計算
  let minValue: number = Infinity;
  let maxValue: number = -Infinity;
  data.datasets.forEach((dataset: ChartDataset) => {
    dataset.data.forEach((value: number) => {
      if (typeof value === 'number' && !isNaN(value)) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });
  });

  // データが存在しない場合のデフォルト値
  if (minValue === Infinity || maxValue === -Infinity) {
    minValue = 0;
    maxValue = 10;
  }

  // Y軸の範囲を調整
  const yRange = maxValue - minValue;
  const yPadding = yRange * 0.1;
  minValue = Math.floor(minValue - yPadding);
  maxValue = Math.ceil(maxValue + yPadding);

  // スケール関数
  const xScale = (index: number): number => {
    return padding.left + (index / (data.labels.length - 1)) * innerWidth;
  };

  const yScale = (value: number): number => {
    return (
      padding.top +
      innerHeight -
      ((value - minValue) / (maxValue - minValue)) * innerHeight
    );
  };

  // Y軸の目盛り
  const yTicks: number[] = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const tickValue = minValue + (maxValue - minValue) * (i / tickCount);
    yTicks.push(tickValue);
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: '100%', height: height + 'px' }}
      data-component="line-chart"
    >
      <svg
        ref={svgRef}
        width={chartWidth}
        height={chartHeight}
        style={{ display: 'block', backgroundColor: '#ffffff' }}
      >
        {/* グリッドライン */}
        <g>
          {yTicks.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={yScale(tick)}
              x2={chartWidth - padding.right}
              y2={yScale(tick)}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Y軸 */}
        <g>
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="1"
          />
          {yTicks.map((tick, i) => (
            <text
              key={i}
              x={padding.left - 10}
              y={yScale(tick) + 5}
              textAnchor="end"
              fill="#6b7280"
              fontSize="12"
            >
              {tick.toFixed(1)}
            </text>
          ))}
        </g>

        {/* X軸 */}
        <g>
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="1"
          />
          {data.labels.map((label: string, i: number) => (
            <text
              key={i}
              x={xScale(i)}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
            >
              {label}
            </text>
          ))}
        </g>

        {/* データライン */}
        {data.datasets.map((dataset: ChartDataset, datasetIndex: number) => (
          <g key={datasetIndex}>
            {/* 折れ線 */}
            <polyline
              points={dataset.data
                .map(
                  (value: number, i: number) => `${xScale(i)},${yScale(value)}`
                )
                .join(' ')}
              fill="none"
              stroke={dataset.color || '#3b82f6'}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* データポイント */}
            {dataset.data.map((value: number, i: number) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(value)}
                r="4"
                fill={dataset.color || '#3b82f6'}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </g>
        ))}

        {/* 凡例 */}
        <g transform={`translate(${chartWidth - 150}, 10)`}>
          {data.datasets.map((dataset: ChartDataset, i: number) => (
            <g key={i} transform={`translate(0, ${i * 20})`}>
              <rect
                x="0"
                y="0"
                width="15"
                height="2"
                fill={dataset.color || '#3b82f6'}
              />
              <text x="20" y="5" fill="#4b5563" fontSize="12">
                {dataset.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

