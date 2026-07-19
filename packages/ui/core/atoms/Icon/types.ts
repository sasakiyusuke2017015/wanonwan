/**
 * Icon コンポーネント型定義
 *
 * 設計原則:
 * - SVG は幾何学データ（Path）に徹する
 * - SCSS で魂（色・動き・状態）を吹き込む
 * - currentColor を活用し親要素の色を継承
 */
import type React from 'react';
import type { IconName } from '../../constants';
import type { LucideIconName } from './lucide-registry';

/** 独自 SVG (IconName) と lucide registry (LucideIconName) の両方を受ける名前型 */
export type AnyIconName = IconName | LucideIconName;

/**
 * Preset 設定
 *
 * preset は「見た目のレシピ」を 1 語で呼び出すためのパッケージ。
 * size は含めない（利用側のレイアウト都合が優先）。
 * 個別 prop が渡された場合、そちらが preset を上書きする。
 */
export interface PresetConfig {
  name: AnyIconName;
  color?: ColorVariant;
  /**
   * アクセント色（2 色目）。
   * SVG 内で .accent / .accentStroke クラスを付けた要素だけ別色になる。
   */
  accent?: ColorVariant;
  /**
   * color ↔ accent を周期的に往復させる color-shift アニメを明示制御する。
   * 未指定時は「accent あり かつ animation 未指定」なら自動 ON。
   * 「accent はあるが色を動かしたくない」preset は false で抑止する。
   */
  colorShift?: boolean;
  glow?: boolean;
  glowStrong?: boolean;
  animation?: AnimationPreset;
  hover?: HoverPreset;
}

/**
 * ローディングプリセット
 * preset を指定すると見た目レシピ（name/color/glow/animation/hover）が適用される
 */
export type LoadingPreset = 'spinner' | 'cube' | 'interview';

/**
 * SCSS ベースのアニメーションプリセット
 * CSS アニメーションで実装（軽量・高パフォーマンス）
 */
export type AnimationPreset = 'pop' | 'shake' | 'spin';

/**
 * ホバー時のアニメーションプリセット
 */
export type HoverPreset =
  // === 自動（アイコンごとのデフォルト） ===
  | 'auto'
  | 'pop';

/**
 * カラーバリアント
 * currentColor を基本とし、セマンティックな色指定も可能
 */
export type ColorVariant =
  | 'current'    // currentColor（デフォルト）
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

/**
 * サイズプリセット
 */
export type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface IconProps {
  /** アイコン名（presetを使う場合は省略可）。独自 SVG + lucide registry の両方を受ける */
  name?: AnyIconName;

  /** SVG の viewBox（デフォルト: "0 0 24 24"）。path の余白が非対称なアイコンの位置補正に使う */
  viewBox?: string;

  /** ローディングプリセット（指定するとnameが自動設定される） */
  preset?: LoadingPreset;

  /** サイズ（数値 or プリセット） */
  size?: number | SizePreset;

  /** 追加のクラス名 */
  className?: string;

  /** インラインスタイル */
  style?: React.CSSProperties;

  /** stroke の色（デフォルト: currentColor） */
  stroke?: string;

  /** fill の色（デフォルト: none） */
  fill?: string;

  /** stroke の太さ */
  strokeWidth?: number;

  // ========================================
  // 状態
  // ========================================

  /** 右上に赤い通知ドットを表示 */
  dot?: boolean;

  /** ドットにパルスアニメーションを適用 */
  dotPing?: boolean;

  /** 無効状態 */
  disabled?: boolean;

  /** アクティブ状態（トグル等で使用） */
  active?: boolean;

  // ========================================
  // アニメーション（SCSS ベース）
  // ========================================

  /** アニメーションプリセット */
  animation?: AnimationPreset;

  /** ホバー時のアニメーション */
  hover?: HoverPreset;

  /** アニメーションを有効にする条件 */
  animate?: boolean;

  /** グロー効果 */
  glow?: boolean;

  /** 強いグロー効果 */
  glowStrong?: boolean;

  // ========================================
  // インタラクション
  // ========================================

  /** クリック可能なスタイル */
  clickable?: boolean;

  /** クリックハンドラ */
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;

  // ========================================
  // セマンティック
  // ========================================

  /** カラーバリアント */
  color?: ColorVariant;

  /** アクセシビリティラベル */
  'aria-label'?: string;

  /** アクセシビリティ非表示 */
  'aria-hidden'?: boolean;
}

/**
 * SVG Path レンダリング用 Props
 * currentColor を使用し、親要素の色を継承
 */
export interface IconPathProps {
  /** クラス名（セマンティッククラス用） */
  className?: string;
}
