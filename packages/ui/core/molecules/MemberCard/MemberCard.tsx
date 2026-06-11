'use client'

/**
 * MemberCard - 汎用メンバーカードコンポーネント
 *
 * スコア、ステータス、日付などを表示するカード
 * データは props で注入し、ロジックは apps 側で持つ
 */
import { FC, memo } from 'react'

import { Badge } from '../../atoms/Badge'
import { Icon } from '../../atoms'

import type { MemberCardProps, ScoreItem as ScoreItemType, StatusItem } from './types'
import styles from './MemberCard.module.scss'

/** スコアに基づいて色を決定 */
const getScoreColor = (value: number): 'blue' | 'green' | 'yellow' | 'orange' | 'red' => {
  if (value >= 4.5) return 'blue'
  if (value >= 3.5) return 'green'
  if (value >= 2.5) return 'yellow'
  if (value >= 1.5) return 'orange'
  return 'red'
}

/**
 * スコア表示用コンポーネント
 */
const ScoreItemDisplay: FC<{ item: ScoreItemType }> = ({ item }) => (
  <div className={styles.scoreItem}>
    <span className={styles.scoreLabel}>{item.label}</span>
    {item.value === null ? (
      <span className={styles.scoreNull}>-</span>
    ) : (
      <span data-component="score-badge">
        <Badge
          value={item.value}
          styleVariant="compact"
          color={getScoreColor(item.value)}
          size="small"
        />
      </span>
    )}
  </div>
)

/**
 * ステータスバッジ表示用コンポーネント
 */
const StatusBadgeDisplay: FC<{ item: StatusItem }> = ({ item }) => {
  const def = item.value ? item.definitions[item.value] : null
  return (
    <div className={styles.statusBadge}>
      <span className={styles.statusLabel}>{item.label}:</span>
      <Badge
        value={def?.shortLabel || item.defaultLabel}
        styleVariant="solid"
        color={def?.color || 'gray'}
        size="small"
      />
    </div>
  )
}

/**
 * 選択インジケーター（チェックマーク）
 */
const SelectionIndicator: FC = () => (
  <div
    data-testid="selection-indicator"
    className={styles.selectionIndicator}
  >
    <Icon
      name="check"
      size={14}
      stroke="white"
      strokeWidth={3}
      fill="none"
    />
  </div>
)

/**
 * 汎用メンバーカードコンポーネント
 */
export const MemberCard: FC<MemberCardProps> = memo(({
  data,
  selected = false,
  onSelectionChange,
  onClick,
  cardRadius = '0.5rem',
  cellRadius = '0.375rem',
}) => {
  const handleCardClick = () => {
    if (onSelectionChange) {
      onSelectionChange(!selected)
    }
    onClick?.()
  }

  // カードのスタイルを決定
  const getCardClassName = () => {
    if (data.isAlert) {
      return selected ? styles.cardAlertSelected : styles.cardAlert
    }
    return selected ? styles.cardDefaultSelected : styles.cardDefault
  }

  return (
    <div
      data-component="member-card"
      data-testid="member-card"
      className={`${styles.card} ${getCardClassName()}`}
      style={{ borderRadius: cardRadius }}
      onClick={handleCardClick}
    >
      {/* 選択インジケーター（右上バッジ） */}
      {selected && <SelectionIndicator />}

      {/* ヘッダー: 名前 + サブ情報 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.name}>
            {data.name}
          </div>
          {data.subtitle && (
            <div className={styles.subtitle}>
              {data.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* スコアセクション */}
      {data.scores && data.scores.length > 0 && (
        <div
          className={styles.scoresGrid}
          style={{
            borderRadius: cellRadius,
            gridTemplateColumns: `repeat(${data.scores.length}, minmax(0, 1fr))`,
          }}
        >
          {data.scores.map((item, idx) => (
            <ScoreItemDisplay key={idx} item={item} />
          ))}
        </div>
      )}

      {/* ステータスセクション */}
      {data.statuses && data.statuses.length > 0 && (
        <div className={styles.statusesWrap}>
          {data.statuses.map((item, idx) => (
            <StatusBadgeDisplay key={idx} item={item} />
          ))}
        </div>
      )}

      {/* 日付セクション */}
      {data.dates && data.dates.length > 0 && (
        <div className={styles.datesWrap}>
          {data.dates.map((item, idx) => (
            <span key={idx}>{item.label}: {item.value || '-'}</span>
          ))}
        </div>
      )}

      {/* 追加バッジ・メモ */}
      {(data.badges?.length || data.memo) && (
        <div className={styles.extraSection}>
          {data.badges?.map((badge, idx) => (
            <div key={idx} className={styles.badgeRow}>
              <span>{badge.label}:</span>
              <Badge
                value={badge.value}
                styleVariant="solid"
                color={badge.color}
                size="small"
              />
            </div>
          ))}
          {data.memo && (
            <div className={styles.memo} title={data.memo}>
              メモ: {data.memo.length > 30 ? `${data.memo.slice(0, 30)}...` : data.memo}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

MemberCard.displayName = 'MemberCard'
