'use client'

import { ReactNode } from 'react';

import { motion } from 'framer-motion';

import { useOperationLog } from '../../../infra/devtools';
import { Icon } from '../../atoms/Icon';
import { IconName } from '../../constants';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName | ReactNode;
}

export interface SegmentProps<T extends string> {
  /** 現在選択されている値 */
  value: T;
  /** 値が変更された時のコールバック */
  onChange: (value: T) => void;
  /** 選択肢の配列 */
  options: SegmentOption<T>[];
  /** サイズ */
  size?: 'small' | 'medium' | 'large';
  /** 無効化 */
  disabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** 角丸（例: '8px', '0.375rem'） */
  borderRadius?: string;
}

/**
 * Segment（セグメントコントロール）
 *
 * 複数の選択肢から1つを選ぶコントロール。
 * 立体的なデザインと滑らかなアニメーションを備えています。
 *
 * @example
 * ```tsx
 * <Segment
 *   value={viewMode}
 *   onChange={setViewMode}
 *   options={[
 *     { value: 'table', label: 'テーブル', icon: 'list' },
 *     { value: 'card', label: 'カード', icon: 'dashboard' },
 *   ]}
 *   size="medium"
 * />
 * ```
 */
export function Segment<T extends string>({
  value,
  onChange,
  options,
  size = 'medium',
  disabled = false,
  className = '',
  borderRadius = '0.375rem',
}: SegmentProps<T>) {
  const log = useOperationLog('Segment');
  const activeIndex = options.findIndex((opt) => opt.value === value);

  const handleChange = (newValue: T) => {
    if (!disabled) {
      log('select', { from: value, to: newValue });
      onChange(newValue);
    }
  };

  const sizeStyles = {
    small: { container: 'p-1', button: 'py-0.5 px-2 text-fluid-xs gap-1', icon: 14, padding: 4 },
    medium: { container: 'p-1.5', button: 'py-1 px-3 text-fluid-sm gap-1.5', icon: 16, padding: 6 },
    large: { container: 'p-2', button: 'py-1.5 px-4 text-fluid-base gap-2', icon: 18, padding: 8 },
  };

  const renderIcon = (iconProp?: IconName | ReactNode, iconSize?: number) => {
    if (!iconProp) return null;
    if (typeof iconProp === 'string') {
      return <Icon name={iconProp as IconName} size={iconSize} />;
    }
    return iconProp;
  };

  return (
    <div
      className={`relative flex items-center gap-0 ${sizeStyles[size].container} ${className}`}
      data-component="segment"
      data-size={size}
      style={{
        borderRadius,
        background: 'linear-gradient(to bottom, #e0e0e0, #f5f5f5)',
        boxShadow:
          'inset 0 2px 4px rgba(0, 0, 0, 0.2), ' +
          'inset 0 -1px 2px rgba(255, 255, 255, 0.8), ' +
          '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* アニメーションインジケーター */}
      <motion.div
        className="absolute"
        style={{
          top: `${sizeStyles[size].padding}px`,
          width: `calc((100% - ${sizeStyles[size].padding * 2}px) / ${options.length})`,
          height: `calc(100% - ${sizeStyles[size].padding * 2}px)`,
          borderRadius: `calc(${borderRadius} - 2px)`,
          background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
          boxShadow:
            '0 6px 12px -2px rgba(16, 185, 129, 0.4), ' +
            '0 3px 7px -3px rgba(16, 185, 129, 0.3), ' +
            'inset 0 1px 0 rgba(255, 255, 255, 0.4), ' +
            'inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
          pointerEvents: 'none' as const,
          left: `calc(${sizeStyles[size].padding}px + (100% - ${sizeStyles[size].padding * 2}px) * ${activeIndex} / ${options.length})`,
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 28,
          mass: 0.9,
        }}
      />

      {/* ボタン群 */}
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={`relative flex flex-1 items-center justify-center whitespace-nowrap z-10 ${sizeStyles[size].button} ${
              isActive ? 'text-white font-bold' : 'text-gray-700 hover:text-gray-900'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={
              isActive
                ? {
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }
                : {
                    transition: 'all 0.2s ease',
                  }
            }
            title={option.label}
          >
            {renderIcon(option.icon, sizeStyles[size].icon)}
            <span>{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
