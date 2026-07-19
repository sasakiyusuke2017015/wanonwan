'use client'

import { useState } from 'react'
import { Icon } from '../Icon'
import { cn } from '../../utils'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
  xl: 'size-20',
}

const ICON_SIZE: Record<AvatarSize, number> = {
  sm: 18,
  md: 22,
  lg: 30,
  xl: 56,
}

export interface AvatarProps {
  src?: string | null
  /** alt 文字列に使うユーザ名。fallback の initials は将来用 (今 Phase 未使用) */
  name: string
  size?: AvatarSize
  className?: string
}

/**
 * 円形ユーザアバター。
 * - `src` が非 null かつロード成功 → 写真表示 (object-fit: cover でセンタークロップ)
 * - `src` が null / ロード失敗 → person アイコンに自動 fallback
 */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [errored, setErrored] = useState(false)
  const showImage = Boolean(src) && !errored

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-300 text-gray-500',
        SIZE_CLASS[size],
        className,
      )}
      data-component="avatar"
      data-has-image={showImage ? 'true' : 'false'}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
          draggable={false}
        />
      ) : (
        <Icon name="person" size={ICON_SIZE[size]} />
      )}
    </div>
  )
}
