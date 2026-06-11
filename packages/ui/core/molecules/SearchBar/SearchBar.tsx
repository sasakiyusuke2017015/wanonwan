'use client'

import { useState, useCallback, KeyboardEvent, ChangeEvent, FC } from 'react'
import { Icon } from '../../atoms/Icon'
import styles from './SearchBar.module.scss'

export interface SearchBarProps {
  /** プレースホルダーテキスト */
  placeholder?: string
  /** 制御された値 */
  value?: string
  /** 初期値（非制御モード） */
  defaultValue?: string
  /** 値変更時のコールバック */
  onChange?: (value: string) => void
  /** 検索実行時のコールバック（Enter押下時） */
  onSearch?: (value: string) => void
  /** カスタムクラス名 */
  className?: string
  /** オートフォーカス */
  autoFocus?: boolean
}

export const SearchBar: FC<SearchBarProps> = ({
  placeholder = '検索',
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSearch,
  className = '',
  autoFocus,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value)
      }
    },
    [onSearch, value]
  )

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('')
    }
    onChange?.('')
  }, [isControlled, onChange])

  return (
    <div className={`${styles.wrapper} ${className}`} data-component="search-bar">
      <Icon
        name="magnifying-glass"
        size={20}
        className={styles.searchIcon}
        data-testid="search-icon"
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={styles.input}
      />
      {value && (
        <button
          type="button"
          data-testid="clear-button"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="クリア"
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  )
}
