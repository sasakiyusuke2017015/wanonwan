'use client'

// src/components/common/atoms/Slider.tsx
import { FC, ChangeEvent } from 'react';

import { useOperationLog } from '../../../infra/devtools';

interface SliderProps {
  /** 現在の値 */
  value: number;
  /** 値変更時のコールバック */
  onChange: (value: number) => void;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** ステップ */
  step?: number;
  /** ラベル */
  label?: string;
  /** 値の表示フォーマット関数 */
  formatValue?: (value: number) => string;
  /** 無効化 */
  disabled?: boolean;
  /** 幅 */
  width?: string;
}

/**
 * スライダーコンポーネント
 */
export const Slider: FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue = (v) => v.toString(),
  disabled = false,
  width = 'w-full',
}) => {
  const log = useOperationLog('Slider');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    log('change', { value: newValue, label });
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col space-y-1 ${width}`} data-component="slider">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-fluid-xs font-semibold text-gray-700">{label}</label>
          <span className="text-fluid-xs font-medium text-gray-600">{formatValue(value)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          accentColor: '#3b82f6', // blue-500
        }}
      />
    </div>
  );
};
