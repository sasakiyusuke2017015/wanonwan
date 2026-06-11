/**
 * UIスタイル設定
 * アプリ全体のデザインスタイルを一元管理
 *
 * @example
 * ```typescript
 * const theme = getThemeConfig('emerald', 'soft');
 *
 * // 色を使う
 * theme.colors.primaryBgColor
 *
 * // 形状を使う
 * theme.shapes.borderRadius
 * ```
 */

// ============================================
// 型定義
// ============================================

/** カラーテーマ */
export type ColorTheme = 'emerald' | 'slate' | 'indigo' | 'blue' | 'rose' | 'light';

/** 形状テーマ */
export type ShapeTheme = 'soft' | 'rounded' | 'sharp';

/** 背景テーマ */
export type BackgroundTheme = 'wood' | 'flooring' | 'fabric' | 'concrete' | 'leather' | 'marble' | 'cream' | 'lavender' | 'sky';

/** HSL色値（内部用） */
interface HSL {
  h: number;
  s: number;
  l: number;
}

/** ベースカラー定義（内部用） */
interface BaseColors {
  primary: HSL;
  accent: HSL;
  nav: HSL;
  isLight?: boolean;
}

/** カラー設定 */
interface ColorConfig {
  primaryBgColor: string;
  primaryBgColorDark: string;
  primaryBgColorHover: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  primaryContrastText: string;
  tableHeaderBgColor: string;
  tableHeaderTextColor: string;
  primaryOverlayHover: string;
  primaryOverlayActive: string;
  secondaryBgColor: string;
  secondaryBgColorHover: string;
  secondaryTextColor: string;
  secondaryBorderColor: string;
  secondaryContrastText: string;
  accentBgColor: string;
  accentBgColorHover: string;
  accentTextColor: string;
  accentTextColorHover: string;
  accentBorderColor: string;
  accentContrastText: string;
  focusRingColor: string;
  focusBorderColor: string;
  disabledBgColor: string;
  disabledTextColor: string;
  breadcrumbLinkColor: string;
  breadcrumbLinkHoverColor: string;
  breadcrumbSeparatorColor: string;
  navActiveBgColor: string;
  navActiveTextColor: string;
  navHoverBgColor: string;
  navHoverTextColor: string;
}

/** 形状設定 */
interface ShapeConfig {
  borderRadius: string;
  buttonRadius: string;
  inputRadius: string;
  cardRadius: string;
  modalRadius: string;
  dropdownRadius: string;
  badgeRadius: string;
  cellRadius: string;
  subHeaderRadius: string;
}

/** 背景設定 */
export interface BackgroundConfig {
  className: string;
  label: string;
}

/** テーマ設定（getThemeConfigの戻り値） */
export interface ThemeConfig {
  colors: ColorConfig;
  shapes: ShapeConfig;
}

// ============================================
// 内部データ
// ============================================

/** ベースカラー定義 */
const BASE_COLORS: Record<ColorTheme, BaseColors> = {
  emerald: {
    primary: { h: 160, s: 84, l: 20 },
    accent: { h: 161, s: 94, l: 30 },
    nav: { h: 160, s: 84, l: 39 },
  },
  slate: {
    primary: { h: 222, s: 47, l: 17 },
    accent: { h: 215, s: 19, l: 35 },
    nav: { h: 142, s: 71, l: 45 },
  },
  indigo: {
    primary: { h: 244, s: 55, l: 41 },
    accent: { h: 245, s: 75, l: 59 },
    nav: { h: 142, s: 71, l: 45 },
  },
  blue: {
    primary: { h: 226, s: 71, l: 40 },
    accent: { h: 221, s: 83, l: 53 },
    nav: { h: 142, s: 71, l: 45 },
  },
  rose: {
    primary: { h: 343, s: 79, l: 35 },
    accent: { h: 347, s: 77, l: 50 },
    nav: { h: 142, s: 71, l: 45 },
  },
  light: {
    primary: { h: 220, s: 14, l: 96 },
    accent: { h: 220, s: 9, l: 46 },
    nav: { h: 142, s: 71, l: 45 },
    isLight: true,
  },
};

/** 形状設定 */
const SHAPE_CONFIG: Record<ShapeTheme, ShapeConfig> = {
  soft: {
    borderRadius: '8px',
    buttonRadius: '8px',
    inputRadius: '6px',
    cardRadius: '12px',
    modalRadius: '12px',
    dropdownRadius: '8px',
    badgeRadius: '6px',
    cellRadius: '4px',
    subHeaderRadius: '8px',
  },
  rounded: {
    borderRadius: '25px',
    buttonRadius: '25px',
    inputRadius: '12px',
    cardRadius: '20px',
    modalRadius: '24px',
    dropdownRadius: '16px',
    badgeRadius: '9999px',
    cellRadius: '8px',
    subHeaderRadius: '16px',
  },
  sharp: {
    borderRadius: '1px',
    buttonRadius: '1px',
    inputRadius: '1px',
    cardRadius: '1px',
    modalRadius: '1px',
    dropdownRadius: '1px',
    badgeRadius: '1px',
    cellRadius: '1px',
    subHeaderRadius: '1px',
  },
};

/** 背景設定 */
export const BACKGROUND_CONFIG: Record<BackgroundTheme, BackgroundConfig> = {
  wood: {
    className: 'bg-wood-texture',
    label: '木目',
  },
  flooring: {
    className: 'bg-flooring-texture',
    label: 'フロア',
  },
  fabric: {
    className: 'bg-fabric-texture',
    label: '布',
  },
  concrete: {
    className: 'bg-tile-texture',
    label: 'タイル',
  },
  leather: {
    className: 'bg-paper-texture',
    label: '紙',
  },
  marble: {
    className: 'bg-mint-solid',
    label: 'ミント',
  },
  cream: {
    className: 'bg-cream-solid',
    label: 'クリーム',
  },
  lavender: {
    className: 'bg-lavender-solid',
    label: 'ラベンダー',
  },
  sky: {
    className: 'bg-sky-solid',
    label: 'スカイ',
  },
};

// ============================================
// ユーティリティ関数（内部用）
// ============================================

function hsl(color: HSL): string {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

function adjustLightness(color: HSL, delta: number): HSL {
  return { ...color, l: Math.max(0, Math.min(100, color.l + delta)) };
}

function adjustSaturation(color: HSL, delta: number): HSL {
  return { ...color, s: Math.max(0, Math.min(100, color.s + delta)) };
}

// ============================================
// カラー生成（内部用）
// ============================================

function generateColorConfig(base: BaseColors): ColorConfig {
  const { primary, accent, nav, isLight = false } = base;

  const primaryDark = adjustLightness(primary, -6);
  const primaryHover = adjustLightness(primary, 8);
  const secondaryBg = adjustLightness(primary, -8);
  const secondaryBorder = adjustLightness(primary, -4);
  const accentHover = adjustLightness(accent, 9);
  const disabledBg = adjustLightness(primary, 60);
  const disabledText = adjustLightness(primary, 32);
  const breadcrumbLink = adjustLightness(primary, 60);
  const breadcrumbLinkHover = adjustLightness(primary, 70);

  if (isLight) {
    return {
      primaryBgColor: hsl(primary),
      primaryBgColorDark: hsl(adjustLightness(primary, -8)),
      primaryBgColorHover: hsl(adjustLightness(primary, -5)),
      primaryTextColor: 'hsl(217, 33%, 17%)',
      primaryBorderColor: 'hsl(216, 12%, 84%)',
      primaryContrastText: 'hsl(217, 33%, 17%)',
      tableHeaderBgColor: hsl(adjustLightness(primary, -5)),
      tableHeaderTextColor: 'hsl(217, 33%, 17%)',
      primaryOverlayHover: 'hsla(0, 0%, 0%, 0.1)',
      primaryOverlayActive: 'hsla(0, 0%, 0%, 0.2)',
      secondaryBgColor: hsl(adjustLightness(primary, -8)),
      secondaryBgColorHover: hsl(adjustLightness(primary, -12)),
      secondaryTextColor: 'hsl(0, 0%, 0%)',
      secondaryBorderColor: 'hsl(216, 12%, 84%)',
      secondaryContrastText: 'hsl(217, 33%, 17%)',
      accentBgColor: hsl(accent),
      accentBgColorHover: hsl(adjustLightness(accent, 19)),
      accentTextColor: hsl(accent),
      accentTextColorHover: hsl(adjustLightness(accent, 19)),
      accentBorderColor: hsl(accent),
      accentContrastText: 'hsl(0, 0%, 100%)',
      focusRingColor: hsl(accent),
      focusBorderColor: hsl(accent),
      disabledBgColor: hsl(primary),
      disabledTextColor: hsl(adjustLightness(accent, 19)),
      breadcrumbLinkColor: 'hsl(215, 14%, 34%)',
      breadcrumbLinkHoverColor: 'hsl(221, 39%, 11%)',
      breadcrumbSeparatorColor: hsl(adjustLightness(accent, 19)),
      navActiveBgColor: hsl(nav),
      navActiveTextColor: 'hsl(0, 0%, 100%)',
      navHoverBgColor: hsl(nav),
      navHoverTextColor: hsl(nav),
    };
  }

  return {
    primaryBgColor: hsl(primary),
    primaryBgColorDark: hsl(primaryDark),
    primaryBgColorHover: hsl(primaryHover),
    primaryTextColor: hsl(primary),
    primaryBorderColor: hsl(primary),
    primaryContrastText: 'hsl(0, 0%, 100%)',
    tableHeaderBgColor: hsl(primaryHover),
    tableHeaderTextColor: 'hsl(0, 0%, 100%)',
    primaryOverlayHover: 'hsla(0, 0%, 100%, 0.2)',
    primaryOverlayActive: 'hsla(0, 0%, 100%, 0.3)',
    secondaryBgColor: hsl(secondaryBg),
    secondaryBgColorHover: hsl(adjustSaturation(adjustLightness(primary, 45), -40)),
    secondaryTextColor: hsl(adjustSaturation(adjustLightness(primary, 73), -64)),
    secondaryBorderColor: hsl(secondaryBorder),
    secondaryContrastText: 'hsl(0, 0%, 100%)',
    accentBgColor: hsl(accent),
    accentBgColorHover: hsl(accentHover),
    accentTextColor: hsl(accent),
    accentTextColorHover: hsl(accentHover),
    accentBorderColor: hsl(accent),
    accentContrastText: 'hsl(0, 0%, 100%)',
    focusRingColor: hsl(accentHover),
    focusBorderColor: hsl(accentHover),
    disabledBgColor: hsl(disabledBg),
    disabledTextColor: hsl(disabledText),
    breadcrumbLinkColor: hsl(breadcrumbLink),
    breadcrumbLinkHoverColor: hsl(breadcrumbLinkHover),
    breadcrumbSeparatorColor: 'hsla(0, 0%, 100%, 0.6)',
    navActiveBgColor: hsl(nav),
    navActiveTextColor: 'hsl(0, 0%, 100%)',
    navHoverBgColor: hsl(nav),
    navHoverTextColor: hsl(nav),
  };
}

// ============================================
// キャッシュ
// ============================================

const cache = new Map<string, ThemeConfig>();

// ============================================
// 公開API（これだけ！）
// ============================================

/**
 * テーマ設定を取得（要素スタイル用）
 *
 * @param color カラーテーマ
 * @param shape 形状テーマ
 * @returns テーマ設定（colors, shapes）
 *
 * @example
 * ```typescript
 * const theme = getThemeConfig('emerald', 'soft');
 * theme.colors.primaryBgColor  // 色
 * theme.shapes.borderRadius    // 形状
 * ```
 */
export function getThemeConfig(
  color: 'emerald' | 'slate' | 'indigo' | 'blue' | 'rose' | 'light',
  shape: 'soft' | 'rounded' | 'sharp'
): ThemeConfig {
  const cacheKey = `${color}-${shape}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const colors = generateColorConfig(BASE_COLORS[color]);
  const shapes = SHAPE_CONFIG[shape];

  const config: ThemeConfig = { colors, shapes };
  cache.set(cacheKey, config);
  return config;
}

/**
 * 背景設定を取得
 *
 * @param background 背景テーマ
 * @returns 背景設定
 *
 * @example
 * ```typescript
 * const bg = getBackgroundConfig('wood');
 * bg.className  // 'bg-wood-texture'
 * bg.label      // '木目調'
 * ```
 */
export function getBackgroundConfig(background: BackgroundTheme): BackgroundConfig {
  return BACKGROUND_CONFIG[background];
}

/**
 * 背景テーマに対応するCSSスタイルを取得
 *
 * @param theme 背景テーマ
 * @returns CSS スタイルオブジェクト
 *
 * @example
 * ```tsx
 * const style = getBackgroundStyle('wood');
 * <div style={style}>...</div>
 * ```
 */
export function getBackgroundStyle(theme: BackgroundTheme): React.CSSProperties {
  switch (theme) {
    case 'wood':
      // 木目 - 継ぎ目のない自然な木目
      return {
        backgroundColor: '#e8d4b8',
        backgroundImage: `
          linear-gradient(90deg,
            rgba(180, 130, 70, 0.08) 0%,
            rgba(160, 110, 60, 0.12) 20%,
            rgba(140, 95, 50, 0.06) 40%,
            rgba(170, 120, 65, 0.10) 60%,
            rgba(150, 105, 55, 0.08) 80%,
            rgba(180, 130, 70, 0.08) 100%
          ),
          linear-gradient(180deg,
            rgba(120, 80, 40, 0.03) 0%,
            rgba(100, 70, 35, 0.05) 25%,
            rgba(130, 90, 45, 0.02) 50%,
            rgba(110, 75, 40, 0.04) 75%,
            rgba(120, 80, 40, 0.03) 100%
          ),
          repeating-linear-gradient(
            87deg,
            transparent 0px,
            transparent 2px,
            rgba(100, 60, 25, 0.04) 2px,
            rgba(100, 60, 25, 0.04) 3px,
            transparent 3px,
            transparent 8px
          ),
          repeating-linear-gradient(
            93deg,
            transparent 0px,
            transparent 3px,
            rgba(90, 55, 20, 0.03) 3px,
            rgba(90, 55, 20, 0.03) 4px,
            transparent 4px,
            transparent 12px
          )
        `,
      };
    case 'flooring':
      // フローリング - 斜めの木目パターン
      return {
        backgroundColor: '#f5ddb8',
        backgroundImage: `
          linear-gradient(90deg, rgba(139, 90, 43, 0.15) 2px, transparent 2px),
          linear-gradient(rgba(139, 90, 43, 0.1) 2px, transparent 2px),
          repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(101, 67, 33, 0.15) 35px, rgba(101, 67, 33, 0.15) 70px),
          repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(101, 67, 33, 0.12) 35px, rgba(101, 67, 33, 0.12) 70px)
        `,
        backgroundSize: '80px 80px, 80px 80px, 140px 140px, 140px 140px',
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
      };
    case 'fabric':
      // 布 - 織り目のあるキャンバス風
      return {
        backgroundColor: '#f0ede8',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(80, 70, 60, 0.06) 1px,
            rgba(80, 70, 60, 0.06) 2px
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 1px,
            rgba(80, 70, 60, 0.06) 1px,
            rgba(80, 70, 60, 0.06) 2px
          ),
          repeating-linear-gradient(
            45deg,
            transparent 0px,
            transparent 4px,
            rgba(60, 50, 40, 0.02) 4px,
            rgba(60, 50, 40, 0.02) 8px
          )
        `,
        backgroundSize: '4px 4px, 4px 4px, 12px 12px',
      };
    case 'concrete':
      // タイル - 六角形ハニカムパターン
      return {
        backgroundColor: '#e8e4df',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Crect fill='%23e8e4df' width='56' height='100'/%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23c9c4be' stroke-width='1'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%23d4d0ca' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '56px 100px',
      };
    case 'leather':
      // 紙 - 細かい繊維のような質感
      return {
        backgroundColor: '#fdfcfa',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180, 150, 120, 0.02) 3px, rgba(180, 150, 120, 0.02) 6px),
          repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(180, 150, 120, 0.02) 3px, rgba(180, 150, 120, 0.02) 6px),
          radial-gradient(circle at 15% 30%, rgba(200, 170, 140, 0.015) 0%, transparent 40%),
          radial-gradient(circle at 85% 60%, rgba(200, 170, 140, 0.015) 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, rgba(200, 170, 140, 0.01) 0%, transparent 30%)
        `,
      };
    case 'marble':
      // ミント - 目に優しい淡いグリーン系単色
      return {
        backgroundColor: '#e8f0ec',
      };
    case 'cream':
      // クリーム - 暖かみのある淡いベージュ系単色
      return {
        backgroundColor: '#f7f4ef',
      };
    case 'lavender':
      // ラベンダー - 落ち着いた淡い紫系単色
      return {
        backgroundColor: '#f0eef5',
      };
    case 'sky':
      // スカイ - 爽やかな淡いブルー系単色
      return {
        backgroundColor: '#edf4f8',
      };
    default:
      return { backgroundColor: '#f5f5f5' };
  }
}

// ============================================
// セマンティックカラー
// ============================================

/**
 * セマンティックカラー定義
 *
 * UIコンポーネント全体で使用する意味のある色名とその実際の色値のマッピング
 * Tailwind CSSの色と整合性を保つ
 */
export const SEMANTIC_COLORS = {
  /** プライマリ（インディゴ系） - メインのアクション用 */
  primary: '#6366F1',
  /** インフォ（ブルー系） - 情報表示用 */
  info: '#3B82F6',
  /** サクセス（グリーン系） - 成功・完了状態用 */
  success: '#10B981',
  /** ワーニング（アンバー系） - 警告・注意用 */
  warning: '#F59E0B',
  /** デンジャー（レッド系） - エラー・危険用 */
  danger: '#EF4444',
  /** ダーク（グレー系） - 暗いテキスト・ボーダー用 */
  dark: '#1F2937',
  /** ライト（グレー系） - 明るい背景・ボーダー用 */
  light: '#F3F4F6',
  /** ミュート（グレー系） - 無効・非アクティブ用 */
  muted: '#9CA3AF',
} as const;

/** セマンティックカラーのキー型 */
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;

/** セマンティックカラーの値型 */
export type SemanticColorValue = (typeof SEMANTIC_COLORS)[SemanticColorKey];

/**
 * セマンティックカラー名から実際の色値を取得
 *
 * @param colorName セマンティックカラー名
 * @returns 色のhex値（見つからない場合はそのまま返す）
 *
 * @example
 * ```typescript
 * resolveSemanticColor('primary')  // '#6366F1'
 * resolveSemanticColor('success')  // '#10B981'
 * resolveSemanticColor('#FF0000')  // '#FF0000' (そのまま)
 * ```
 */
export function resolveSemanticColor(colorName: string): string {
  if (colorName in SEMANTIC_COLORS) {
    return SEMANTIC_COLORS[colorName as SemanticColorKey];
  }
  return colorName;
}

