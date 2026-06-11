import type { Config } from 'tailwindcss'
import uiCatalogPreset from './tailwind.preset'

const config: Config = {
  presets: [uiCatalogPreset as Config],
  content: [
    // ui-catalog 自身のコンポーネント
    './atoms/**/*.{js,ts,jsx,tsx}',
    './molecules/**/*.{js,ts,jsx,tsx}',
    './organisms/**/*.{js,ts,jsx,tsx}',
    './templates/**/*.{js,ts,jsx,tsx}',
    './decorations/**/*.{js,ts,jsx,tsx}',
    './magicui/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'shimmer-slide':
          'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        'bounce-once': 'bounce-once 0.5s ease-out',
        'success-flash': 'success-flash 0.6s ease-out',
      },
      keyframes: {
        'shimmer-slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
        'bounce-once': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '30%': {
            transform: 'translateY(-8px)',
          },
          '60%': {
            transform: 'translateY(-4px)',
          },
        },
        'success-flash': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(52, 211, 153, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 20px 10px rgba(52, 211, 153, 0.3)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(52, 211, 153, 0)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
