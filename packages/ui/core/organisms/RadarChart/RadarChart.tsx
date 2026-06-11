'use client'

import { FC, useRef, useState, useEffect } from 'react';

interface RadarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  maxValue?: number;
  size?: number;
  className?: string;
  showLabels?: boolean;
  fillOpacity?: number;
  strokeColor?: string;
  fillColor?: string;
  animated?: boolean;
}

export const RadarChart: FC<RadarChartProps> = ({
  data,
  maxValue = 5,
  size = 250,
  className = '',
  showLabels = true,
  fillOpacity = 0.3,
  strokeColor = '#3b82f6',
  fillColor = '#3b82f6',
  animated = true,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartSize, setChartSize] = useState(size);
  const [isAnimated, setIsAnimated] = useState(!animated);

  useEffect(() => {
    if (svgRef.current) {
      const parentWidth = svgRef.current.parentElement?.offsetWidth || size;
      setChartSize(Math.min(parentWidth, size));
    }
  }, [size]);

  // データ変更時またはマウント時にアニメーションを開始（animatedがtrueの場合のみ）
  useEffect(() => {
    if (animated) {
      setIsAnimated(false);
      const timer = setTimeout(() => setIsAnimated(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animated, data]);

  if (!data || data.length < 3) {
    return <div>データが不足しています</div>;
  }

  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = (chartSize / 2) - 50; // ラベル用スペースを増加
  const angleStep = (2 * Math.PI) / data.length;

  // 各頂点の座標を計算
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // グリッドライン用の座標
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map((level) => {
    const points = data.map((_, index) => {
      const point = getPoint(index, level);
      return `${point.x},${point.y}`;
    });
    return points.join(' ');
  });

  // データポイントの座標
  const dataPoints = data.map((item, index) => getPoint(index, item.value));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // 軸ライン用の座標
  const axisLines = data.map((_, index) => {
    const point = getPoint(index, maxValue);
    return { x1: centerX, y1: centerY, x2: point.x, y2: point.y };
  });

  // ラベルの座標（角度に応じて距離・アンカー・ベースラインを調整）
  const labelPositions = data.map((item, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    // ラベルの距離（上は近く、下は離す）
    const labelDistance = maxValue + 1.5;
    const r = (labelDistance / maxValue) * radius;

    // テキストアンカー（左右の位置調整）
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (cosAngle > 0.3) {
      textAnchor = 'start'; // 右側: 左寄せ
    } else if (cosAngle < -0.3) {
      textAnchor = 'end'; // 左側: 右寄せ
    }

    // ベースライン（上下の位置調整）
    let dominantBaseline: 'hanging' | 'middle' | 'auto' = 'middle';
    if (sinAngle < -0.7) {
      dominantBaseline = 'hanging'; // 上: 下寄せ
    } else if (sinAngle > 0.7) {
      dominantBaseline = 'auto'; // 下: 上寄せ
    }

    return {
      x: centerX + r * cosAngle,
      y: centerY + r * sinAngle,
      label: item.label,
      textAnchor,
      dominantBaseline,
    };
  });

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: chartSize, height: chartSize }}
      data-component="radar-chart"
    >
      <svg
        ref={svgRef}
        width={chartSize}
        height={chartSize}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* グリッドライン */}
        {gridPolygons.map((points, index) => (
          <polygon
            key={index}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* 軸ライン */}
        {axisLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#d1d5db"
            strokeWidth="1"
          />
        ))}

        {/* データエリア */}
        <polygon
          points={dataPolygon}
          fill={fillColor}
          fillOpacity={isAnimated ? fillOpacity : 0}
          stroke={strokeColor}
          strokeWidth="2"
          style={{
            transformOrigin: `${centerX}px ${centerY}px`,
            transform: isAnimated ? 'scale(1)' : 'scale(0)',
            transition: 'transform 1s ease-out, fill-opacity 1s ease-out',
          }}
        />

        {/* データポイント */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={strokeColor}
            stroke="white"
            strokeWidth="2"
            style={{
              opacity: isAnimated ? 1 : 0,
              transition: 'opacity 1s ease-out',
            }}
          />
        ))}

        {/* ラベル */}
        {showLabels &&
          labelPositions.map((pos, index) => (
            <text
              key={index}
              x={pos.x}
              y={pos.y}
              textAnchor={pos.textAnchor}
              dominantBaseline={pos.dominantBaseline}
              fill="#374151"
              fontSize="12"
              fontWeight="500"
            >
              {pos.label}
            </text>
          ))}
      </svg>
    </div>
  );
};

