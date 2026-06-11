/**
 * アニメーション設定の一元管理
 * アプリ全体で使用されるアニメーション定義
 *
 * Icon コンポーネントと同様に、アニメーション設定を統一管理します。
 *
 * @example
 * ```typescript
 * import { ANIMATIONS, getConditionalAnimationStyle } from '../constants';
 *
 * // カードアニメーション
 * const style = getConditionalAnimationStyle(
 *   enabled,
 *   ANIMATIONS.card.slideRight,
 *   index
 * );
 *
 * // テーブル行アニメーション
 * const style = getConditionalAnimationStyle(
 *   enabled,
 *   ANIMATIONS.tableRow.slideDown,
 *   index
 * );
 * ```
 */

// ============================================
// 公開型定義
// ============================================

/**
 * アニメーション設定の型
 */
export interface AnimationConfig {
  /** CSS keyframes 名 */
  name: string;
  /** CSS アニメーション継続時間（ms） */
  duration: number;
  /** CSS アニメーション遅延（ms） */
  delay: number;
  /** CSS イージング関数 */
  easing: string;
  /** Framer Motion 継続時間（秒）。未指定時は duration/1000 を使用 */
  framerDuration?: number;
  /** Framer Motion 遅延（秒）。未指定時は delay/1000 を使用 */
  framerDelay?: number;
  /** Framer Motion イージング（cubic-bezier配列）。未指定時は easing を変換 */
  framerEasing?: readonly number[];
  /** collapse アニメーション用の最大高さ（px） */
  maxHeight?: number;
}

/**
 * アニメーションのバリアント型
 * 'none' = アニメーションなし
 */
export type CardAnimationVariant = 'none' | 'slideRight' | 'slideRightFast' | 'slideDown' | 'slideDownFast' | 'fadeIn' | 'scaleUp' | 'bounceIn';
export type DropMenuAnimationVariant = 'none' | 'slideDown' | 'fadeIn' | 'scaleY';
export type TableRowAnimationVariant = 'none' | 'slideDown' | 'slideDownFast' | 'fadeIn' | 'slideLeft';

// ============================================
// 内部データ（非export）
// ============================================

/**
 * アニメーション速度（duration）
 */
const ANIMATION_DURATION = {
  SLOW: 800,
  NORMAL: 500,
  FAST: 300,
} as const;

/**
 * アニメーション遅延（各要素間の時間差）
 */
const ANIMATION_DELAY = {
  /** テーブル行間の遅延 */
  TABLE_ROW: 50,
  /** カード間の遅延 */
  CARD: 150,
  /** メニュー項目間の遅延 */
  MENU_ITEM: 50,
  /** ドロップメニュー項目間の遅延 */
  DROP_MENU: 30,
} as const;

/**
 * イージング関数
 */
const ANIMATION_EASING = {
  /** バウンシーな動き */
  BOUNCY: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** スムーズな動き */
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** リニア */
  LINEAR: 'linear',
} as const;

/**
 * CSS アニメーション名（styles/index.css で定義）
 */
const CSS_KEYFRAMES = {
  /** 上から降ってくる（-20px → 0） */
  SLIDE_DOWN: 'menuItemSlide',
  /** 右から左へ（100px → 0） */
  SLIDE_RIGHT: 'cardDeal',
  /** Card: フェードイン */
  CARD_FADE_IN: 'cardFadeIn',
  /** Card: 拡大 */
  CARD_SCALE_UP: 'cardScaleUp',
  /** Card: バウンスイン */
  CARD_BOUNCE_IN: 'cardBounceIn',
  /** TableRow: フェードイン */
  TABLE_ROW_FADE_IN: 'tableRowFadeIn',
  /** TableRow: 左からスライド */
  TABLE_ROW_SLIDE_LEFT: 'tableRowSlideLeft',
  /** DropMenu: フェードイン */
  DROP_MENU_FADE_IN: 'dropMenuFadeIn',
  /** DropMenu: 縦方向拡大 */
  DROP_MENU_SCALE_Y: 'dropMenuScaleY',
} as const;

/**
 * Framer Motion 専用のアニメーション名
 * CSS keyframes を持たないもの
 */
const FRAMER_MOTION_ANIMATIONS = {
  /** 高さとパディングの動的制御 */
  COLLAPSE: 'collapse',
  /** シンプルな透明度変化 */
  FADE: 'fade',
  /** 4方向スライド（Framer Motion版） */
  SLIDE: 'slide',
  /** 拡大縮小 */
  SCALE: 'scale',
  /** 回転（シェブロンなど） */
  ROTATE: 'rotate',
} as const;

/**
 * カードスライドアニメーション
 * 複数のバリアントを持つ
 */
const CARD_SLIDE_ANIMATION = {
  /** 右からスライドイン（デフォルト） */
  slideRight: {
    name: CSS_KEYFRAMES.SLIDE_RIGHT,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.CARD,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** 右からスライドイン（高速） */
  slideRightFast: {
    name: CSS_KEYFRAMES.SLIDE_RIGHT,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.CARD / 2,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** 上からスライドイン */
  slideDown: {
    name: CSS_KEYFRAMES.SLIDE_DOWN,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.CARD,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** 上からスライドイン（高速） */
  slideDownFast: {
    name: CSS_KEYFRAMES.SLIDE_DOWN,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.CARD / 2,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** フェードイン */
  fadeIn: {
    name: CSS_KEYFRAMES.CARD_FADE_IN,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.CARD,
    easing: ANIMATION_EASING.SMOOTH,
  },
  /** 拡大 */
  scaleUp: {
    name: CSS_KEYFRAMES.CARD_SCALE_UP,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.CARD,
    easing: ANIMATION_EASING.SMOOTH,
  },
  /** バウンスイン */
  bounceIn: {
    name: CSS_KEYFRAMES.CARD_BOUNCE_IN,
    duration: ANIMATION_DURATION.SLOW,
    delay: ANIMATION_DELAY.CARD,
    easing: ANIMATION_EASING.LINEAR,
  },
} as const;

/**
 * ドロップダウンメニューアニメーション
 */
const DROP_MENU_ANIMATION = {
  /** 上からスライドイン */
  slideDown: {
    name: CSS_KEYFRAMES.SLIDE_DOWN,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.DROP_MENU,
    easing: ANIMATION_EASING.SMOOTH,
  },
  /** フェードイン */
  fadeIn: {
    name: CSS_KEYFRAMES.DROP_MENU_FADE_IN,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.DROP_MENU,
    easing: ANIMATION_EASING.SMOOTH,
  },
  /** 縦方向拡大 */
  scaleY: {
    name: CSS_KEYFRAMES.DROP_MENU_SCALE_Y,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.DROP_MENU,
    easing: ANIMATION_EASING.SMOOTH,
  },
} as const;

/**
 * テーブル行アニメーション
 */
const TABLE_ROW_ANIMATION = {
  /** 上からスライドイン */
  slideDown: {
    name: CSS_KEYFRAMES.SLIDE_DOWN,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.TABLE_ROW,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** 上からスライドイン（高速） */
  slideDownFast: {
    name: CSS_KEYFRAMES.SLIDE_DOWN,
    duration: ANIMATION_DURATION.FAST,
    delay: ANIMATION_DELAY.TABLE_ROW / 2,
    easing: ANIMATION_EASING.BOUNCY,
  },
  /** フェードイン */
  fadeIn: {
    name: CSS_KEYFRAMES.TABLE_ROW_FADE_IN,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.TABLE_ROW,
    easing: ANIMATION_EASING.SMOOTH,
  },
  /** 左からスライド */
  slideLeft: {
    name: CSS_KEYFRAMES.TABLE_ROW_SLIDE_LEFT,
    duration: ANIMATION_DURATION.NORMAL,
    delay: ANIMATION_DELAY.TABLE_ROW,
    easing: ANIMATION_EASING.SMOOTH,
  },
} as const;

/**
 * Framer Motion 専用アニメーション
 * 複数のバリアントを持つ
 */
const FRAMER_ANIMATION = {
  /** 高さ折りたたみ（SubHeader など） */
  collapse: {
    name: FRAMER_MOTION_ANIMATIONS.COLLAPSE,
    duration: ANIMATION_DURATION.FAST,
    delay: 0,
    easing: ANIMATION_EASING.SMOOTH,
    framerDuration: 0.3,
    framerEasing: [0.4, 0, 0.2, 1], // cubic-bezier(0.4, 0, 0.2, 1)
    maxHeight: 500,
  },
  /** フェードイン */
  fade: {
    name: FRAMER_MOTION_ANIMATIONS.FADE,
    duration: ANIMATION_DURATION.FAST,
    delay: 0,
    easing: ANIMATION_EASING.SMOOTH,
    framerDuration: 0.3,
    framerEasing: [0.4, 0, 0.2, 1],
  },
  /** スライド（4方向対応） */
  slide: {
    name: FRAMER_MOTION_ANIMATIONS.SLIDE,
    duration: ANIMATION_DURATION.NORMAL,
    delay: 0,
    easing: ANIMATION_EASING.SMOOTH,
    framerDuration: 0.5,
    framerEasing: [0.4, 0, 0.2, 1],
  },
  /** 拡大縮小 */
  scale: {
    name: FRAMER_MOTION_ANIMATIONS.SCALE,
    duration: ANIMATION_DURATION.FAST,
    delay: 0,
    easing: ANIMATION_EASING.SMOOTH,
    framerDuration: 0.3,
    framerEasing: [0.4, 0, 0.2, 1],
  },
  /** 回転（シェブロンなど） */
  rotate: {
    name: 'rotate',
    duration: ANIMATION_DURATION.SLOW,
    delay: 0,
    easing: ANIMATION_EASING.BOUNCY,
    framerDuration: 0.6,
    framerEasing: [0.68, -0.55, 0.265, 1.55], // バウンシーなイージング
  },
} as const;

// ============================================
// 公開API
// ============================================

/**
 * アニメーション設定の集約オブジェクト
 * 各アニメーションタイプとそのバリアントにアクセス可能
 */
export const ANIMATIONS = {
  /** カードスライドアニメーション */
  card: CARD_SLIDE_ANIMATION,
  /** ドロップダウンメニューアニメーション */
  dropMenu: DROP_MENU_ANIMATION,
  /** テーブル行アニメーション */
  tableRow: TABLE_ROW_ANIMATION,
  /** Framer Motion 専用アニメーション */
  framer: FRAMER_ANIMATION,
} as const;

// ============================================
// ヘルパー関数
// ============================================

/**
 * CSS アニメーションスタイルを生成
 * @param config アニメーション設定（具体的なバリアント）
 * @param index 要素のインデックス（遅延計算用）
 * @param speed 速度倍率（デフォルト: 1.0）
 * @returns CSS スタイルオブジェクト
 */
export function getAnimationStyle(
  config: AnimationConfig,
  index: number,
  speed: number = 1.0
): React.CSSProperties {
  const MAX_DELAY_MS = 1500;
  const adjustedDuration = config.duration / speed;
  const adjustedDelay = Math.min((index * config.delay) / speed, MAX_DELAY_MS);

  return {
    animation: `${config.name} ${adjustedDuration}ms ${config.easing} forwards`,
    animationDelay: `${adjustedDelay}ms`,
    opacity: 0,
  };
}

/**
 * アニメーション有効時のみスタイルを返す
 * @param enabled アニメーション有効フラグ
 * @param config アニメーション設定（具体的なバリアント）、undefined の場合はアニメーションなし
 * @param index 要素のインデックス
 * @param speed 速度倍率（デフォルト: 1.0）
 * @returns CSS スタイルオブジェクト（または undefined）
 */
export function getConditionalAnimationStyle(
  enabled: boolean,
  config: AnimationConfig | undefined,
  index: number,
  speed: number = 1.0
): React.CSSProperties | undefined {
  if (!enabled || !config) return undefined;
  return getAnimationStyle(config, index, speed);
}
