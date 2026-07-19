'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import styles from './Confetti.module.css'

const DEFAULT_PARTICLE_COUNT = 40
const DEFAULT_DURATION_MS = 4_000
const DEFAULT_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']

export interface ConfettiProps {
  /** 降らせる紙吹雪の枚数。 */
  particleCount?: number
  /** 紙吹雪の色のパレット。インデックス循環で各粒に割り当てる。 */
  colors?: readonly string[]
  /** mount からオーバーレイが自動消滅するまでの時間 (ms)。 */
  durationMs?: number
}

type Particle = {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotate: number
}

function buildParticles(count: number, colors: readonly string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 500,
    duration: 2500 + Math.random() * 1500,
    color: colors[i % colors.length]!,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))
}

// matchMedia('(prefers-reduced-motion: reduce)') を useSyncExternalStore で subscribe。
// SSR では server snapshot=false (reduced-motion 非適用) を返し、hydration 後に
// 実際の OS 設定を反映。React 19 の set-state-in-effect 制約も避けられる。
function subscribePrefersReducedMotion(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function getServerSnapshot(): boolean {
  return false
}

/**
 * お祝い演出の紙吹雪オーバーレイ (CSS only)。
 *
 * - mount 後 `durationMs` で自動消滅 (state false → 非描画)
 * - `prefers-reduced-motion: reduce` のユーザーには **何も描画しない**
 *   (WCAG 2.3.3 motion preference 準拠)
 * - 純 CSS で実装、npm 依存追加なし (canvas-confetti 等不要)
 */
export function Confetti({
  particleCount = DEFAULT_PARTICLE_COUNT,
  colors = DEFAULT_COLORS,
  durationMs = DEFAULT_DURATION_MS,
}: ConfettiProps = {}) {
  const reducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotion,
    getServerSnapshot,
  )
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (reducedMotion) return
    const t = window.setTimeout(() => setVisible(false), durationMs)
    return () => window.clearTimeout(t)
  }, [reducedMotion, durationMs])

  // useMemo で mount 時に 1 回だけ生成 (set-state-in-effect 回避)
  const particles = useMemo<Particle[] | null>(
    () => (reducedMotion ? null : buildParticles(particleCount, colors)),
    [reducedMotion, particleCount, colors],
  )

  if (!visible || !particles) return null

  return (
    <div className={styles.overlay} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
