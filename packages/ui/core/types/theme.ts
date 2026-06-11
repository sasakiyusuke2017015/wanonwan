/**
 * テーマ関連の Props 型定義
 *
 * すべてのコンポーネントは、内部で useThemeConfig / useBackgroundConfig を使用せず、
 * これらの型を props として受け取る。
 */

/**
 * 基本的なテーマ Props
 * ほとんどのコンポーネントで使用される共通プロパティ
 */
export interface ThemeProps {
  /** borderRadius（角丸） */
  borderRadius?: string;
  /** 背景色 */
  bgColor?: string;
  /** テキスト色 */
  textColor?: string;
  /** ボーダー色 */
  borderColor?: string;
}

/**
 * Button 専用のテーマ Props
 */
export interface ButtonThemeProps {
  /** ボタンの角丸 */
  borderRadius?: string;
  /** プライマリ背景色 */
  primaryBgColor?: string;
  /** プライマリテキスト色 */
  primaryTextColor?: string;
  /** プライマリコントラストテキスト（背景上の文字） */
  primaryContrastText?: string;
  /** ホバー時の背景色 */
  hoverBgColor?: string;
}

/**
 * Badge 専用のテーマ Props
 */
export interface BadgeThemeProps {
  /** バッジの角丸 */
  borderRadius?: string;
  /** 背景色 */
  bgColor?: string;
  /** テキスト色 */
  textColor?: string;
}

/**
 * Input/TextArea 専用のテーマ Props
 */
export interface InputThemeProps {
  /** 入力欄の角丸 */
  borderRadius?: string;
  /** ボーダー色 */
  borderColor?: string;
  /** フォーカス時のボーダー色 */
  focusBorderColor?: string;
  /** フォーカスリング色 */
  focusRingColor?: string;
}

/**
 * Modal/Dialog 専用のテーマ Props
 */
export interface ModalThemeProps {
  /** モーダルの角丸 */
  borderRadius?: string;
  /** 背景色（オーバーレイ） */
  overlayBgColor?: string;
}

/**
 * Table 専用のテーマ Props
 */
export interface TableThemeProps {
  /** テーブルの角丸 */
  borderRadius?: string;
  /** ヘッダー背景色 */
  headerBgColor?: string;
  /** ヘッダーテキスト色 */
  headerTextColor?: string;
  /** セル角丸 */
  cellRadius?: string;
}

/**
 * Card 専用のテーマ Props
 */
export interface CardThemeProps {
  /** カードの角丸 */
  borderRadius?: string;
  /** カード背景色 */
  bgColor?: string;
  /** カードテキスト色 */
  textColor?: string;
  /** カードボーダー色 */
  borderColor?: string;
}
