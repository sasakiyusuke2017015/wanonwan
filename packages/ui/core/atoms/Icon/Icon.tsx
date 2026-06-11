'use client'

/**
 * Icon コンポーネント
 *
 * 設計原則:
 * - SVG は幾何学データ（Path）に徹する
 * - SCSS で魂（色・動き・状態）を吹き込む
 * - currentColor を活用し親要素の色を継承
 */
import React from 'react';
import type { IconName } from '../../constants';
import { cn } from '../../utils';
import styles from './Icon.module.scss';
import type {
  IconProps,
  AnimationPreset,
  HoverPreset,
  LoadingPreset,
  PresetConfig,
  SizePreset,
  ColorVariant,
} from './types';

// ========================================
// SVG Path 定義
// ========================================

// SVG レンダリング用の内部型
interface PathRenderProps {
  className?: string;
}

// アイコンごとのSVGパス定義
const ICON_PATHS: Record<string, (props: PathRenderProps) => React.ReactElement> = {
  // ========================================
  // REGULAR アイコン
  // ========================================
  ['dot']: () => (
    <circle cx="12" cy="12" r="5" fill="currentColor" />
  ),
  ['hamburger']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 5h20M2 12h20M2 19h20"
    />
  ),
  ['x']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20L20 4M4 4l16 16"
    />
  ),
  ['save']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 21v-8H7v8M7 3v5h8"
      />
    </g>
  ),
  ['trash']: () => (
    <>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 11v6M14 11v6"
      />
    </>
  ),
  ['person']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  ),
  ['employee']: () => (
    <>
      <circle
        className={styles.stroke}
        cx="12"
        cy="6"
        r="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20a8 8 0 0116 0"
      />
      <path
        className={cn(styles.stroke, styles.detail)}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 10.5v3.5l-1 3.5h2l-1-3.5v-3.5z"
        strokeWidth="2"
      />
    </>
  ),
  ['chevron-down']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 7l-9 9-9-9"
    />
  ),
  ['chevron-up']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 17l9-9 9 9"
    />
  ),
  ['chevron-left']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 21l-9-9 9-9"
    />
  ),
  ['chevron-right']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 3l9 9-9 9"
    />
  ),
  ['chevrons-left']: () => (
    <>
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M18 17l-5-5 5-5" />
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5 5-5" />
    </>
  ),
  ['chevrons-right']: () => (
    <>
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M6 7l5 5-5 5" />
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5" />
    </>
  ),
  ['magnifying-glass']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  ),
  ['eye']: () => (
    <g className={styles.body}>
      <path
        className={cn(styles.stroke, styles.pupil)}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        className={cn(styles.stroke, styles.outline)}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </g>
  ),
  ['eye-slashed']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
      <circle className={styles.stroke} cx="12" cy="12" r="3" strokeWidth="2" />
      <line
        className={cn(styles.stroke, styles.slash)}
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  ),
  ['arrow-up-right']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  ),
  ['arrow-in']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  ),
  ['sync-pull']: () => (
    <g className={styles.body}>
      <line className={cn(styles.stroke, styles.serverLine)} x1="4" y1="4" x2="20" y2="4" />
      <line className={cn(styles.stroke, styles.arrow)} x1="12" y1="7" x2="12" y2="18" />
      <polyline className={cn(styles.stroke, styles.arrow)} points="8 14 12 18 16 14" />
      <line className={cn(styles.stroke, styles.localLine)} x1="4" y1="21" x2="20" y2="21" />
    </g>
  ),
  ['sync-push']: () => (
    <g className={styles.body}>
      <line className={cn(styles.stroke, styles.localLine)} x1="4" y1="21" x2="20" y2="21" />
      <line className={cn(styles.stroke, styles.arrow)} x1="12" y1="18" x2="12" y2="7" />
      <polyline className={cn(styles.stroke, styles.arrow)} points="8 11 12 7 16 11" />
      <line className={cn(styles.stroke, styles.serverLine)} x1="4" y1="4" x2="20" y2="4" />
    </g>
  ),
  ['arrow-rotate']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  ),
  ['arrow-turn-left']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8v7a4 4 0 0 1-4 4H6"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 16l-3 3 3 3"
      />
    </g>
  ),
  ['arrow-u-turn']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 6H9a5 5 0 0 0 0 10h7"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 19l3-3-3-3"
      />
    </g>
  ),
  ['door-out']: () => (
    <g className={styles.body}>
      <path className={styles.stroke} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <rect className={styles.stroke} x="9" y="3" width="6" height="18" rx="1" />
      <circle className={cn(styles.fill, styles.handle)} cx="13" cy="12" r="1" />
      <path className={cn(styles.stroke, styles.arrow)} d="M16 12h6m-3-3l3 3-3 3" />
    </g>
  ),
  ['info-triangle']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  ['info-circle']: () => (
    <g className={styles.body}>
      <circle className={styles.stroke} cx="12" cy="12" r="10" />
      <path className={styles.stroke} d="M12 8v5" strokeLinecap="round" />
      <path className={styles.stroke} d="M12 15.5h.01" strokeLinecap="round" />
    </g>
  ),
  ['lock']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  ),
  ['unlock']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
      />
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11V7a5 5 0 015-5 5 5 0 015 5"
      />
      <path
        className={cn(styles.stroke, styles.indicator)}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 7l2-2"
      />
    </g>
  ),
  ['expand']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8V4a1 1 0 011-1h4M21 8V4a1 1 0 00-1-1h-4M3 16v4a1 1 0 001 1h4M21 16v4a1 1 0 01-1 1h-4"
    />
  ),
  ['calendar']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
  ['funnel']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V20l-4 4v-10.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  ),
  ['gear']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <circle className={cn(styles.stroke, styles.center)} cx="12" cy="12" r="3" strokeWidth="2" />
    </g>
  ),
  ['bell']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  ),
  ['home']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
    />
  ),
  ['dashboard']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} x="3" y="3" width="7" height="7" rx="2" />
      <rect className={styles.stroke} x="14" y="3" width="7" height="4" rx="2" />
      <rect className={styles.stroke} x="14" y="10" width="7" height="11" rx="2" />
      <rect className={styles.stroke} x="3" y="13" width="7" height="8" rx="2" />
      <circle className={cn(styles.fill, styles.accent)} cx="6.5" cy="6.5" r="1" />
    </g>
  ),
  ['chart-bar']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} x="4" y="14" width="4" height="7" rx="1" />
      <rect className={styles.stroke} x="10" y="8" width="4" height="13" rx="1" />
      <rect className={styles.stroke} x="16" y="4" width="4" height="17" rx="1" />
      <line className={styles.stroke} x1="2" y1="22" x2="22" y2="22" />
    </g>
  ),
  ['list']: () => (
    <g className={styles.body}>
      <line className={styles.stroke} x1="3" y1="4" x2="21" y2="4" strokeLinecap="square" />
      <line className={styles.stroke} x1="3" y1="12" x2="21" y2="12" strokeLinecap="square" />
      <line className={styles.stroke} x1="3" y1="20" x2="21" y2="20" strokeLinecap="square" />
      <circle className={cn(styles.fill, styles.bullet)} cx="3" cy="4" r="1.2" />
      <circle className={cn(styles.fill, styles.bullet)} cx="3" cy="12" r="1.2" />
      <circle className={cn(styles.fill, styles.bullet)} cx="3" cy="20" r="1.2" />
    </g>
  ),
  ['file']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8m8 4H8m2-8H8"
    />
  ),
  ['survey']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} x="4" y="3" width="16" height="18" rx="2" />
      <path className={cn(styles.stroke, styles.checkmark)} d="M8 12l3 3 5-6" />
    </g>
  ),
  ['comment-check']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} x="2" y="3" width="20" height="14" rx="2" />
      <path className={cn(styles.stroke, styles.tail)} d="M8 17L6 21L10 18" />
      <path className={cn(styles.stroke, styles.checkmark)} d="M7 10L10 13L17 6" strokeWidth="2.5" />
    </g>
  ),
  ['check']: () => (
    <path
      className={styles.stroke}
      d="M5 12l5 5L19 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  ),
  ['check-circle']: () => (
    <g className={styles.body}>
      <circle className={styles.stroke} cx="12" cy="12" r="10" />
      <path
        className={cn(styles.stroke, styles.checkmark)}
        d="M9 12l2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </g>
  ),
  ['x-circle']: () => (
    <g className={styles.body}>
      <circle className={styles.stroke} cx="10" cy="10" r="8" />
      <path
        className={cn(styles.fill, styles.xmark)}
        d="M7.293 6.293a1 1 0 011.414 0L10 7.586l1.293-1.293a1 1 0 111.414 1.414L11.414 9l1.293 1.293a1 1 0 01-1.414 1.414L10 10.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 9 7.293 7.707a1 1 0 010-1.414z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </g>
  ),
  ['keyboard']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5" />
      <rect className={cn(styles.stroke, styles.key)} x="4" y="7.5" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="7.5" y="7.5" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="11" y="7.5" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="14.5" y="7.5" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="18" y="7.5" width="2" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="4" y="11" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="7.5" y="11" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="11" y="11" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="14.5" y="11" width="2.5" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.key)} x="18" y="11" width="2" height="2.5" rx="0.5" strokeWidth="1.2" />
      <rect className={cn(styles.stroke, styles.spacebar)} x="6" y="14.5" width="12" height="2.5" rx="0.5" strokeWidth="1.2" />
    </g>
  ),
  ['palette']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.51-.19-.99-.52-1.36-.31-.35-.48-.82-.48-1.32 0-1.1.9-2 2-2h2.36c3.03 0 5.64-2.61 5.64-5.64C22 5.48 17.52 2 12 2z"
        strokeWidth="1.5"
      />
      <circle className={cn(styles.fill, styles.paint)} cx="7.5" cy="11.5" r="1.5" />
      <circle className={cn(styles.fill, styles.paint)} cx="10.5" cy="7.5" r="1.5" />
      <circle className={cn(styles.fill, styles.paint)} cx="15" cy="7.5" r="1.5" />
      <circle className={cn(styles.fill, styles.paint)} cx="17.5" cy="11" r="1.5" />
    </g>
  ),
  ['brush']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        d="M3 21c0 0 1-2 3-4s6-4 8-6c2-2 6-8 8-10s-2 0-4 2s-8 6-10 8s-4 6-4 8s-1 2-1 2z"
        strokeWidth="1.5"
      />
      <path className={cn(styles.stroke, styles.handle)} d="M14 10l6-6" strokeWidth="2" />
    </g>
  ),
  ['sliders']: () => (
    <g className={styles.body}>
      <line className={styles.stroke} x1="4" y1="21" x2="4" y2="14" />
      <line className={styles.stroke} x1="4" y1="10" x2="4" y2="3" />
      <circle className={cn(styles.fill, styles.knob)} cx="4" cy="12" r="2" />
      <line className={styles.stroke} x1="12" y1="21" x2="12" y2="18" />
      <line className={styles.stroke} x1="12" y1="14" x2="12" y2="3" />
      <circle className={cn(styles.fill, styles.knob)} cx="12" cy="16" r="2" />
      <line className={styles.stroke} x1="20" y1="21" x2="20" y2="10" />
      <line className={styles.stroke} x1="20" y1="6" x2="20" y2="3" />
      <circle className={cn(styles.fill, styles.knob)} cx="20" cy="8" r="2" />
    </g>
  ),
  ['diamond']: () => (
    <g className={styles.body}>
      <polygon className={styles.stroke} points="12,2 2,9 12,22 22,9" strokeWidth="1.5" />
      <line className={cn(styles.stroke, styles.facet)} x1="2" y1="9" x2="22" y2="9" />
      <line className={cn(styles.stroke, styles.facet)} x1="12" y1="2" x2="8" y2="9" />
      <line className={cn(styles.stroke, styles.facet)} x1="12" y1="2" x2="16" y2="9" />
      <line className={cn(styles.stroke, styles.facet)} x1="8" y1="9" x2="12" y2="22" />
      <line className={cn(styles.stroke, styles.facet)} x1="16" y1="9" x2="12" y2="22" />
    </g>
  ),
  ['paint-roller']: () => (
    <g className={styles.body}>
      <rect className={cn(styles.stroke, styles.roller)} x="2" y="3" width="14" height="6" rx="1" strokeWidth="1.5" />
      <line className={cn(styles.stroke, styles.shaft)} x1="18" y1="6" x2="20" y2="6" strokeWidth="2" />
      <line className={cn(styles.stroke, styles.shaft)} x1="20" y1="6" x2="20" y2="12" strokeWidth="2" />
      <line className={cn(styles.stroke, styles.handle)} x1="20" y1="12" x2="12" y2="12" strokeWidth="2" />
      <line className={cn(styles.stroke, styles.handle)} x1="12" y1="12" x2="12" y2="21" strokeWidth="2" />
    </g>
  ),
  ['chat']: () => (
    <g className={styles.body}>
      <path
        className={styles.stroke}
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        strokeWidth="1.5"
      />
      <line className={cn(styles.stroke, styles.messageLine)} x1="7" y1="8" x2="17" y2="8" strokeWidth="2" />
      <line className={cn(styles.stroke, styles.messageLine)} x1="7" y1="12" x2="13" y2="12" strokeWidth="2" />
    </g>
  ),
  ['clock']: () => (
    <g className={styles.body}>
      <circle className={styles.stroke} cx="12" cy="12" r="10" />
      <line className={cn(styles.stroke, styles.hourHand)} x1="12" y1="12" x2="12" y2="7" />
      <line className={cn(styles.stroke, styles.minuteHand)} x1="12" y1="12" x2="8" y2="12" />
      <circle className={cn(styles.fill, styles.centerDot)} cx="12" cy="12" r="1" />
    </g>
  ),
  ['folder']: () => (
    <path
      className={styles.stroke}
      d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    />
  ),
  ['users-group']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  ),
  ['trend-up']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4v16m0-16l-4 4m4-4l4 4"
    />
  ),
  ['trend-up-right']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 17L17 7m0 0H9m8 0v8"
    />
  ),
  ['trend-right']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12h16m0 0l-4-4m4 4l-4 4"
    />
  ),
  ['trend-down-right']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 7l10 10m0 0V9m0 8H9"
    />
  ),
  ['trend-down']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 20V4m0 16l-4-4m4 4l4-4"
    />
  ),
  ['star']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  ),
  ['star-filled']: () => (
    <path
      className={styles.fill}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  ),
  ['cloud-upload']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  ),
  ['inbox']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  ),
  ['archive']: () => (
    <path
      className={styles.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  ),

  // ========================================
  // 議事録・音声関連アイコン
  // ========================================

  // メイン: 音声波形がドキュメントに変換されるイメージ
  // シンプルで認識しやすい、24x24で映える
  ['transcript-doc']: () => (
    <g className={styles.body}>
      {/* 角丸ドキュメント */}
      <rect className={styles.stroke} x="5" y="2" width="14" height="20" rx="2.5" strokeWidth="1.8" />
      {/* 動的な音声波形（5本、中央が高い） */}
      <line className={styles.stroke} x1="8" y1="9" x2="8" y2="15" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="10.5" y1="7" x2="10.5" y2="17" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="13" y1="5.5" x2="13" y2="18.5" strokeWidth="2.2" strokeLinecap="round" />
      <line className={styles.stroke} x1="15.5" y1="7" x2="15.5" y2="17" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="18" y1="9" x2="18" y2="15" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  // バリエーション1: M字波形（ロゴ的、ミニマル）
  ['audio-wave']: () => (
    <g className={styles.body}>
      {/* M字が音声波形を表現 */}
      <path
        className={styles.stroke}
        d="M2 16V10l4.5 4 5.5-10 5.5 10 4.5-4v6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* ベースライン */}
      <line className={styles.stroke} x1="2" y1="20" x2="22" y2="20" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),

  // バリエーション2: 円形マイク + テキストライン（バランス型）
  ['mic-text']: () => (
    <g className={styles.body}>
      {/* マイク */}
      <rect className={styles.stroke} x="9" y="3" width="6" height="9" rx="3" strokeWidth="1.8" />
      <path className={styles.stroke} d="M6 10v1.5a6 6 0 0012 0V10" strokeWidth="1.8" />
      <line className={styles.stroke} x1="12" y1="17.5" x2="12" y2="19" strokeWidth="1.8" />
      {/* テキストライン（議事録を表現） */}
      <line className={styles.stroke} x1="6" y1="21" x2="18" y2="21" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  // バリエーション3: 再生+ドキュメント（動画→文字起こし）
  ['play-doc']: () => (
    <g className={styles.body}>
      {/* ドキュメント */}
      <path className={styles.stroke} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeWidth="1.8" />
      <path className={styles.stroke} d="M14 2v6h6" strokeWidth="1.8" />
      {/* 再生ボタン（大きめ、中央配置） */}
      <path className={styles.fill} d="M9 10v6l6-3-6-3z" />
    </g>
  ),

  // バリエーション4: 吹き出し波形（会話→テキスト）
  ['chat-wave']: () => (
    <g className={styles.body}>
      {/* 吹き出し */}
      <path
        className={styles.stroke}
        d="M21 12a9 9 0 01-9 9H4l2.5-2.5A9 9 0 1121 12z"
        strokeWidth="1.8"
      />
      {/* 音声波形（3本） */}
      <line className={styles.stroke} x1="9" y1="10" x2="9" y2="14" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="12" y1="8" x2="12" y2="16" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="15" y1="10" x2="15" y2="14" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  // バリエーション5: シールド型（信頼性・セキュリティ感）
  ['shield-audio']: () => (
    <g className={styles.body}>
      {/* シールド */}
      <path
        className={styles.stroke}
        d="M12 2L4 6v6c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12V6l-8-4z"
        strokeWidth="1.8"
      />
      {/* 音声波形（3本） */}
      <line className={styles.stroke} x1="9" y1="10" x2="9" y2="14" strokeWidth="2" strokeLinecap="round" />
      <line className={styles.stroke} x1="12" y1="8" x2="12" y2="16" strokeWidth="2.2" strokeLinecap="round" />
      <line className={styles.stroke} x1="15" y1="10" x2="15" y2="14" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  // ========================================
  // LOADING アイコン
  // ========================================
  ['spinner']: () => (
    <g className={styles.body}>
      <circle
        className={cn(styles.stroke, styles.track)}
        cx="12"
        cy="12"
        r="9"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        className={cn(styles.fill, styles.indicator)}
        d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z"
      />
    </g>
  ),
  ['spinner-thin']: () => (
    <g className={styles.body}>
      <circle
        className={cn(styles.stroke, styles.track)}
        opacity="0.1"
        cx="12"
        cy="12"
        r="11"
        strokeWidth="1"
      />
      <path
        className={cn(styles.fill, styles.indicator)}
        d="M12 1a11 11 0 0 1 11 11h-1a10 10 0 0 0-10-10V1z"
      />
    </g>
  ),
  ['spinner-thick']: () => (
    <g className={styles.body}>
      <circle
        className={cn(styles.stroke, styles.track)}
        opacity="0.3"
        cx="12"
        cy="12"
        r="8"
        strokeWidth="4"
      />
      <path
        className={cn(styles.fill, styles.indicator)}
        d="M12 3a9 9 0 0 1 9 9h-4a5 5 0 0 0-5-5V3z"
      />
    </g>
  ),
  ['loading-dots']: () => (
    <g className={styles.body}>
      <circle className={cn(styles.fill, styles.dot)} cx="4" cy="12" r="1.5">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
        <animate attributeName="r" values="1.5;2.2;1.5" dur="1.5s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle className={cn(styles.accent, styles.dot)} cx="12" cy="12" r="1.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="r" values="1.8;2.6;1.8" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle className={cn(styles.fill, styles.dot)} cx="20" cy="12" r="1.5">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="r" values="1.5;2.2;1.5" dur="1.5s" repeatCount="indefinite" begin="1s" />
      </circle>
    </g>
  ),
  // ========================================
  // メディアプレイヤー
  // ========================================
  ['volume-off']: () => (
    <g className={styles.body}>
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="23" y1="9" x2="17" y2="15" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="17" y1="9" x2="23" y2="15" />
    </g>
  ),
  ['volume-low']: () => (
    <g className={styles.body}>
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </g>
  ),
  ['volume-high']: () => (
    <g className={styles.body}>
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H2v6h4l5 4V5z" />
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </g>
  ),
  ['fullscreen']: () => (
    <g className={styles.body}>
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="15 3 21 3 21 9" />
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="9 21 3 21 3 15" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="21" y1="3" x2="14" y2="10" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="3" y1="21" x2="10" y2="14" />
    </g>
  ),
  ['fullscreen-exit']: () => (
    <g className={styles.body}>
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="4 14 10 14 10 20" />
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="20 10 14 10 14 4" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="14" y1="10" x2="21" y2="3" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="3" y1="21" x2="10" y2="14" />
    </g>
  ),
  ['shuffle']: () => (
    <g className={styles.body}>
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="16 3 21 3 21 8" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="4" y1="20" x2="21" y2="3" />
      <polyline className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="21 16 21 21 16 21" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="15" y1="15" x2="21" y2="21" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="4" y1="4" x2="9" y2="9" />
    </g>
  ),
  ['skip-forward']: () => (
    <g className={styles.body}>
      <polygon className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" points="5 4 15 12 5 20 5 4" />
      <line className={styles.stroke} strokeLinecap="round" strokeLinejoin="round" x1="19" y1="5" x2="19" y2="19" />
    </g>
  ),
  ['sidebar']: () => (
    <g className={styles.body}>
      <rect className={styles.stroke} strokeLinecap="round" x="3" y="3" width="18" height="18" rx="2" />
      <line className={styles.stroke} x1="9" y1="3" x2="9" y2="21" />
    </g>
  ),
  // ========================================
  // LOADING アイコン
  // ========================================
  ['loading-pulse']: () => (
    <circle
      className={cn(styles.stroke, styles.pulse)}
      cx="12"
      cy="12"
      r="6"
      strokeWidth="2"
      opacity="0.5"
    />
  ),
  ['loading-clock']: () => (
    <g>
      <circle className={styles.stroke} cx="12" cy="12" r="10" strokeWidth="2" opacity="0.2" />
      <line className={styles.stroke} x1="12" y1="12" x2="12" y2="5" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </line>
      <circle className={styles.fill} cx="12" cy="12" r="1" />
    </g>
  ),
  ['loading-orbit']: () => (
    <g>
      <circle className={styles.stroke} cx="12" cy="12" r="10" strokeWidth="1" opacity="0.1" />
      <circle className={styles.fill} cx="12" cy="2" r="2">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.fill} cx="12" cy="22" r="1.5" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-morph']: () => (
    <g>
      <rect className={styles.stroke} x="4" y="4" width="16" height="16" rx="0" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="rx" values="0;8;0" dur="2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="4s" repeatCount="indefinite" />
      </rect>
      <rect className={styles.accent} x="6" y="6" width="12" height="12" rx="0">
        <animate attributeName="rx" values="0;6;0" dur="2s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />
      </rect>
    </g>
  ),
  ['loading-triangle']: () => (
    <g>
      <polygon className={styles.stroke} points="12,2 22,20 2,20" strokeWidth="2">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </polygon>
      <circle className={styles.fill} cx="12" cy="12" r="2" />
    </g>
  ),
  ['loading-dna']: () => (
    <g>
      <ellipse className={styles.fill} cx="8" cy="4" rx="2" ry="1.5">
        <animate attributeName="cy" values="4;12;20;12;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="rx" values="2;4;2;4;2" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse className={styles.accent} cx="16" cy="20" rx="2" ry="1.5">
        <animate attributeName="cy" values="20;12;4;12;20" dur="2s" repeatCount="indefinite" />
        <animate attributeName="rx" values="2;4;2;4;2" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <line className={styles.stroke} x1="8" y1="8" x2="16" y2="8" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="y1" values="8;12;16;12;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="8;12;16;12;8" dur="2s" repeatCount="indefinite" />
      </line>
      <line className={styles.stroke} x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" opacity="0.7" />
      <line className={styles.stroke} x1="8" y1="16" x2="16" y2="16" strokeWidth="1.5" opacity="0.5">
        <animate attributeName="y1" values="16;12;8;12;16" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="16;12;8;12;16" dur="2s" repeatCount="indefinite" />
      </line>
    </g>
  ),
  ['loading-atom']: () => (
    <g>
      {/* 核（中心、脈動） */}
      <circle className={styles.accent} cx="12" cy="12" r="3">
        <animate attributeName="r" values="3;3.5;3" dur="1s" repeatCount="indefinite" />
      </circle>
      {/* 軌道 1 (水平) と電子 - 速い */}
      <ellipse className={styles.stroke} cx="12" cy="12" rx="10" ry="4" strokeWidth="1" opacity="0.3" />
      <circle className={styles.accent} r="1.6">
        <animateMotion dur="1.6s" repeatCount="indefinite" rotate="auto"
          path="M 22 12 A 10 4 0 1 1 2 12 A 10 4 0 1 1 22 12" />
      </circle>
      {/* 軌道 2 (60deg) と電子 - ゆっくり */}
      <g transform="rotate(60 12 12)">
        <ellipse className={styles.stroke} cx="12" cy="12" rx="10" ry="4" strokeWidth="1" opacity="0.3" />
        <circle className={styles.accent} r="1.5">
          <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto"
            begin="-0.6s"
            path="M 22 12 A 10 4 0 1 1 2 12 A 10 4 0 1 1 22 12" />
        </circle>
      </g>
      {/* 軌道 3 (-60deg) と電子 - 中速 */}
      <g transform="rotate(-60 12 12)">
        <ellipse className={styles.stroke} cx="12" cy="12" rx="10" ry="4" strokeWidth="1" opacity="0.3" />
        <circle className={styles.accent} r="1.4">
          <animateMotion dur="2.4s" repeatCount="indefinite" rotate="auto"
            begin="-1.2s"
            path="M 22 12 A 10 4 0 1 1 2 12 A 10 4 0 1 1 22 12" />
        </circle>
      </g>
    </g>
  ),
  ['loading-heartbeat']: () => (
    <g className={styles.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="12" x2="22" y2="12" opacity="0.2" />
      <polyline className={styles.accentStroke} points="2,12 6,12 8,12 9,6 10,18 11,8 12,14 13,12 17,12 22,12">
        <animate attributeName="stroke-dasharray" values="0 100;50 100;100 100" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="stroke-dashoffset" values="0;-25;-50" dur="1.5s" repeatCount="indefinite" />
      </polyline>
    </g>
  ),
  ['loading-hourglass']: () => (
    <g className={styles.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14M5 21h14" />
      <path d="M6 3v3a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <path d="M6 21v-3a6 6 0 0 1 6-6 6 6 0 0 1 6 6v3" />
      <path className={styles.accentStroke} d="M12 12v3" strokeWidth="3">
        <animate attributeName="d" values="M12 12v0;M12 12v3;M12 12v0" dur="2s" repeatCount="indefinite" />
      </path>
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;0 12 12;180 12 12;180 12 12;360 12 12" dur="4s" repeatCount="indefinite" keyTimes="0;0.4;0.5;0.9;1" />
    </g>
  ),
  ['loading-gears']: () => (
    <g>
      <g className={styles.stroke} strokeWidth="1">
        <circle cx="9" cy="12" r="5" strokeWidth="1.5" />
        <circle className={styles.fill} cx="9" cy="12" r="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect key={angle} className={styles.fill} x="8" y="5" width="2" height="3" rx="0.5" transform={`rotate(${angle} 9 12)`} />
        ))}
        <animateTransform attributeName="transform" type="rotate" from="0 9 12" to="360 9 12" dur="3s" repeatCount="indefinite" />
      </g>
      <g className={styles.stroke} strokeWidth="1">
        <circle cx="17" cy="10" r="3.5" strokeWidth="1.5" />
        <circle className={styles.fill} cx="17" cy="10" r="1.5" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <rect key={angle} className={styles.fill} x="16.25" y="5" width="1.5" height="2" rx="0.5" transform={`rotate(${angle} 17 10)`} />
        ))}
        <animateTransform attributeName="transform" type="rotate" from="0 17 10" to="-360 17 10" dur="2s" repeatCount="indefinite" />
      </g>
    </g>
  ),
  ['loading-wave']: () => (
    <g className={styles.stroke} strokeWidth="2" strokeLinecap="round">
      <path d="M2 12 Q 6 6, 12 12 T 22 12" opacity="0.3" />
      <path d="M2 12 Q 6 6, 12 12 T 22 12">
        <animate
          attributeName="d"
          values="M2 12 Q 6 6, 12 12 T 22 12;M2 12 Q 6 18, 12 12 T 22 12;M2 12 Q 6 6, 12 12 T 22 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <circle className={styles.fill} cx="2" cy="12" r="2">
        <animate attributeName="cx" values="2;22;2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="12;12;12" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-radar']: () => (
    <g>
      <circle className={styles.stroke} cx="12" cy="12" r="10" strokeWidth="1" opacity="0.2" />
      <circle className={styles.stroke} cx="12" cy="12" r="7" strokeWidth="1" opacity="0.2" />
      <circle className={styles.stroke} cx="12" cy="12" r="4" strokeWidth="1" opacity="0.2" />
      <circle className={styles.fill} cx="12" cy="12" r="1" />
      <line className={styles.accentStroke} x1="12" y1="12" x2="12" y2="2" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />
      </line>
      <path className={styles.accent} d="M12 12 L12 2 A10 10 0 0 1 20 8 Z" opacity="0.15">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
  ),
  ['loading-cube3d']: () => (
    <g className={styles.stroke} strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" opacity="0.3" />
      <line x1="12" y1="2" x2="12" y2="12" />
      <line x1="12" y1="12" x2="4" y2="17" />
      <line x1="12" y1="12" x2="20" y2="17" />
      <polygon className={styles.fill} points="12,2 20,7 12,12 4,7" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
      </polygon>
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="4s" repeatCount="indefinite" />
    </g>
  ),
  ['loading-cube3d-glow']: () => (
    <g strokeWidth="1.5">
      {/* Phase 1: 立方体が構築される（0-33%） */}
      <g className={styles.stroke}>
        <animate attributeName="opacity" values="1;1;0.15;0.15;1" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" strokeLinejoin="round" />
        <line x1="12" y1="2" x2="12" y2="12" />
        <line x1="12" y1="12" x2="4" y2="17" />
        <line x1="12" y1="12" x2="20" y2="17" />
        <polygon className={styles.fill} points="12,2 20,7 12,12 4,7" opacity="0.3" strokeLinejoin="round" />
      </g>
      {/* Phase 2: 立方体の頂点が外へ爆発的に拡散する粒子 */}
      <g className={styles.accent}>
        <animate attributeName="opacity" values="0.15;0.15;1;1;0.15" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        <circle cx="12" cy="2" r="1.3">
          <animate attributeName="cy" values="2;2;-2;-2;2" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
        <circle cx="20" cy="7" r="1.3">
          <animate attributeName="cx" values="20;20;24;24;20" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
        <circle cx="20" cy="17" r="1.3">
          <animate attributeName="cx" values="20;20;24;24;20" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
          <animate attributeName="cy" values="17;17;21;21;17" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
        <circle cx="12" cy="22" r="1.3">
          <animate attributeName="cy" values="22;22;26;26;22" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
        <circle cx="4" cy="17" r="1.3">
          <animate attributeName="cx" values="4;4;0;0;4" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
          <animate attributeName="cy" values="17;17;21;21;17" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
        <circle cx="4" cy="7" r="1.3">
          <animate attributeName="cx" values="4;4;0;0;4" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        </circle>
      </g>
      {/* Phase 3: 中心の核（常に存在、Phase 2 以降で強く発光） */}
      <circle className={styles.accent} cx="12" cy="12" r="1.5">
        <animate attributeName="r" values="1.5;2;3.5;2;1.5" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
        <animate attributeName="opacity" values="0.6;0.8;1;0.8;0.6" dur="3.6s" repeatCount="indefinite" keyTimes="0;0.28;0.5;0.72;1" />
      </circle>
    </g>
  ),
  ['loading-rings']: () => (
    <g className={styles.stroke} strokeWidth="2">
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <circle cx="12" cy="12" r="10" strokeDasharray="15 48">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="6" opacity="0.2" />
      <circle className={styles.accentStroke} cx="12" cy="12" r="6" strokeDasharray="10 28">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="12" cy="12" r="2" strokeWidth="3">
        <animate attributeName="r" values="2;3;2" dur="0.75s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="0.75s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-eclipse']: () => (
    <g>
      <circle className={styles.fill} cx="12" cy="12" r="6" opacity="0.3" />
      <circle className={styles.accent} cx="12" cy="12" r="6">
        <animate attributeName="cx" values="7;12;17;12;7" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.stroke} cx="12" cy="12" r="8" strokeWidth="1" opacity="0.5">
        <animate attributeName="r" values="8;9;8" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-interview']: () => (
    <g>
      {/* 左の人（体は固定、頭は上下動のみ） */}
      <g>
        <path className={styles.fill} d="M1 19a4 4 0 018 0" opacity="0.9" />
        <circle className={styles.fill} cx="5" cy="11" r="2.5" opacity="0.9">
          <animate
            attributeName="cy"
            values="11;9.8;11.3;10.2;11"
            dur="1.618s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.34 0.96 0.64 1; 0.4 0 0.6 1; 0.34 0.96 0.64 1; 0.4 0 0.6 1"
          />
        </circle>
      </g>
      {/* 右の人（体は固定、頭は上下動のみ、タイミングずらし） */}
      <g>
        <path className={styles.accent} d="M15 19a4 4 0 018 0" opacity="0.9" />
        <circle className={styles.accent} cx="19" cy="11" r="2.5" opacity="0.9">
          <animate
            attributeName="cy"
            values="11;10.2;11.3;9.8;11"
            dur="1.618s"
            repeatCount="indefinite"
            begin="0.618s"
            calcMode="spline"
            keySplines="0.34 0.96 0.64 1; 0.4 0 0.6 1; 0.34 0.96 0.64 1; 0.4 0 0.6 1"
          />
        </circle>
      </g>
      {/* 雲: 独立した粒子の集まり。粒子ごとに色・濃淡・速度・位相が違う */}
      <g>
        {/* 中央上 - 大きめ、neutral、ゆっくり */}
        <circle className={styles.neutral} cx="12" cy="3.5" r="2">
          <animate attributeName="cy" values="3.5;2.5;3.5" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="r"  values="2;2.4;2" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.95;0.55;0.95" dur="2.8s" repeatCount="indefinite" />
        </circle>
        {/* 左肩 - 中、accent (info)、中速 */}
        <circle className={styles.accent} cx="9" cy="4.5" r="1.4">
          <animate attributeName="cx" values="9;7.6;9" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="4.5;3.5;4.5" dur="1.9s" repeatCount="indefinite" begin="-0.4s" />
          <animate attributeName="opacity" values="0.85;0.4;0.85" dur="2.1s" repeatCount="indefinite" begin="-0.2s" />
        </circle>
        {/* 右肩 - 中、fill (primary)、速い */}
        <circle className={styles.fill} cx="15.4" cy="4.6" r="1.5">
          <animate attributeName="cx" values="15.4;16.6;15.4" dur="1.7s" repeatCount="indefinite" />
          <animate attributeName="cy" values="4.6;3.6;4.6" dur="2.6s" repeatCount="indefinite" begin="-0.6s" />
          <animate attributeName="opacity" values="0.9;0.45;0.9" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* 左下 - 小、neutral、独自スピード */}
        <circle className={styles.neutral} cx="10" cy="6.4" r="1">
          <animate attributeName="cy" values="6.4;5.4;6.4" dur="2.5s" repeatCount="indefinite" begin="-0.9s" />
          <animate attributeName="cx" values="10;9.2;10" dur="3.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.75;0.3;0.75" dur="2.3s" repeatCount="indefinite" begin="-0.3s" />
        </circle>
        {/* 右下 - 小、accent、独自スピード */}
        <circle className={styles.accent} cx="14.2" cy="6.5" r="0.95">
          <animate attributeName="cy" values="6.5;5.6;6.5" dur="3.1s" repeatCount="indefinite" begin="-1.4s" />
          <animate attributeName="cx" values="14.2;15.0;14.2" dur="2.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.35;0.7" dur="2.6s" repeatCount="indefinite" begin="-0.7s" />
        </circle>
        {/* 上方の極小粒子 - fill、速くチラつく */}
        <circle className={styles.fill} cx="11" cy="2" r="0.55">
          <animate attributeName="cy" values="2;1.2;2" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.15;0.9;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
        {/* 上方右の極小粒子 - neutral */}
        <circle className={styles.neutral} cx="13.6" cy="2.2" r="0.5">
          <animate attributeName="cy" values="2.2;1.4;2.2" dur="1.9s" repeatCount="indefinite" begin="-0.3s" />
          <animate attributeName="opacity" values="0.5;0.2;0.7;0.5" dur="2.2s" repeatCount="indefinite" begin="-0.6s" />
        </circle>
        {/* 左外側の流れ粒子 - accent、横に大きく動く */}
        <circle className={styles.accent} cx="7.2" cy="5.8" r="0.7">
          <animate attributeName="cx" values="7.2;5.8;7.2" dur="3.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.8;0.2;0.4" dur="2.4s" repeatCount="indefinite" begin="-1.1s" />
        </circle>
        {/* 右外側の流れ粒子 - fill */}
        <circle className={styles.fill} cx="17" cy="5.7" r="0.75">
          <animate attributeName="cx" values="17;18.4;17" dur="3.3s" repeatCount="indefinite" begin="-0.5s" />
          <animate attributeName="opacity" values="0.4;0.85;0.25;0.4" dur="2.7s" repeatCount="indefinite" begin="-1.5s" />
        </circle>
        {/* 中央底の小粒 - neutral、ふわふわ */}
        <circle className={styles.neutral} cx="12" cy="7" r="0.65">
          <animate attributeName="cy" values="7;6.2;7" dur="2.1s" repeatCount="indefinite" begin="-0.8s" />
          <animate attributeName="opacity" values="0.65;0.25;0.65" dur="1.7s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  ),
  ['loading-bars']: () => (
    <g>
      <rect className={styles.fill} x="11" y="1" width="2" height="6" rx="1">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect className={styles.accent} x="11" y="17" width="2" height="6" rx="1" opacity="0.75">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect className={styles.fill} x="17" y="11" width="6" height="2" rx="1" opacity="0.75">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect className={styles.accent} x="1" y="11" width="6" height="2" rx="1" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite" />
      </rect>
    </g>
  ),
  ['loading-wifi']: () => (
    <g>
      <path className={styles.stroke} d="M5 12.55a11.8 11.8 0 0 1 14 0" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
      </path>
      <path className={styles.stroke} d="M8.5 16a6.5 6.5 0 0 1 7 0" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" begin="0.1s" />
      </path>
      <circle className={styles.accent} cx="12" cy="19" r="1.4">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
        <animate attributeName="r" values="1.4;1.8;1.4" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
      </circle>
    </g>
  ),
  ['loading-progress']: () => (
    <g>
      {/* トラック（24x24 の内側に納まるよう左右 2px マージン） */}
      <rect className={styles.fill} x="2" y="10" width="20" height="4" rx="2" opacity="0.15" />
      {/* 進行バー: 2 → 16 (ゴール位置 = 2 + 20 - バー幅6 = 16) を往復 */}
      <rect className={styles.fill} x="2" y="10" width="6" height="4" rx="2">
        <animate attributeName="x" values="2;16;2" dur="1.5s" repeatCount="indefinite" />
      </rect>
      {/* 先端のハイライト: バーの右端を追従 (x + width = 2+6=8 → 16+6=22) */}
      <circle className={styles.accent} cx="8" cy="12" r="2">
        <animate attributeName="cx" values="8;22;8" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="0.75s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-star']: () => (
    <g>
      <polygon
        className={styles.stroke}
        points="12,2 14.5,8.5 21.5,9 16.5,13.5 18,20.5 12,17 6,20.5 7.5,13.5 2.5,9 9.5,8.5"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.4"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="3s" repeatCount="indefinite" />
      </polygon>
      <polygon
        className={styles.stroke}
        points="12,5 13.5,9.5 18,10 15,12.5 16,17 12,14.5 8,17 9,12.5 6,10 10.5,9.5"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.7"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite" />
      </polygon>
      <circle className={styles.fill} cx="12" cy="12" r="1.5">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="1s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-ripple']: () => (
    <g strokeWidth="2">
      <circle className={styles.stroke} cx="12" cy="12" r="1">
        <animate attributeName="r" values="1;10" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.accentStroke} cx="12" cy="12" r="1">
        <animate attributeName="r" values="1;10" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>
      <circle className={styles.stroke} cx="12" cy="12" r="1">
        <animate attributeName="r" values="1;10" dur="1.5s" repeatCount="indefinite" begin="1s" />
        <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" begin="1s" />
      </circle>
      {/* 中央の芯（消えない） */}
      <circle className={styles.accent} cx="12" cy="12" r="1.5" />
    </g>
  ),
  ['loading-infinity']: () => (
    <g strokeWidth="2" strokeLinecap="round">
      <path className={styles.stroke} d="M12 12c-2-2-4-4-6-4s-4 2-4 4 2 4 4 4c2 0 4-2 6-4s4-4 6-4 4 2 4 4-2 4-4 4c-2 0-4-2-6-4" opacity="0.25" fill="none" />
      {/* トレイル: 先頭の accent ドットと、少し遅れて追いかける fill ドット */}
      <circle className={styles.accent} cx="12" cy="12" r="2.2">
        <animateMotion dur="2s" repeatCount="indefinite" path="M0 0c-2-2-4-4-6-4s-4 2-4 4 2 4 4 4c2 0 4-2 6-4s4-4 6-4 4 2 4 4-2 4-4 4c-2 0-4-2-6-4" />
      </circle>
      <circle className={styles.fill} cx="12" cy="12" r="1.4" opacity="0.6">
        <animateMotion dur="2s" repeatCount="indefinite" begin="-0.2s" path="M0 0c-2-2-4-4-6-4s-4 2-4 4 2 4 4 4c2 0 4-2 6-4s4-4 6-4 4 2 4 4-2 4-4 4c-2 0-4-2-6-4" />
      </circle>
    </g>
  ),
  ['loading-dots-fade']: () => (
    <g>
      <circle className={styles.fill} cx="4" cy="12" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.fill} cx="12" cy="12" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" begin="0.2s" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" begin="0.2s" />
      </circle>
      <circle className={styles.fill} cx="20" cy="12" r="2">
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" begin="0.4s" />
        <animateTransform attributeName="transform" type="scale" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" begin="0.4s" />
      </circle>
    </g>
  ),
  ['loading-pulse-ring']: () => (
    <g>
      <circle className={styles.stroke} cx="12" cy="12" r="10" strokeWidth="2">
        <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.fill} cx="12" cy="12" r="6">
        <animate attributeName="r" values="6;4;6" dur="1s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-bounce']: () => (
    <g>
      <circle className={styles.fill} cx="6" cy="12" r="2">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.fill} cx="12" cy="12" r="2">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
      </circle>
      <circle className={styles.fill} cx="18" cy="12" r="2">
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
      </circle>
    </g>
  ),
  ['loading-half']: () => (
    <g>
      <circle className={styles.stroke} cx="12" cy="12" r="10" strokeWidth="2" opacity="0.15" />
      <path className={styles.fill} d="M2 12a10 10 0 0 1 20 0h-2a8 8 0 0 0-16 0h-2z">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </g>
  ),
  ['loading-dash']: () => (
    <circle
      className={styles.stroke}
      cx="12"
      cy="12"
      r="10"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="1 150"
    >
      <animate attributeName="stroke-dasharray" values="1 150;90 150;90 150" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="stroke-dashoffset" values="0;-35;-124" dur="1.5s" repeatCount="indefinite" />
    </circle>
  ),
  ['loading-scale-pulse']: () => (
    <g>
      <circle className={styles.fill} cx="12" cy="12" r="3">
        <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.stroke} cx="12" cy="12" r="8" strokeWidth="2" opacity="0.3">
        <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.stroke} cx="12" cy="12" r="11" strokeWidth="1" opacity="0.1">
        <animate attributeName="r" values="11;13;11" dur="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.1;0.05;0.1" dur="1s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-flip']: () => (
    <rect className={styles.fill} x="8" y="8" width="8" height="8">
      <animateTransform attributeName="transform" type="scale" values="1,1;0.1,1;1,1" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
    </rect>
  ),
  ['loading-square']: () => (
    <rect className={styles.stroke} x="4" y="4" width="16" height="16" strokeWidth="2">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="2s" repeatCount="indefinite" />
      <animate attributeName="rx" values="0;4;0" dur="2s" repeatCount="indefinite" />
    </rect>
  ),
  ['loading-cross']: () => (
    <g strokeWidth="4" strokeLinecap="round" fill="none">
      {/* 縦バー: info → danger → info を周期的に切り替え */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="var(--color-info-500)">
        <animate attributeName="stroke"
          values="var(--color-info-500);var(--color-danger-500);var(--color-info-500)"
          dur="2.4s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </line>
      {/* 横バー: danger → info → danger（縦と逆位相） */}
      <line x1="2" y1="12" x2="22" y2="12" stroke="var(--color-danger-500)">
        <animate attributeName="stroke"
          values="var(--color-danger-500);var(--color-info-500);var(--color-danger-500)"
          dur="2.4s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </line>
    </g>
  ),
  ['loading-hexagon']: () => (
    <g>
      <polygon
        className={styles.stroke}
        points="12,1 21,6 21,18 12,23 3,18 3,6"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.2"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="4s" repeatCount="indefinite" />
      </polygon>
      <polygon
        className={styles.stroke}
        points="12,4 18,8 18,16 12,20 6,16 6,8"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-360 12 12" dur="2s" repeatCount="indefinite" />
      </polygon>
      <polygon
        className={styles.fill}
        points="12,7 15,9 15,15 12,17 9,15 9,9"
        strokeLinejoin="round"
        opacity="0.8"
      >
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;1;0.8" dur="0.75s" repeatCount="indefinite" />
      </polygon>
    </g>
  ),
  ['loading-particles']: () => (
    <g>
      {/* 中心の優しい光 */}
      <circle className={styles.accent} cx="12" cy="12" r="1.6" opacity="0.6">
        <animate attributeName="r" values="1.6;2.1;1.6" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.85;0.6" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* 内側の軌道 (半径 4) - 速め、3 粒子が等間隔で時計回り */}
      <circle className={styles.fill} r="1.2">
        <animateMotion dur="4s" repeatCount="indefinite" path="M 16 12 A 4 4 0 1 1 8 12 A 4 4 0 1 1 16 12" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.fill} r="1.2">
        <animateMotion dur="4s" repeatCount="indefinite" begin="-1.33s" path="M 16 12 A 4 4 0 1 1 8 12 A 4 4 0 1 1 16 12" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" begin="-1.33s" />
      </circle>
      <circle className={styles.fill} r="1.2">
        <animateMotion dur="4s" repeatCount="indefinite" begin="-2.66s" path="M 16 12 A 4 4 0 1 1 8 12 A 4 4 0 1 1 16 12" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" begin="-2.66s" />
      </circle>

      {/* 中間の軌道 (半径 7) - 中速、4 粒子が反時計回り */}
      <circle className={styles.accent} r="1">
        <animateMotion dur="6s" repeatCount="indefinite" path="M 5 12 A 7 7 0 1 0 19 12 A 7 7 0 1 0 5 12" />
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.accent} r="1">
        <animateMotion dur="6s" repeatCount="indefinite" begin="-1.5s" path="M 5 12 A 7 7 0 1 0 19 12 A 7 7 0 1 0 5 12" />
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="3s" repeatCount="indefinite" begin="-0.5s" />
      </circle>
      <circle className={styles.accent} r="1">
        <animateMotion dur="6s" repeatCount="indefinite" begin="-3s" path="M 5 12 A 7 7 0 1 0 19 12 A 7 7 0 1 0 5 12" />
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="3s" repeatCount="indefinite" begin="-1s" />
      </circle>
      <circle className={styles.accent} r="1">
        <animateMotion dur="6s" repeatCount="indefinite" begin="-4.5s" path="M 5 12 A 7 7 0 1 0 19 12 A 7 7 0 1 0 5 12" />
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="3s" repeatCount="indefinite" begin="-1.5s" />
      </circle>

      {/* 外側の軌道 (半径 10) - ゆっくり、5 粒子が時計回り */}
      <circle className={styles.neutral} r="0.7">
        <animateMotion dur="9s" repeatCount="indefinite" path="M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" />
      </circle>
      <circle className={styles.neutral} r="0.7">
        <animateMotion dur="9s" repeatCount="indefinite" begin="-1.8s" path="M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" begin="-0.9s" />
      </circle>
      <circle className={styles.neutral} r="0.7">
        <animateMotion dur="9s" repeatCount="indefinite" begin="-3.6s" path="M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" begin="-1.8s" />
      </circle>
      <circle className={styles.neutral} r="0.7">
        <animateMotion dur="9s" repeatCount="indefinite" begin="-5.4s" path="M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" begin="-2.7s" />
      </circle>
      <circle className={styles.neutral} r="0.7">
        <animateMotion dur="9s" repeatCount="indefinite" begin="-7.2s" path="M 22 12 A 10 10 0 1 1 2 12 A 10 10 0 1 1 22 12" />
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" repeatCount="indefinite" begin="-3.6s" />
      </circle>
    </g>
  ),
  ['loading-comet']: () => (
    <g>
      {/* 円軌道 */}
      <circle className={styles.stroke} cx="12" cy="12" r="9" strokeWidth="0.6" opacity="0.15" />
      {/* 反時計回り (sweep-flag=0)。尾は頭より遅れて出発 → 頭を追いかける */}
      <circle className={styles.accent} r="1.6">
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M 21 12 A 9 9 0 1 0 3 12 A 9 9 0 1 0 21 12" />
      </circle>
      <circle className={styles.accent} r="1.3" opacity="0.7">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.08s" path="M 21 12 A 9 9 0 1 0 3 12 A 9 9 0 1 0 21 12" />
      </circle>
      <circle className={styles.accent} r="1" opacity="0.5">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.16s" path="M 21 12 A 9 9 0 1 0 3 12 A 9 9 0 1 0 21 12" />
      </circle>
      <circle className={styles.fill} r="0.7" opacity="0.35">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.24s" path="M 21 12 A 9 9 0 1 0 3 12 A 9 9 0 1 0 21 12" />
      </circle>
      <circle className={styles.fill} r="0.45" opacity="0.2">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.32s" path="M 21 12 A 9 9 0 1 0 3 12 A 9 9 0 1 0 21 12" />
      </circle>
    </g>
  ),
  ['loading-magnet']: () => (
    <g>
      {/* U字磁石 */}
      <path className={styles.fill} d="M5 4 L5 12 A 7 7 0 0 0 19 12 L19 4 L15 4 L15 12 A 3 3 0 0 1 9 12 L9 4 Z" opacity="0.85" />
      {/* N極（左、青）と S極（右、赤）のキャップ */}
      <rect x="5" y="4" width="4" height="1.6" fill="#3b82f6" opacity="0.95" />
      <rect x="15" y="4" width="4" height="1.6" fill="#ef4444" opacity="0.95" />

      {/* 磁力線: N→S を結ぶ 3 本のアーチ状の破線。点線オフセットで流れる */}
      <path d="M 7 4 Q 12 -1 17 4" fill="none" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.6s" repeatCount="indefinite" />
      </path>
      <path d="M 6 6 Q 12 -3 18 6" fill="none" stroke="#a855f7" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="2s" repeatCount="indefinite" begin="-0.5s" />
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M 5 8 Q 12 -5 19 8" fill="none" stroke="#ef4444" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="2.4s" repeatCount="indefinite" begin="-1s" />
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur="2.4s" repeatCount="indefinite" />
      </path>

      {/* 左から N極へ吸い寄せられる鉄粉。極に到達するとサイズが弾けて消える */}
      <circle className={styles.fill} cx="0" cy="5" r="0.6">
        <animate attributeName="cx" values="0;7" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle className={styles.fill} cx="0" cy="5" r="0.6">
        <animate attributeName="cx" values="0;7" dur="1.4s" repeatCount="indefinite" begin="-0.45s" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" begin="-0.45s" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" begin="-0.45s" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle className={styles.fill} cx="0" cy="5" r="0.6">
        <animate attributeName="cx" values="0;7" dur="1.4s" repeatCount="indefinite" begin="-0.9s" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" begin="-0.9s" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" begin="-0.9s" keyTimes="0;0.15;0.85;1" />
      </circle>

      {/* 右から S極へ */}
      <circle className={styles.fill} cx="24" cy="5" r="0.6">
        <animate attributeName="cx" values="24;17" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle className={styles.fill} cx="24" cy="5" r="0.6">
        <animate attributeName="cx" values="24;17" dur="1.4s" repeatCount="indefinite" begin="-0.45s" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" begin="-0.45s" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" begin="-0.45s" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle className={styles.fill} cx="24" cy="5" r="0.6">
        <animate attributeName="cx" values="24;17" dur="1.4s" repeatCount="indefinite" begin="-0.9s" />
        <animate attributeName="r" values="0.6;0.6;1.4" dur="1.4s" repeatCount="indefinite" begin="-0.9s" keyTimes="0;0.85;1" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" begin="-0.9s" keyTimes="0;0.15;0.85;1" />
      </circle>
    </g>
  ),
  ['loading-braid']: () => (
    <g strokeLinecap="round" fill="none">
      {/* 3 本のラインが編み込まれる。線の太さも脈動させてリボン感 */}
      <path className={styles.stroke}
        strokeWidth="2"
        d="M2 12 Q 7 6 12 12 T 22 12">
        <animate attributeName="d"
          values="M2 12 Q 7 6 12 12 T 22 12;
                  M2 12 Q 7 18 12 12 T 22 12;
                  M2 12 Q 7 6 12 12 T 22 12"
          dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="1.6;2.4;1.6" dur="2s" repeatCount="indefinite" />
      </path>
      <path className={styles.accentStroke}
        strokeWidth="2"
        d="M2 12 Q 7 18 12 12 T 22 12">
        <animate attributeName="d"
          values="M2 12 Q 7 18 12 12 T 22 12;
                  M2 12 Q 7 6 12 12 T 22 12;
                  M2 12 Q 7 18 12 12 T 22 12"
          dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="2.4;1.6;2.4" dur="2s" repeatCount="indefinite" />
      </path>
      <path stroke="var(--icon-neutral, var(--color-gray-400))"
        strokeWidth="1.6"
        d="M2 12 Q 7 12 12 12 T 22 12" opacity="0.6">
        <animate attributeName="d"
          values="M2 12 Q 7 9 12 12 T 22 12;
                  M2 12 Q 7 15 12 12 T 22 12;
                  M2 12 Q 7 9 12 12 T 22 12"
          dur="2s" repeatCount="indefinite" begin="-0.5s" />
      </path>

      {/* 波線を辿って左→右に流れる光の粒（3 本それぞれに 1 個ずつ） */}
      <circle className={styles.fill} r="1">
        <animateMotion dur="2s" repeatCount="indefinite" path="M2 12 Q 7 6 12 12 T 22 12" />
        <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle className={styles.accent} r="1">
        <animateMotion dur="2s" repeatCount="indefinite" begin="-0.66s" path="M2 12 Q 7 18 12 12 T 22 12" />
        <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin="-0.66s" keyTimes="0;0.15;0.85;1" />
      </circle>
      <circle r="0.7" fill="var(--icon-neutral, var(--color-gray-400))">
        <animateMotion dur="2s" repeatCount="indefinite" begin="-1.33s" path="M2 12 Q 7 12 12 12 T 22 12" />
        <animate attributeName="opacity" values="0;0.8;0.8;0" dur="2s" repeatCount="indefinite" begin="-1.33s" keyTimes="0;0.15;0.85;1" />
      </circle>
    </g>
  ),
  ['loading-vortex']: () => (
    <g>
      {/* 渦の輪郭ガイド */}
      <path className={styles.stroke} d="M12 12 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" strokeWidth="0.6" opacity="0.12" />
      <path className={styles.stroke} d="M12 12 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" strokeWidth="0.6" opacity="0.18" />
      {/* 6 粒子が螺旋で中心へ吸い込まれていく（cx/cy/r/opacity を同時に変化） */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((delay, i) => (
        <circle key={i} className={i % 2 === 0 ? styles.accent : styles.fill} r="1.4" cx="21" cy="12">
          <animate attributeName="cx" values="21;12" dur="1.6s" repeatCount="indefinite" begin={`${-delay}s`} />
          <animate attributeName="cy" values="12;12" dur="1.6s" repeatCount="indefinite" begin={`${-delay}s`} />
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="540 12 12" dur="1.6s" repeatCount="indefinite" begin={`${-delay}s`} />
          <animate attributeName="r" values="1.4;0.2" dur="1.6s" repeatCount="indefinite" begin={`${-delay}s`} />
          <animate attributeName="opacity" values="1;0.1" dur="1.6s" repeatCount="indefinite" begin={`${-delay}s`} />
        </circle>
      ))}
      {/* 中心の核 */}
      <circle className={styles.accent} cx="12" cy="12" r="1.5">
        <animate attributeName="r" values="1.5;2.2;1.5" dur="0.8s" repeatCount="indefinite" />
      </circle>
    </g>
  ),
  ['loading-prism']: () => (
    <g>
      <defs>
        {/* 入射光: 左端で透明、プリズム接触点で白く光る */}
        <linearGradient id="prism-incoming" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
        </linearGradient>
        {/* 出射光: 出口で濃く、先端はフェード */}
        <linearGradient id="prism-red"    x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#f87171" stopOpacity="0.95" /><stop offset="100%" stopColor="#f87171" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-orange" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" /><stop offset="100%" stopColor="#fb923c" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-yellow" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" /><stop offset="100%" stopColor="#fbbf24" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-green"  x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4ade80" stopOpacity="0.95" /><stop offset="100%" stopColor="#4ade80" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-blue"   x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#60a5fa" stopOpacity="0.95" /><stop offset="100%" stopColor="#60a5fa" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-indigo" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#818cf8" stopOpacity="0.95" /><stop offset="100%" stopColor="#818cf8" stopOpacity="0" /></linearGradient>
        <linearGradient id="prism-violet" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" /><stop offset="100%" stopColor="#c084fc" stopOpacity="0" /></linearGradient>
      </defs>

      {/* 入射白光（ビーム本体は常時、強さは脈動） */}
      <path
        d="M1 12 L10 12"
        stroke="url(#prism-incoming)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      >
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
      </path>
      {/* 入射ビームを走る光の粒子（左→右にプリズム接触点まで） */}
      <circle r="1.1" fill="currentColor" opacity="0.9">
        <animateMotion dur="1.2s" repeatCount="indefinite" path="M 1 12 L 10 12" />
        <animate attributeName="opacity" values="0;1;1;0" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.2;0.8;1" />
      </circle>
      <circle r="0.7" fill="currentColor" opacity="0.6">
        <animateMotion dur="1.2s" repeatCount="indefinite" begin="-0.4s" path="M 1 12 L 10 12" />
        <animate attributeName="opacity" values="0;0.8;0.8;0" dur="1.2s" repeatCount="indefinite" begin="-0.4s" keyTimes="0;0.2;0.8;1" />
      </circle>

      {/* プリズム本体（角丸 + 微小に揺れる） */}
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-2 12 12; 2 12 12; -2 12 12" dur="3.2s" repeatCount="indefinite" />
        <path
          className={styles.stroke}
          d="M11.2 3.4 L19.8 19.2 Q20.2 20 19.3 20 L4.7 20 Q3.8 20 4.2 19.2 L10.8 3.4 Q11 3 11.2 3.4 Z"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
        {/* プリズム内側のうっすらグロス */}
        <path
          d="M11 5 L17.5 18 Q17.8 18.5 17.3 18.5 L9.5 18.5"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />
      </g>

      {/* 出射光: 7 本のグラデ光線。長さも揺らいで「光が脈打つ」感を出す */}
      <g strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="12 12">
        <path d="M15 9   L23 4.5"  stroke="url(#prism-red)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.00s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.00s" />
        </path>
        <path d="M15.3 10 L23 7" stroke="url(#prism-orange)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.10s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.10s" />
        </path>
        <path d="M15.6 11 L23 10" stroke="url(#prism-yellow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.20s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.20s" />
        </path>
        <path d="M16 12   L23 12.5" stroke="url(#prism-green)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.30s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.30s" />
        </path>
        <path d="M16.4 13 L23 15" stroke="url(#prism-blue)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.40s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.40s" />
        </path>
        <path d="M16.7 14 L23 17.5" stroke="url(#prism-indigo)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.50s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.50s" />
        </path>
        <path d="M17 15   L23 20" stroke="url(#prism-violet)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" repeatCount="indefinite" begin="0.60s" />
          <animate attributeName="stroke-dashoffset" values="12;0;12" dur="1.6s" repeatCount="indefinite" begin="0.60s" />
        </path>
      </g>
    </g>
  ),
};

// ========================================
// ローディングプリセット
// ========================================
const PRESET_MAP: Record<LoadingPreset, PresetConfig> = {
  spinner: { name: 'spinner', color: 'primary', glow: true },
  dots: { name: 'loading-dots', color: 'primary', accent: 'info' },
  pulse: { name: 'loading-pulse', color: 'primary', accent: 'info', glow: true, animation: 'pulse-scale' },
  cube: { name: 'loading-cube3d', color: 'info' },
  'cube-glow': { name: 'loading-cube3d-glow', color: 'info', glowStrong: true },
  interview: { name: 'loading-interview', color: 'primary', accent: 'info', colorShift: false },
  dna: { name: 'loading-dna', color: 'success', accent: 'info' },
  atom: { name: 'loading-atom', color: 'info', accent: 'warning', glow: true, animation: 'pulse' },
  rings: { name: 'loading-rings', color: 'primary', accent: 'info' },
  gears: { name: 'loading-gears', color: 'muted' },
  hourglass: { name: 'loading-hourglass', color: 'warning', accent: 'danger' },
  wave: { name: 'loading-wave', color: 'info' },
  radar: { name: 'loading-radar', color: 'success', accent: 'warning', glow: true },
  eclipse: { name: 'loading-eclipse', color: 'warning', accent: 'muted', glowStrong: true, animation: 'glow-pulse' },
  clock: { name: 'loading-clock', color: 'current' },
  morph: { name: 'loading-morph', color: 'primary', accent: 'success' },
  orbit: { name: 'loading-orbit', color: 'primary' },
  triangle: { name: 'loading-triangle', color: 'warning' },
  heartbeat: { name: 'loading-heartbeat', color: 'muted', accent: 'danger', colorShift: false },
  // 復元シリーズ
  bars: { name: 'loading-bars', color: 'primary', accent: 'info' },
  wifi: { name: 'loading-wifi', color: 'info', accent: 'success', glow: true },
  progress: { name: 'loading-progress', color: 'primary', accent: 'success', glow: true },
  infinity: { name: 'loading-infinity', color: 'info', accent: 'primary', glowStrong: true },
  ripple: { name: 'loading-ripple', color: 'info', accent: 'primary', glow: true },
  star: { name: 'loading-star', color: 'warning', glowStrong: true },
  cross: { name: 'loading-cross' },
  // 表現拡張
  particles: { name: 'loading-particles', color: 'primary', accent: 'info', colorShift: false },
  comet: { name: 'loading-comet', color: 'info', accent: 'warning', glow: true, colorShift: false },
  magnet: { name: 'loading-magnet', color: 'muted' },
  braid: { name: 'loading-braid', color: 'primary', accent: 'success', colorShift: false },
  vortex: { name: 'loading-vortex', color: 'primary', accent: 'info', glow: true, colorShift: false },
  // サプライズ: プリズム分光（7色の虹）
  prism: { name: 'loading-prism', glowStrong: true, hover: 'glow' },
};

// ========================================
// サイズプリセット
// ========================================
const SIZE_VALUES: Record<SizePreset, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ========================================
// スタイルクラスマッピング
// ========================================
const ANIMATION_CLASSES: Record<AnimationPreset, string> = {
  bounce: styles.bounce,
  'bounce-in': styles.bounceIn,
  'bounce-out': styles.bounceOut,
  'bounce-horizontal': styles.bounceHorizontal,
  ping: styles.ping,
  pulse: styles.pulse,
  'pulse-scale': styles.pulseScale,
  spin: styles.spin,
  'spin-slow': styles.spinSlow,
  'spin-fast': styles.spinFast,
  'spin-reverse': styles.spinReverse,
  wiggle: styles.wiggle,
  'wiggle-more': styles.wiggleMore,
  shake: styles.shake,
  'shake-hard': styles.shakeHard,
  float: styles.float,
  'float-rotate': styles.floatRotate,
  heartbeat: styles.heartbeat,
  tada: styles.tada,
  swing: styles.swing,
  'flip-x': styles.flipX,
  'flip-y': styles.flipY,
  'rotate-3d': styles.rotate3d,
  'flip-in': styles.flipIn,
  'flip-out': styles.flipOut,
  pop: styles.pop,
  'pop-in': styles.popIn,
  'rubber-band': styles.rubberBand,
  jello: styles.jello,
  squeeze: styles.squeeze,
  wobble: styles.wobble,
  'fade-in': styles.fadeIn,
  'fade-out': styles.fadeOut,
  'fade-in-up': styles.fadeInUp,
  'fade-in-down': styles.fadeInDown,
  'zoom-in': styles.zoomIn,
  'zoom-out': styles.zoomOut,
  'slide-in-left': styles.slideInLeft,
  'slide-in-right': styles.slideInRight,
  'slide-in-up': styles.slideInUp,
  'slide-in-down': styles.slideInDown,
  glow: styles.glow,
  'glow-strong': styles.glowStrong,
  'glow-pulse': styles.glowPulse,
  'glow-breathe': styles.glowBreathe,
  'glow-rainbow': styles.glowRainbow,
  neon: styles.neon,
  'color-shift': styles.colorShift,
  rainbow: styles.rainbow,
  flash: styles.flash,
  flicker: styles.flicker,
  sparkle: styles.sparkle,
  twinkle: styles.twinkle,
  glitch: styles.glitch,
  'blur-pulse': styles.blurPulse,
  morph: styles.morph,
  liquid: styles.liquid,
  orbit: styles.orbit,
  ripple: styles.ripple,
};

const HOVER_CLASSES: Record<Exclude<HoverPreset, 'auto'>, string> = {
  scale: styles.hoverScale,
  'scale-large': styles.hoverScaleLarge,
  rotate: styles.hoverRotate,
  'rotate-full': styles.hoverRotateFull,
  glow: styles.hoverGlow,
  neon: styles.hoverNeon,
  bounce: styles.hoverBounce,
  pop: styles.hoverPop,
  wiggle: styles.hoverWiggle,
  shake: styles.hoverShake,
  swing: styles.hoverSwing,
  spin: styles.hoverSpin,
  flip: styles.hoverFlip,
  'flip-x': styles.hoverFlipX,
  float: styles.hoverFloat,
  'rubber-band': styles.hoverRubberBand,
  jello: styles.hoverJello,
  tada: styles.hoverTada,
  heartbeat: styles.hoverHeartbeat,
  glitch: styles.hoverGlitch,
};

const COLOR_CLASSES: Record<ColorVariant, string> = {
  current: '',
  primary: styles.colorPrimary,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
  danger: styles.colorError,
  info: styles.colorInfo,
  muted: styles.colorMuted,
};

// fill / stroke prop に渡されるキーワードを CSS の色値に正規化する。
// - セマンティック名（primary/success/warning/danger/info/muted/dark）は CSS 変数へ
// - 'current' は currentColor へ
// - それ以外（#hex や CSS named color、rgb() など）はそのまま通す
const COLOR_KEYWORD_MAP: Record<string, string> = {
  primary: 'var(--color-primary-500)',
  success: 'var(--color-success-500)',
  warning: 'var(--color-warning-500)',
  danger: 'var(--color-danger-500)',
  info: 'var(--color-info-500)',
  muted: 'var(--color-gray-400)',
  dark: 'var(--color-gray-800)',
  current: 'currentColor',
};

const resolveColor = (value?: string): string | undefined => {
  if (!value) return undefined;
  return COLOR_KEYWORD_MAP[value] ?? value;
};

// アクセント（2 色目）を --icon-accent に流すクラス。
// SVG 内で .accent / .accentStroke を付けた要素だけ別色になる。
const ACCENT_CLASSES: Record<ColorVariant, string> = {
  current: '',
  primary: styles.accentPrimary,
  success: styles.accentSuccess,
  warning: styles.accentWarning,
  danger: styles.accentError,
  info: styles.accentInfo,
  muted: styles.accentMuted,
};

// ========================================
// アイコンごとのデフォルトホバーアニメーション
// ========================================
const DEFAULT_HOVER_MAP: Partial<Record<string, HoverPreset>> = {
  // 通知・アラート系
  bell: 'swing',
  'info-triangle': 'shake',
  'info-circle': 'pop',

  // 設定・操作系
  gear: 'rotate',
  sliders: 'pop',
  funnel: 'pop',

  // ナビゲーション系
  home: 'pop',
  dashboard: 'pop',
  'chart-bar': 'pop',
  list: 'pop',
  folder: 'pop',
  file: 'pop',
  survey: 'pop',
  calendar: 'pop',
  'chevron-left': 'pop',
  'chevron-right': 'pop',
  'chevron-up': 'pop',
  'chevron-down': 'pop',
  'chevrons-left': 'pop',
  'chevrons-right': 'pop',

  // ユーザー系
  person: 'pop',
  employee: 'pop',
  'users-group': 'pop',

  // アクション系
  save: 'pop',
  trash: 'shake',
  'arrow-rotate': 'rotate',
  'arrow-up-right': 'pop',
  'arrow-in': 'pop',
  'arrow-turn-left': 'pop',
  'arrow-u-turn': 'pop',
  'sync-pull': 'bounce',
  'sync-push': 'bounce',
  'cloud-upload': 'float',

  // 認証系
  lock: 'shake',
  unlock: 'pop',
  'door-out': 'pop',

  // チャート・トレンド系
  'trend-up': 'float',
  'trend-up-right': 'float',
  'trend-right': 'pop',
  'trend-down-right': 'bounce',
  'trend-down': 'bounce',

  // その他
  star: 'pop',
  'star-filled': 'heartbeat',
  chat: 'pop',
  'comment-check': 'pop',
  clock: 'rotate',
  eye: 'pop',
  'eye-slashed': 'pop',
  'magnifying-glass': 'pop',
  check: 'pop',
  'check-circle': 'pop',
  'x-circle': 'shake',
  x: 'pop',
  hamburger: 'pop',
  expand: 'scale',
  keyboard: 'pop',
  palette: 'pop',
  brush: 'wiggle',
  diamond: 'glow',
  'paint-roller': 'wiggle',
  inbox: 'pop',
  archive: 'pop',
  dot: 'pop',

  // メディアプレイヤー
  'volume-off': 'pop',
  'volume-low': 'pop',
  'volume-high': 'pop',
  fullscreen: 'scale',
  'fullscreen-exit': 'scale',
  shuffle: 'wiggle',
  'skip-forward': 'pop',
  sidebar: 'pop',

  // 議事録・音声関連
  'transcript-doc': 'pop',
  'audio-wave': 'wiggle',
  'mic-text': 'pop',
  'play-doc': 'pop',
  'chat-wave': 'pop',
  'shield-audio': 'glow',

  // ブランド
  'meetscribe-brand': 'pop',
  'meetscribe-brand-wave': 'wiggle',
  'meetscribe-brand-mic': 'pop',
  'meetscribe-brand-play': 'pop',
  'meetscribe-brand-chat': 'pop',
  'meetscribe-brand-shield': 'glow',
};

// ========================================
// Icon コンポーネント
// ========================================
export const Icon: React.FC<IconProps> = ({
  name: nameProp,
  preset,
  size = 24,
  className,
  style,
  stroke,
  fill,
  strokeWidth = 2,
  dot = false,
  dotPing = false,
  disabled = false,
  active = false,
  animation: animationProp,
  hover: hoverProp,
  animate = true,
  glow: glowProp,
  glowStrong: glowStrongProp,
  clickable = false,
  onClick,
  color: colorProp,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}) => {
  // preset から設定を解決。個別 prop が明示されていればそちらが勝つ。
  const presetConfig: PresetConfig | undefined = preset ? PRESET_MAP[preset] : undefined;
  const name = (nameProp ?? presetConfig?.name ?? '') as IconName;
  const color = colorProp ?? presetConfig?.color ?? 'current';
  const glow = glowProp ?? presetConfig?.glow ?? false;
  const glowStrong = glowStrongProp ?? presetConfig?.glowStrong ?? false;
  const animation = animationProp ?? presetConfig?.animation;
  const hover = hoverProp ?? presetConfig?.hover;
  const accent = presetConfig?.accent;
  // colorShift は preset 側で明示されていればそれが最優先。
  // 未指定なら「accent あり かつ animation 未指定」のときだけ自動で ON。
  const colorShift =
    presetConfig?.colorShift ?? (!!accent && !animation);

  // サイズを解決
  const resolvedSize = typeof size === 'string' ? SIZE_VALUES[size] : size;

  // スピナー判定 - 素の円弧なので CSS で回転させる必要がある。
  // 他の loading-* は SVG 内に固有の SMIL アニメを持つので自動回転しない。
  const isSpinnerIcon = name.startsWith('spinner');

  // ホバーアニメーションを解決（'auto' の場合はデフォルトを使用）
  const resolvedHover =
    hover === 'auto' ? DEFAULT_HOVER_MAP[name] : hover;

  // クラス名を構築
  const iconClasses = cn(
    styles.icon,
    // アニメーション
    animate && animation && ANIMATION_CLASSES[animation],
    // スピナー系のみ自動で CSS スピン（他の loading-* は SVG 内 SMIL 任せ）
    isSpinnerIcon && !animation && styles.spin,
    // ホバー（'auto' は解決済みなので除外）
    resolvedHover && resolvedHover !== 'auto' && HOVER_CLASSES[resolvedHover],
    // カラー（外枠/本体）
    color !== 'current' && COLOR_CLASSES[color],
    // アクセント色（2 色目）を --icon-accent に流す
    accent && accent !== 'current' && ACCENT_CLASSES[accent],
    // color ↔ accent 往復は preset.colorShift で明示制御（既定は accent あり & animation なし）
    animate && colorShift && styles.colorShiftAccent,
    // グロー
    glow && styles.glow,
    glowStrong && styles.glowStrong,
    // 状態
    clickable && styles.clickable,
    disabled && styles.disabled,
    active && styles.active,
    // ドット
    dot && !dotPing && styles.dot,
    dotPing && styles.dotPing,
    // ユーザー指定
    className,
  );

  // fill / stroke のキーワード解決
  const resolvedStroke = resolveColor(stroke);
  const resolvedFill = resolveColor(fill);

  // SVG props
  const svgProps = {
    className: iconClasses,
    style: {
      ...style,
      // fill はアイコン全体の色として解釈する（currentColor を上書き）。
      // ただし fill="none" は .fill 要素だけ塗らない意味で伝統的に使われているため除外。
      ...(resolvedFill && resolvedFill !== 'none' && { color: resolvedFill }),
      // .fill 要素だけ個別に別色にしたいケース用の変数（none もそのまま流す）
      ...(resolvedFill && { '--icon-fill': resolvedFill }),
      // stroke は .stroke 要素の stroke 属性だけを上書き
      ...(resolvedStroke && { '--icon-stroke': resolvedStroke }),
    } as React.CSSProperties,
    width: resolvedSize,
    height: resolvedSize,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    onClick,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden ?? !ariaLabel,
    'data-icon': name,
    'data-component': 'icon',
  };

  // Path をレンダリング
  const renderPath = () => {
    const pathRenderer = ICON_PATHS[name];
    if (pathRenderer) {
      return pathRenderer({});
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found`);
    }
    return null;
  };

  return <svg {...svgProps}>{renderPath()}</svg>;
};
