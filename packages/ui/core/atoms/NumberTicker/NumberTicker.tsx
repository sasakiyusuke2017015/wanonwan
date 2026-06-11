'use client'

/**
 * MagicUI - Number Ticker
 * 数値カウントアップアニメーションコンポーネント
 *
 * @see https://magicui.design/docs/components/number-ticker
 */

import { useEffect, useRef, useState } from 'react'

import { motion, useInView, useSpring, useTransform } from 'framer-motion'

import { cn } from '../../utils/cn'

interface NumberTickerProps {
  value: number
  direction?: 'up' | 'down'
  delay?: number
  className?: string
  decimalPlaces?: number
  suffix?: string
  prefix?: string
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
  decimalPlaces = 0,
  suffix = '',
  prefix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px' })
  const [hasStarted, setHasStarted] = useState(false)

  const spring = useSpring(direction === 'down' ? value : 0, {
    damping: 50,
    stiffness: 250,
  })

  const display = useTransform(spring, (current) =>
    Math.abs(current).toFixed(decimalPlaces)
  )

  // 初回表示時のアニメーション
  useEffect(() => {
    if (isInView && !hasStarted) {
      const timer = setTimeout(() => {
        setHasStarted(true)
        spring.set(direction === 'down' ? 0 : value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, hasStarted, delay, spring, value, direction])

  // 値が変更されたときの更新
  useEffect(() => {
    if (hasStarted) {
      spring.set(direction === 'down' ? 0 : value)
    }
  }, [value, hasStarted, spring, direction])

  return (
    <span
      ref={ref}
      className={cn(
        'inline-block tabular-nums tracking-wider',
        className
      )}
      data-component="number-ticker"
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}
