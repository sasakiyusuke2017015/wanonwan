'use client'

/**
 * MagicUI - Blur Fade
 * ブラーフェードインアニメーションコンポーネント
 *
 * @see https://magicui.design/docs/components/blur-fade
 */

import { useRef, type ReactNode } from 'react'

import { motion, useInView } from 'framer-motion'

import { cn } from '../../utils/cn'
import { isCaptureMode } from '../../utils/captureMode'

interface BlurFadeProps {
  children: ReactNode
  className?: string
  variant?: {
    hidden: { y: number; opacity: number; filter: string }
    visible: { y: number; opacity: number; filter: string }
  }
  duration?: number
  delay?: number
  yOffset?: number
  inView?: boolean
  inViewMargin?: string
  blur?: string
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = false,
  inViewMargin = '-50px',
  blur = '6px',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as `${number}px` })
  // VRT 撮影中は in-view 判定と delay を飛ばし、最初から visible で静止させる
  const capture = isCaptureMode()
  const isInView = capture || !inView || inViewResult
  const defaultVariants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: 'blur(0px)' },
  }
  const combinedVariants = variant || defaultVariants

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={combinedVariants}
      transition={
        capture
          ? { duration: 0, delay: 0 }
          : {
              delay: 0.04 + delay,
              duration,
              ease: 'easeOut',
            }
      }
      className={cn(className)}
      data-component="blur-fade"
    >
      {children}
    </motion.div>
  )
}
