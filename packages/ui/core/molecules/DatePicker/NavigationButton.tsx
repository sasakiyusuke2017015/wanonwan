'use client'

/**
 * ナビゲーションボタン
 */
import { FC, memo } from 'react';
import { Icon } from '../../atoms/Icon';

import { NAV_ICON_SIZES } from './constants';
import type { DatePickerSize } from './types';

interface Props {
  direction: 'prev' | 'next';
  size: DatePickerSize;
  borderRadius: string;
  disabled: boolean;
  onClick: () => void;
}

export const NavigationButton: FC<Props> = memo(({ direction, size, borderRadius, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      border border-gray-600 p-2.5 transition-all duration-200
      focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
      ${disabled
        ? 'cursor-not-allowed border-gray-600 bg-gray-700 text-gray-400 opacity-60'
        : 'bg-gray-800 text-white shadow-sm hover:border-gray-500 hover:bg-gray-700 hover:shadow-md'
      }
    `}
    style={{ borderRadius }}
    aria-label={direction === 'prev' ? '前月' : '次月'}
  >
    <Icon
      name={direction === 'prev' ? 'chevron-left' : 'chevron-right'}
      size={NAV_ICON_SIZES[size]}
      className="transition-colors duration-200"
    />
  </button>
));

NavigationButton.displayName = 'NavigationButton';
