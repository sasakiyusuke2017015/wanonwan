'use client'

import { FC, useEffect, useRef, useState, memo } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// recharts の onClick 型（v2.15+ では CategoricalChartFunc が廃止）
type ChartClickHandler = (data: { activeLabel?: string | number } | null) => void;

import type { TrendChartProps, DatasetState, DataPointClickData } from './types';
import styles from './TrendChart.module.scss';

const TrendChartInner: FC<TrendChartProps> = ({
  data,
  height = 250,
  className = '',
  animationDuration = 1000,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  maxValue = null,
  minValue = 0,
  showParticles = false,
  onDataPointClick,
  onMonthClick,
  currentMonth,
  cardRadius = '0.5rem', // デフォルト値
}) => {
  // Canvas effects state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [animationTime, setAnimationTime] = useState<number>(0);
  const animationIdRef = useRef<number | null>(null);

  // 系列の表示状態を管理（normal: 通常, bold: 太く, hidden: 非表示）
  const [datasetStates, setDatasetStates] = useState<Record<string, DatasetState>>({});

  // ハイライトアニメーション方向の管理
  const prevCurrentMonthRef = useRef<string | undefined>(undefined);
  const [highlightDirection, setHighlightDirection] = useState<'bottom' | 'left' | 'right'>('bottom');

  // アニメーション用の内部データ
  const [internalData, setInternalData] = useState(data);

  // アニメーション制御フラグ
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // dataが変わったらアニメーションをリセットしてから更新
  useEffect(() => {
    setShouldAnimate(false);
    const frameId = window.requestAnimationFrame(() => {
      setInternalData(data);
      setShouldAnimate(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [data]);

  // currentMonthが変更されたときにハイライト方向を判定
  useEffect(() => {
    if (!currentMonth) {
      prevCurrentMonthRef.current = undefined;
      setHighlightDirection('bottom');
      return;
    }

    const prevMonth = prevCurrentMonthRef.current;

    if (!prevMonth) {
      // 初回表示は下から
      setHighlightDirection('bottom');
    } else {
      // 月のインデックスを取得して方向を判定
      const currentIndex = data.labels.findIndex((label) => {
        const parts = String(label).split('/');
        if (parts.length === 2) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          return `${year}-${month}` === currentMonth;
        }
        return false;
      });

      const prevIndex = data.labels.findIndex((label) => {
        const parts = String(label).split('/');
        if (parts.length === 2) {
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          return `${year}-${month}` === prevMonth;
        }
        return false;
      });

      if (currentIndex >= 0 && prevIndex >= 0) {
        if (currentIndex > prevIndex) {
          setHighlightDirection('right');
        } else if (currentIndex < prevIndex) {
          setHighlightDirection('left');
        } else {
          setHighlightDirection('bottom');
        }
      } else {
        setHighlightDirection('bottom');
      }
    }

    prevCurrentMonthRef.current = currentMonth;
  }, [currentMonth, data.labels]);

  // Canvas animation loop
  useEffect(() => {
    if (!showParticles) return;

    const animate = () => {
      setAnimationTime((prev) => prev + 0.02);
      animationIdRef.current = window.requestAnimationFrame(animate);
    };

    animationIdRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        window.cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [showParticles]);

  // データを Recharts 形式に変換（nullはそのまま保持してrechartsに渡す）
  const chartData = internalData.labels.map((label, index) => {
    const point: Record<string, string | number | null> = { name: label };
    internalData.datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index];
    });
    return point;
  });

  // Canvas effects drawing
  useEffect(() => {
    if (!showParticles || !canvasRef.current || !data?.datasets) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, height);

    // 背景パーティクル
    for (let i = 0; i < 20; i++) {
      const x = (i / 20) * 400 + Math.sin(animationTime + i) * 30;
      const y = Math.sin(animationTime * 0.5 + i * 0.3) * 100 + 150;
      const alpha = 0.2 + Math.sin(animationTime * 2 + i) * 0.1;
      const size = 2 + Math.sin(animationTime * 3 + i) * 1;

      ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // データトレイル
    data.datasets.forEach((dataset, datasetIndex) => {
      const colorHex = (dataset.color || '#3B82F6').replace('#', '');
      const r = parseInt(colorHex.slice(0, 2), 16);
      const g = parseInt(colorHex.slice(2, 4), 16);
      const b = parseInt(colorHex.slice(4, 6), 16);

      // データポイント周辺のグロー効果
      const validData = dataset.data.filter((v): v is number => v !== null);
      dataset.data.forEach((value, index) => {
        if (value === null) return;
        const x = (index / (data.labels.length - 1)) * 400;
        const normalizedValue =
          (value - minValue) /
          ((maxValue || Math.max(...validData)) - minValue);
        const y = (1 - normalizedValue) * 200 + 50;

        // パルス効果
        const pulseSize =
          8 + Math.sin(animationTime * 3 + index + datasetIndex) * 4;
        const pulseAlpha = 0.4 + Math.sin(animationTime * 2 + index) * 0.3;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // 軌跡エフェクト
        if (index > 0) {
          const prevValue = dataset.data[index - 1];
          if (prevValue === null) return;
          const prevX = ((index - 1) / (data.labels.length - 1)) * 400;
          const prevNormalizedValue =
            (prevValue - minValue) /
            ((maxValue || Math.max(...validData)) - minValue);
          const prevY = (1 - prevNormalizedValue) * 200 + 50;

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });
    });
  }, [animationTime, data, height, maxValue, minValue, showParticles]);

  // 線クリックハンドラー（normal ↔ bold のトグル）
  const handleLineClick = (
    datasetLabel: string,
    data?: Record<string, unknown>
  ) => {
    setDatasetStates((prev) => {
      const currentState = prev[datasetLabel] || 'normal';
      if (currentState === 'hidden') {
        return prev;
      }
      const nextState: DatasetState = currentState === 'bold' ? 'normal' : 'bold';
      return { ...prev, [datasetLabel]: nextState };
    });

    if (onDataPointClick && data) {
      const clickedData: DataPointClickData = {
        label: datasetLabel,
        value: (data[datasetLabel] as number) || 0,
        month: (data.name as string) || '',
        allData: data,
      };
      onDataPointClick(clickedData);
    }
  };

  // 月クリックハンドラー
  const handleMonthClick = (monthLabel: string) => {
    if (!onMonthClick) return;

    const parts = monthLabel.split('/');
    if (parts.length === 2) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const formattedMonth = `${year}-${month}`;
      onMonthClick(formattedMonth);
    }
  };

  // 凡例クリックハンドラー（3状態サイクル: normal → bold → hidden → normal）
  const handleLegendClick = (datasetLabel: string) => {
    setDatasetStates((prev) => {
      const currentState = prev[datasetLabel] || 'normal';
      let nextState: DatasetState;

      switch (currentState) {
        case 'normal':
          nextState = 'bold';
          break;
        case 'bold':
          nextState = 'hidden';
          break;
        case 'hidden':
        default:
          nextState = 'normal';
          break;
      }

      return { ...prev, [datasetLabel]: nextState };
    });
  };

  // カスタムツールチップ
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip} style={{ borderRadius: cardRadius }}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload?.map((entry, index: number) => (
            <p
              key={`item-${index}`}
              className={styles.tooltipEntry}
              style={{ color: entry.color }}
            >
              <span className={styles.tooltipEntryName}>{entry.name}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // カスタム凡例コンポーネント（datasetsの順序をそのまま使用）
  const CustomLegend = () => {
    return (
      <div className={styles.legendWrapper}>
        <div className={styles.legendBar} style={{ borderRadius: cardRadius }}>
          {internalData.datasets.map((dataset, index) => {
            const state = datasetStates[dataset.label] || 'normal';
            const isHidden = state === 'hidden';
            const isBold = state === 'bold';

            return (
              <div
                key={`item-${index}`}
                className={styles.legendItem}
                onClick={() => handleLegendClick(dataset.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLegendClick(dataset.label);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${dataset.label}の表示を切り替え`}
              >
                <span
                  className={styles.legendLine}
                  style={{
                    backgroundColor: isHidden ? '#d1d5db' : (dataset.color || '#3b82f6'),
                    height: isBold ? '3px' : '2px',
                  }}
                />
                <span
                  className={[
                    styles.legendLabel,
                    isHidden
                      ? styles['legendLabel--hidden']
                      : isBold
                        ? styles['legendLabel--bold']
                        : styles['legendLabel--normal'],
                  ].filter(Boolean).join(' ')}
                >
                  {dataset.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ラベル数が多い場合は斜め表示
  const shouldRotateLabels = chartData.length > 7;

  // カスタムX軸Tick
  const CustomXAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number | string;
    y: number | string;
    payload: { value: string };
  }) => {
    const isCurrentMonth = currentMonth
      ? (() => {
          const parts = payload.value.split('/');
          if (parts.length === 2) {
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const formattedPayload = `${year}-${month}`;
            return formattedPayload === currentMonth;
          }
          return false;
        })()
      : false;

    return (
      <g transform={`translate(${x},${y})${shouldRotateLabels ? ' rotate(-45)' : ''}`}>
        <text
          x={0}
          y={0}
          dy={shouldRotateLabels ? 8 : 16}
          textAnchor={shouldRotateLabels ? 'end' : 'middle'}
          fill={isCurrentMonth ? '#2563EB' : '#6b7280'}
          fontSize={shouldRotateLabels ? 10 : 12}
          fontWeight={isCurrentMonth ? 'bold' : 'normal'}
          onClick={(e) => {
            e.stopPropagation();
            handleMonthClick(payload.value);
          }}
          style={{ cursor: onMonthClick ? 'pointer' : 'default' }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-component="trend-chart"
    >
      {/* 凡例（チャートの外に独立配置） */}
      {showLegend && <CustomLegend />}

      {/* Canvas Effects Overlay */}
      <div className={styles.chartContainer} style={{ height: `${height}px` }}>
        {showParticles && (
          <div className={styles.canvasOverlay}>
            <canvas
              ref={canvasRef}
              width={400}
              height={height}
              style={{
                backgroundColor: 'transparent',
                display: 'block',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}

        {/* メインチャート */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: shouldRotateLabels ? 40 : 5,
            }}
            onClick={((e: { activeLabel?: string | number } | null) => {
              if (e && e.activeLabel && onMonthClick) {
                handleMonthClick(String(e.activeLabel));
              }
            }) as ChartClickHandler}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                opacity={0.8}
              />
            )}

            <XAxis
              dataKey="name"
              tick={(props: { x: number | string; y: number | string; payload: { value: string } }) => (
                <CustomXAxisTick x={props.x} y={props.y} payload={props.payload} />
              )}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />

            <YAxis
              domain={[0, 6]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value: number) => `${value}`}
              width={30}
            />

            {showTooltip && <Tooltip content={<CustomTooltip />} />}

          {/* currentMonthに一致する縦方向のハイライト */}
          {currentMonth &&
            (() => {
              const currentIndex = chartData.findIndex((item) => {
                const parts = String(item.name).split('/');
                if (parts.length === 2) {
                  const year = parts[0];
                  const month = parts[1].padStart(2, '0');
                  return `${year}-${month}` === currentMonth;
                }
                return false;
              });

              if (currentIndex >= 0) {
                const monthName = chartData[currentIndex].name as string;
                const animationClass =
                  highlightDirection === 'right' ? 'trend-highlight-from-right' :
                  highlightDirection === 'left' ? 'trend-highlight-from-left' :
                  'trend-highlight-from-bottom';

                return (
                  <ReferenceLine
                    key={`${monthName}-${highlightDirection}`}
                    x={monthName}
                    stroke="#3B82F6"
                    strokeWidth={20}
                    strokeOpacity={0.15}
                    className={animationClass}
                  />
                );
              }
              return null;
            })()}

          {internalData.datasets.map((dataset, index) => {
            const state = datasetStates[dataset.label] || 'normal';
            const isHidden = state === 'hidden';
            const isBold = state === 'bold';

            const strokeWidth = isBold ? 4 : 2;

            return (
              <Line
                key={index}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.color || '#3b82f6'}
                strokeWidth={strokeWidth}
                dot={{
                  fill: dataset.color || '#3b82f6',
                  r: isBold ? 5 : 4,
                  style: { outline: 'none' },
                }}
                activeDot={{
                  r: isBold ? 7 : 6,
                  onClick: (_event: unknown, payload: unknown) => {
                    const typedPayload = payload as {
                      payload: Record<string, unknown>;
                    };
                    handleLineClick(dataset.label, typedPayload.payload);
                  },
                  style: { cursor: 'pointer', outline: 'none' },
                }}
                connectNulls={true}
                animationDuration={animationDuration}
                isAnimationActive={shouldAnimate}
                hide={isHidden}
              />
            );
          })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TrendChart = memo(TrendChartInner);
