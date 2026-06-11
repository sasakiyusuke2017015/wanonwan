'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { useOperationLog } from '../../../infra/devtools';
import { cn } from '../../utils/cn';

import { Checkbox } from '../../atoms/Checkbox';
import { Icon } from '../../atoms/Icon';

interface SelectOption<T = string | number> {
  value: T;
  label: string;
}

type SelectVariant = 'default' | 'dark';

type SelectSize = 'small' | 'medium' | 'large';

/** 共通Props */
interface SelectBaseProps<T = string | number> {
  options: SelectOption<T>[];
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  className?: string;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  width?: string;
  allowEmpty?: boolean;
  /** borderRadius（形状設定用） - Layout から props で渡す */
  borderRadius?: string;
}

/** 単一選択Props */
interface SingleSelectProps<T = string | number> extends SelectBaseProps<T> {
  multiple?: false;
  value?: T;
  onChange: (value: T | undefined) => void;
}

/** 複数選択Props */
interface MultipleSelectProps<T = string | number> extends SelectBaseProps<T> {
  multiple: true;
  value: T[];
  onChange: (values: T[]) => void;
  /** 複数選択時の表示テンプレート（デフォルト: '選択中: {count}件'） */
  selectedLabel?: (count: number) => string;
}

type SelectProps<T = string | number> = SingleSelectProps<T> | MultipleSelectProps<T>;

/** 複数選択オプション行（liホバーでCheckboxのforceHoveredを制御） */
const MultiSelectOption = ({
  isSelected,
  label,
  size,
  onClick,
  className,
  onKeyDown,
  isVisible: _isVisible,
}: {
  isSelected: boolean;
  label: string;
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  className: string;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isVisible: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
    >
      <span className="pointer-events-none flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          readOnly
          size={size === 'large' ? 'medium' : 'small'}
          forceHovered={isHovered}
        />
        <span className={size === 'large' ? 'text-fluid-base' : 'text-fluid-sm'}>{label}</span>
      </span>
    </li>
  );
};

export const Select = <T extends string | number = string>(props: SelectProps<T>) => {
  const {
    options,
    placeholder = '-',
    variant = 'default',
    size = 'medium',
    className = '',
    label,
    labelClassName = '',
    disabled,
    id,
    name,
    width = 'w-[180px]',
    allowEmpty = true,
    borderRadius = '0.375rem',
  } = props;

  const log = useOperationLog('Select');

  // サイズ別スタイル（Inputコンポーネントと統一）
  const sizeStyles = {
    small: { button: 'px-2 py-1 text-fluid-sm', option: 'px-2 py-1 text-fluid-sm', icon: 14, rightPad: 'pr-7' },
    medium: { button: 'px-3 py-2', option: 'px-3 py-2', icon: 16, rightPad: 'pr-10' },
    large: { button: 'px-4 py-3 text-fluid-lg', option: 'px-4 py-3 text-fluid-lg', icon: 18, rightPad: 'pr-12' },
  };
  const sizeStyle = sizeStyles[size];

  const isMultiple = props.multiple === true;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Staggerアニメーション: ドロップダウンが開いた時に順番に表示
  useEffect(() => {
    if (isOpen) {
      setVisibleCount(0);
      const totalItems = (!isMultiple && allowEmpty ? 1 : 0) + options.length;
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= totalItems) {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    } else {
      setVisibleCount(0);
    }
  }, [isOpen, options.length, allowEmpty, isMultiple]);

  // 単一選択: 選択中の値がオプションにない場合は最初のオプションにフォールバック
  useEffect(() => {
    if (isMultiple) return;
    const singleProps = props as SingleSelectProps<T>;
    if (singleProps.value === undefined) return;
    const valueExists = options.some((opt) => opt.value === singleProps.value);
    if (!valueExists && options.length > 0) {
      singleProps.onChange(options[0].value);
    }
  }, [isMultiple, options, props]);

  // 単一選択: 選択中のオプションを取得
  const selectedOption = !isMultiple
    ? options.find((opt) => opt.value === props.value)
    : undefined;

  // 複数選択: 選択件数
  const multipleCount = isMultiple ? (props.value as T[]).length : 0;

  // ボタンの表示テキスト
  const displayText = isMultiple
    ? multipleCount > 0
      ? (props as MultipleSelectProps<T>).selectedLabel
        ? (props as MultipleSelectProps<T>).selectedLabel!(multipleCount)
        : `選択中: ${multipleCount}件`
      : placeholder
    : selectedOption
      ? selectedOption.label
      : placeholder;

  const hasValue = isMultiple ? multipleCount > 0 : !!selectedOption;

  // ドロップダウン位置を計算
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // isOpen変更時に位置を計算
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen, updateDropdownPosition]);

  // スクロール・リサイズ時に位置を再計算
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => updateDropdownPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateDropdownPosition]);

  // クリック外で閉じる（Portal対応）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inSelect = selectRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inSelect && !inDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // キーボード操作
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (!isMultiple) {
          const singleProps = props as SingleSelectProps<T>;
          const currentIndex = options.findIndex((opt) => opt.value === singleProps.value);
          const nextIndex = Math.min(currentIndex + 1, options.length - 1);
          singleProps.onChange(options[nextIndex].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen && !isMultiple) {
          const singleProps = props as SingleSelectProps<T>;
          const currentIndex = options.findIndex((opt) => opt.value === singleProps.value);
          const prevIndex = Math.max(currentIndex - 1, 0);
          singleProps.onChange(options[prevIndex].value);
        }
        break;
    }
  };

  const handleSingleOptionClick = (optionValue: T) => {
    const selectedLabel = options.find((opt) => opt.value === optionValue)?.label;
    log('select', { value: optionValue, label: selectedLabel, multiple: false });
    (props as SingleSelectProps<T>).onChange(optionValue);
    setIsOpen(false);
  };

  const handleMultipleOptionClick = (optionValue: T) => {
    const multiProps = props as MultipleSelectProps<T>;
    const currentValues = multiProps.value;
    const isDeselect = currentValues.includes(optionValue);
    const newValues = isDeselect
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    const selectedLabel = options.find((opt) => opt.value === optionValue)?.label;
    log(isDeselect ? 'deselect' : 'select', { value: optionValue, label: selectedLabel, multiple: true, count: newValues.length });
    multiProps.onChange(newValues);
  };

  // バリアント別のスタイル（サイズ依存のpadding/font-sizeはsizeStyleで制御）
  const variantStyles = {
    default: {
      button:
        'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
      dropdown: 'bg-white border border-gray-200',
      option: 'text-gray-700 hover:bg-blue-50',
      optionSelected: 'bg-blue-100 text-blue-900',
    },
    dark: {
      button:
        'bg-gray-700 text-white border border-gray-600 shadow-sm hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors duration-200',
      dropdown: 'bg-gray-700 border border-gray-600',
      option: 'text-white hover:bg-gray-600',
      optionSelected: 'bg-gray-600 text-white',
    },
  };

  const styles = variantStyles[variant];

  // 自動生成ID
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const buttonStyle: React.CSSProperties = {
    ...(!disabled && isHovered ? { boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.3)' } : {}),
    borderRadius,
  };

  const selectElement = (
    <div
      className="relative"
      ref={selectRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-component="select"
      data-variant={variant}
    >
      {/* Hidden input for form compatibility */}
      {name && !isMultiple && (
        <input type="hidden" name={name} value={props.value ? String(props.value) : ''} />
      )}

      {/* Custom select button */}
      <button
        ref={buttonRef}
        type="button"
        id={selectId}
        onClick={() => {
          if (!disabled) {
            log(isOpen ? 'close' : 'open', { label });
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          styles.button,
          sizeStyle.button,
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          'relative text-left',
          sizeStyle.rightPad,
          width,
          className
        )}
        style={buttonStyle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn(!hasValue && 'text-gray-400')}>
          {displayText}
        </span>

        {/* Arrow icon */}
        <div className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 transform', size === 'small' ? 'right-2' : 'right-3')}>
          <Icon
            name={'chevron-down'}
            size={sizeStyle.icon}
            className={cn('text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {/* Dropdown menu - Portal化でoverflow-hiddenの影響を回避 */}
      {isOpen && dropdownPosition && createPortal(
        <ul
          ref={dropdownRef}
          className={cn(
            'fixed z-[9999] max-h-64 overflow-y-auto shadow-lg animate-slideDown origin-top',
            styles.dropdown
          )}
          style={{
            borderRadius,
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
          role="listbox"
          aria-labelledby={selectId}
          aria-multiselectable={isMultiple || undefined}
        >
          {/* 単一選択: Placeholder option (-) */}
          {!isMultiple && allowEmpty && (
            <li
              onClick={() => {
                (props as SingleSelectProps<T>).onChange(undefined);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (props as SingleSelectProps<T>).onChange(undefined);
                  setIsOpen(false);
                }
              }}
              className={cn(
                'cursor-pointer transition-all duration-300 ease-out',
                sizeStyle.option,
                (props as SingleSelectProps<T>).value === undefined ? styles.optionSelected : styles.option,
                visibleCount >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              )}
              role="option"
              aria-selected={(props as SingleSelectProps<T>).value === undefined}
              tabIndex={0}
            >
              {placeholder}
            </li>
          )}
          {options.map((option, index) => {
            const itemIndex = (!isMultiple && allowEmpty ? index + 2 : index + 1);
            const isVisible = visibleCount >= itemIndex;
            const isSelected = isMultiple
              ? (props.value as T[]).includes(option.value)
              : option.value === (props as SingleSelectProps<T>).value;

            const optionClassName = cn(
              'cursor-pointer transition-all duration-300 ease-out',
              sizeStyle.option,
              isSelected ? styles.optionSelected : styles.option,
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            );

            if (isMultiple) {
              return (
                <MultiSelectOption
                  key={String(option.value)}
                  isSelected={isSelected}
                  label={option.label}
                  size={size}
                  onClick={() => handleMultipleOptionClick(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMultipleOptionClick(option.value);
                    }
                  }}
                  className={optionClassName}
                  isVisible={isVisible}
                />
              );
            }

            return (
              <li
                key={String(option.value)}
                onClick={() => handleSingleOptionClick(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSingleOptionClick(option.value);
                  }
                }}
                className={optionClassName}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
              >
                {option.label}
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );

  // labelがある場合は、labelとselectを横並びで配置
  if (label) {
    return (
      <div className="flex items-center gap-2">
        <label
          htmlFor={selectId}
          className={labelClassName || 'text-fluid-sm font-medium text-gray-700'}
        >
          {label}
        </label>
        {selectElement}
      </div>
    );
  }

  return selectElement;
};
