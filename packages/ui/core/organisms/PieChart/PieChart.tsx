'use client'

import React, { useState, memo } from 'react';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { isNullish } from '../../utils';

interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

interface PieChartProps {
  data: PieChartDataItem[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  /** 値の単位（デフォルト: "名"） */
  unit?: string;
  /** カードの角丸 - Layout から props で渡す */
  cardRadius?: string;
}

const PieChartInner: React.FC<PieChartProps> = ({
  data,
  size = 60,
  innerRadius = 0,
  outerRadius = 0.4,
  unit = '名',
  cardRadius = '0.5rem', // デフォルト値
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ホバー中のセルの角度範囲を計算
  const getHoveredCellAngles = (index: number) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 90; // 開始角度(上から時計回り)

    // 指定されたインデックスまでの累積値を計算
    for (let i = 0; i < index; i++) {
      const angle = (data[i].value / total) * 360;
      startAngle -= angle;
    }

    // そのセルの終了角度を計算
    const cellAngle = (data[index].value / total) * 360;
    const endAngle = startAngle - cellAngle;

    return { startAngle, endAngle };
  };

  // ホバー中のセルの中心角度からTooltipのX位置を計算
  const getTooltipXPosition = (index: number) => {
    const { startAngle, endAngle } = getHoveredCellAngles(index);
    // セルの中心角度（度）
    const midAngle = (startAngle + endAngle) / 2;
    // ラジアンに変換
    const radians = (midAngle * Math.PI) / 180;
    // 円の外側に配置（outerRadius + オフセット）
    const radius = size * outerRadius + 20;
    // X座標のみ計算
    const x = size / 2 + radius * Math.cos(radians);
    return x;
  };
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: PieChartDataItem }> }) => {
    // ホバー状態と連動してツールチップを表示
    if (active && payload && payload.length && !isNullish(hoveredIndex)) {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      const color = payload[0].payload.color;

      return (
        <div className="min-w-[120px] border-2 border-gray-300 bg-white px-3 py-2 shadow-xl" style={{ borderRadius: cardRadius }}>
          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <p className="text-fluid-sm font-semibold text-gray-800">
              {payload[0].name}
            </p>
          </div>
          <div className="text-fluid-xs text-gray-600">
            <p>人数: {payload[0].value}{unit}</p>
            <p>割合: {percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{ width: size, height: size }}
      onMouseLeave={() => setHoveredIndex(null)}
      data-component="pie-chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * innerRadius}
            outerRadius={size * outerRadius}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={true}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#374151"
                strokeWidth={1}
                style={{
                  filter: 'drop-shadow(0 0 0 transparent)',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                tabIndex={0}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                }}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
              />
            ))}
          </Pie>

          {/* ホバー時の外周リング(該当セルの範囲のみ) */}
          {!isNullish(hoveredIndex) &&
            (() => {
              const { startAngle, endAngle } =
                getHoveredCellAngles(hoveredIndex);
              return (
                <Pie
                  data={[data[hoveredIndex]]}
                  cx="50%"
                  cy="50%"
                  innerRadius={size * outerRadius + 2}
                  outerRadius={size * outerRadius + 6}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={startAngle}
                  endAngle={endAngle}
                  stroke="none"
                  fill={data[hoveredIndex].color}
                  isAnimationActive={true}
                  animationDuration={200}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))',
                    opacity: 0.8,
                  }}
                />
              );
            })()}

          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000 }}
            isAnimationActive={true}
            animationDuration={200}
            cursor={false}
            position={{ x: !isNullish(hoveredIndex) ? getTooltipXPosition(hoveredIndex) : size / 2, y: size }}
            active={!isNullish(hoveredIndex)}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChart = memo(PieChartInner);
