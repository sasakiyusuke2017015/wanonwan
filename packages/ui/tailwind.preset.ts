import type { Config } from 'tailwindcss'

/**
 * @ui-catalog/core Tailwind CSS Preset
 *
 * 流体タイポグラフィとスペーシングを提供
 * 使用方法: tailwind.config.ts で presets: [uiCatalogPreset] を指定
 *
 * ## 流体タイポグラフィ (Fluid Typography)
 *
 * CSS clamp() を使用して、ブレイクポイントなしでシームレスにサイズが変化
 * 計算式: clamp(min, preferred, max)
 *   - min: 320px (モバイル最小) での値
 *   - max: 1280px (デスクトップ) での値
 *   - preferred: (max - min) / (1280 - 320) * 100vw + 補正値
 *
 * @example
 * ```tsx
 * <h1 className="text-fluid-4xl">見出し</h1>
 * <p className="text-fluid-base">本文</p>
 * ```
 */
const uiCatalogPreset: Partial<Config> = {
  theme: {
    extend: {
      fontSize: {
        // ============================================
        // 流体タイポグラフィ
        // 320px → 1280px で滑らかに変化
        // ============================================

        // 最小テキスト (10px 固定 - 可読性のため)
        'fluid-xs': ['0.625rem', { lineHeight: '1.5' }],

        // 小テキスト (11px → 14px)
        'fluid-sm': [
          'clamp(0.6875rem, 0.625rem + 0.3125vw, 0.875rem)',
          { lineHeight: '1.5' },
        ],

        // 本文 (14px → 16px)
        'fluid-base': [
          'clamp(0.875rem, 0.8125rem + 0.3125vw, 1rem)',
          { lineHeight: '1.7' },
        ],

        // 大テキスト (16px → 18px)
        'fluid-lg': [
          'clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)',
          { lineHeight: '1.6' },
        ],

        // XL (18px → 20px)
        'fluid-xl': [
          'clamp(1.125rem, 1.0625rem + 0.3125vw, 1.25rem)',
          { lineHeight: '1.5' },
        ],

        // 2XL (20px → 24px)
        'fluid-2xl': [
          'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
          { lineHeight: '1.4' },
        ],

        // 3XL 小見出し (24px → 30px)
        'fluid-3xl': [
          'clamp(1.5rem, 1.3125rem + 0.9375vw, 1.875rem)',
          { lineHeight: '1.3' },
        ],

        // 4XL 見出し (28px → 36px)
        'fluid-4xl': [
          'clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)',
          { lineHeight: '1.2' },
        ],

        // 5XL 大見出し (32px → 48px)
        'fluid-5xl': [
          'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
          { lineHeight: '1.1' },
        ],

        // 6XL ヒーロー (40px → 64px)
        'fluid-6xl': [
          'clamp(2.5rem, 1.75rem + 3.75vw, 4rem)',
          { lineHeight: '1.1' },
        ],
      },
      spacing: {
        // ============================================
        // 流体スペーシング
        // 320px → 1280px で滑らかに変化
        // ============================================
        'fluid-xs': 'clamp(0.25rem, 0.125rem + 0.625vw, 0.5rem)', // 4px → 8px
        'fluid-sm': 'clamp(0.5rem, 0.375rem + 0.625vw, 0.75rem)', // 8px → 12px
        'fluid-md': 'clamp(0.75rem, 0.5rem + 1.25vw, 1rem)', // 12px → 16px
        'fluid-lg': 'clamp(1rem, 0.75rem + 1.25vw, 1.5rem)', // 16px → 24px
        'fluid-xl': 'clamp(1.5rem, 1rem + 2.5vw, 2rem)', // 24px → 32px
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2.5vw, 3rem)', // 32px → 48px
        'fluid-3xl': 'clamp(3rem, 2rem + 5vw, 4rem)', // 48px → 64px
      },
    },
  },
}

export default uiCatalogPreset
