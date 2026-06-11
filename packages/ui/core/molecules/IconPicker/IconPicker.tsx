'use client'

import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../constants'
import styles from './IconPicker.module.scss'

const EVENT_ICONS: readonly { value: string; label: string }[] = [
  { value: '', label: 'なし' },
  { value: 'calendar', label: 'カレンダー' },
  { value: 'clock', label: '時計' },
  { value: 'chat', label: 'チャット' },
  { value: 'users-group', label: 'グループ' },
  { value: 'person', label: '人物' },
  { value: 'home', label: 'ホーム' },
  { value: 'gear', label: '設定' },
  { value: 'bell', label: '通知' },
  { value: 'file', label: 'ファイル' },
  { value: 'folder', label: 'フォルダ' },
  { value: 'chart-bar', label: 'グラフ' },
  { value: 'diamond', label: 'ダイヤ' },
  { value: 'brush', label: 'ブラシ' },
  { value: 'palette', label: 'パレット' },
  { value: 'trend-up', label: 'トレンド' },
  { value: 'check-circle', label: 'チェック' },
  { value: 'info-circle', label: '情報' },
  { value: 'survey', label: 'アンケート' },
  { value: 'dashboard', label: 'ダッシュボード' },
]

interface IconPickerProps {
  readonly value: string | undefined
  readonly onChange: (icon: string | undefined) => void
  readonly size?: number
}

export function IconPicker({ value, onChange, size = 28 }: IconPickerProps) {
  return (
    <div data-component="IconPicker" role="radiogroup" aria-label="アイコン選択" className={styles.container}>
      {EVENT_ICONS.map((item) => {
        const selected = (value ?? '') === item.value
        return (
          <button
            key={item.value || '__none'}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={item.label}
            title={item.label}
            onClick={() => onChange(item.value || undefined)}
            className={`${styles.iconButton} ${selected ? styles.iconButtonSelected : styles.iconButtonUnselected}`}
            style={{ width: size, height: size }}
          >
            {item.value ? (
              <Icon name={item.value as IconName} size={size * 0.6} className={styles.iconContent} />
            ) : (
              <span className={styles.iconContent} style={{ fontSize: size * 0.4, lineHeight: 1, color: '#9ca3af' }}>—</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { EVENT_ICONS }
