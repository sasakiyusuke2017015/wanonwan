'use client'

import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

type AnimationType = 'none' | 'wave' | 'randomColor';
type AnimationDirection =
  | 'horizontal'
  | 'diagonal-up'
  | 'diagonal-down'
  | 'vertical';

interface ColorRange {
  r: { min: number; max: number };
  g: { min: number; max: number };
  b: { min: number; max: number };
  a?: { min: number; max: number };
}

interface GradientOverlayProps {
  background: string;
  maxOpacity: number;
  delay: number;
  duration?: number;
  animationType?: AnimationType;
  animationDirection?: AnimationDirection;
  animationGradient?: string;
  colorRanges?: ColorRange;
}

export const GradientOverlay = ({
  background = 'linear-gradient(135deg, rgba(255,154,158,0.4), rgba(250,208,196,0.3), rgba(255,206,84,0.2))',
  maxOpacity = 1,
  delay = 0,
  duration = 25,
  animationType = 'none',
  animationDirection = 'horizontal',
  animationGradient = 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), rgba(255,223,0,0.6), rgba(255,215,0,0.4), transparent)',
  colorRanges = {
    r: { min: 0, max: 255 },
    g: { min: 255, max: 255 },
    b: { min: 0, max: 0 },
    a: { min: 0.4, max: 0.6 },
  },
}: GradientOverlayProps) => {
  const [currentGradient, setCurrentGradient] = useState(animationGradient);

  // ランダム色生成関数
  const generateRandomColor = (ranges: ColorRange): string => {
    const r =
      Math.floor(Math.random() * (ranges.r.max - ranges.r.min + 1)) +
      ranges.r.min;
    const g =
      Math.floor(Math.random() * (ranges.g.max - ranges.g.min + 1)) +
      ranges.g.min;
    const b =
      Math.floor(Math.random() * (ranges.b.max - ranges.b.min + 1)) +
      ranges.b.min;
    const a = ranges.a
      ? (Math.random() * (ranges.a.max - ranges.a.min) + ranges.a.min).toFixed(
          2
        )
      : '0.5';
    return `rgba(${r},${g},${b},${a})`;
  };

  // ランダムグラデーション生成
  const generateRandomGradient = (): string => {
    const color1 = generateRandomColor(colorRanges);
    const color2 = generateRandomColor(colorRanges);
    const color3 = generateRandomColor(colorRanges);
    return `linear-gradient(90deg, transparent, ${color1}, ${color2}, ${color3}, transparent)`;
  };

  // アニメーション周期ごとに色を更新
  useEffect(() => {
    if (animationType === 'randomColor') {
      const interval = setInterval(() => {
        setCurrentGradient(generateRandomGradient());
      }, duration * 1000);

      // 初回実行
      setCurrentGradient(generateRandomGradient());

      return () => clearInterval(interval);
    }
  }, [animationType, duration, colorRanges]);

  const opacityArray = [0, 0.1, 0.3, 0.6, 0.8, 1, 0.8, 0.6, 0.3, 0.1, 0];

  // アニメーション方向に応じた位置配列を生成
  const getPositionArrays = (direction: AnimationDirection) => {
    const baseXArray = [
      '-120%',
      '-80%',
      '-40%',
      '0%',
      '40%',
      '80%',
      '120%',
      '160%',
      '-120%',
    ];

    switch (direction) {
      case 'horizontal':
        return { x: baseXArray, y: undefined };
      case 'vertical':
        return { x: undefined, y: baseXArray };
      case 'diagonal-up':
        // 左下から右上へ
        return {
          x: baseXArray,
          y: [
            '120%',
            '80%',
            '40%',
            '0%',
            '-40%',
            '-80%',
            '-120%',
            '-160%',
            '120%',
          ],
        };
      case 'diagonal-down':
        // 左上から右下へ
        return {
          x: baseXArray,
          y: [
            '-120%',
            '-80%',
            '-40%',
            '0%',
            '40%',
            '80%',
            '120%',
            '160%',
            '-120%',
          ],
        };
      default:
        return { x: baseXArray, y: undefined };
    }
  };

  if (animationType === 'wave' || animationType === 'randomColor') {
    const gradientToUse =
      animationType === 'randomColor' ? currentGradient : animationGradient;
    const { x: xPositionArray, y: yPositionArray } =
      getPositionArrays(animationDirection);

    return (
      <div className="absolute inset-0 overflow-hidden" data-component="gradient-overlay" data-animation-type={animationType}>
        <motion.div
          className="absolute inset-0 h-full w-full"
          style={{
            background: gradientToUse,
          }}
          animate={{
            ...(xPositionArray && { x: xPositionArray }),
            ...(yPositionArray && { y: yPositionArray }),
            opacity: opacityArray,
          }}
          transition={{
            duration,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        background,
        opacity: maxOpacity,
        animationDelay: `${delay}s`,
      }}
      data-component="gradient-overlay"
      data-animation-type={animationType}
    />
  );
};

