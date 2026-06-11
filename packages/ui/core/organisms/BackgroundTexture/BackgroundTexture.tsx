/**
 * BackgroundTexture コンポーネント
 * アプリケーション全体の背景テクスチャを表示
 */
import { type BackgroundTheme, getBackgroundStyle } from '../../constants/design'

export interface BackgroundTextureProps {
  /** 背景テーマ */
  theme: BackgroundTheme;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 背景テクスチャコンポーネント
 *
 * @example
 * ```tsx
 * <BackgroundTexture theme="wood" />
 * <BackgroundTexture theme="fabric" />
 * ```
 */
export const BackgroundTexture = ({ theme, className = '' }: BackgroundTextureProps) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        ...getBackgroundStyle(theme),
        zIndex: -1,
      }}
      data-component="background-texture"
      data-theme={theme}
    />
  );
};

export { getBackgroundStyle };
