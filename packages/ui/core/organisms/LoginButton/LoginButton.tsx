'use client'

import { ReactNode, useEffect, useRef } from 'react';

import { ShimmerButton } from '../ShimmerButton';
import { Icon } from '../../atoms/Icon';
import { debugRender, debugAction, debugStateChange } from '../../utils/debug';


export type LoginButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning';
export type LoginButtonSize = 'sm' | 'md' | 'lg';

// ログインボタンの状態を明確に定義
export type LoginButtonState =
  | 'ready'
  | 'authenticating'
  | 'authenticated'
  | 'logout';

export interface LoginButtonStateConfig {
  ready: {
    disabled: boolean;
    showShimmer: boolean;
    variant?: LoginButtonVariant;
  };
  authenticating: {
    disabled: boolean;
    showShimmer: boolean;
    variant?: LoginButtonVariant;
  };
  authenticated: {
    disabled: boolean;
    showShimmer: boolean;
    variant?: LoginButtonVariant;
  };
  logout: {
    disabled: boolean;
    showShimmer: boolean;
    variant?: LoginButtonVariant;
  };
}

interface LoginButtonProps {
  // 基本プロパティ
  children?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;

  // スタイル設定
  variant?: LoginButtonVariant;
  size?: LoginButtonSize;
  fullWidth?: boolean;

  // 新しい状態管理システム
  state?: LoginButtonState;

  // レガシー互換性(既存コードとの互換性のため)
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  successState?: boolean;
}

export const LoginButton = ({
  children,
  className = '',
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,

  // 新しい状態管理システム
  state = 'ready',

  // レガシー互換性(既存コードとの互換性のため)
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  successState = false,
}: LoginButtonProps) => {
  // 前回の状態を保持（状態変化検出用）
  const prevStateRef = useRef(state);

  // マウント時のログ
  useEffect(() => {
    debugRender('LoginButton', { state, variant, size, disabled, loading });
  }, []);

  // 状態変化のログ
  useEffect(() => {
    if (prevStateRef.current !== state) {
      debugStateChange('LoginButton', 'state', prevStateRef.current, state);
      prevStateRef.current = state;
    }
  }, [state]);

  // 状態別設定を取得
  const getStateSettings = () => {
    switch (state) {
      case 'authenticating':
        return {
          disabled: true,
          showShimmer: false,
          variant: undefined, // グレー
        };
      case 'authenticated':
        return {
          disabled: true,
          showShimmer: false,
          variant: undefined, // グレー
        };
      case 'logout':
        return {
          disabled: true,
          showShimmer: false,
          variant: 'danger' as LoginButtonVariant,
        };
      default: // ready
        return {
          disabled: false,
          showShimmer: false,
          variant: 'success' as LoginButtonVariant, // 緑
        };
    }
  };


  // サイズ別アイコンサイズを取得
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'; // 16px
      case 'lg':
        return 'h-7 w-7'; // 28px
      default: // md
        return 'h-6 w-6'; // 24px
    }
  };

  // 状態別レンダリング関数
  const renderReadyState = () => {
    return (
      <div className="relative flex items-center justify-center px-12">
        {/* 左アイコン - 固定位置 */}
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Icon name={'lock'} className={getIconSize()} />
        </div>

        {/* 中央テキスト */}
        <span>{children}</span>
      </div>
    );
  };

  const renderAuthenticatingState = () => {
    return (
      <div className="relative flex items-center justify-center px-12">
        {/* 左アイコン - 固定位置 */}
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Icon name={'lock'} className={getIconSize()} />
        </div>

        {/* 中央テキスト */}
        <span>{loadingText}</span>

        {/* 右アイコン - 固定位置 */}
        <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Icon preset="interview" className={getIconSize()} />
        </div>
      </div>
    );
  };

  const renderAuthenticatedState = () => {
    return (
      <div className="relative flex items-center justify-center px-12">
        {/* 左アイコン - 固定位置(アニメーション付き) */}
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Icon
            name={'unlock'}
            className={getIconSize()}
            animation="pop"
          />
        </div>

        {/* 中央テキスト */}
        <span>認証完了</span>
      </div>
    );
  };

  // 表示内容を決定(破壊的再構築版)
  const getContent = () => {
    // 新しい状態システム優先
    if (state === 'authenticating' || loading) {
      return renderAuthenticatingState();
    }

    if (state === 'authenticated' || successState) {
      return renderAuthenticatedState();
    }

    // デフォルト(ready状態)
    return renderReadyState();
  };

  // 最終的な状態を決定(破壊的再構築版)
  const stateSettings = getStateSettings();
  const finalDisabled = state ? stateSettings.disabled : disabled || loading;
  const authenticatedClass =
    state === 'authenticated' ? 'login-button-authenticated' : '';

  // 状態に応じたvariantを決定(状態のvariantが優先、次にpropsのvariant)
  const finalVariant = stateSettings.variant || variant;

  // サイズに応じたスタイル（8pxグリッドシステム）
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-6 py-3 text-sm font-semibold'; // 変更なし
      case 'lg':
        return 'px-10 py-5 text-xl font-bold'; // text-lg → text-xl (20px)
      default: // md
        return 'px-8 py-4 text-lg font-bold'; // text-base → text-lg (18px)
    }
  };

  // 状態に応じたシマー設定
  const getShimmerSettings = () => {
    // 現在の実効state（レガシー互換含む）
    const effectiveState = loading ? 'authenticating' : successState ? 'authenticated' : state;

    switch (effectiveState) {
      case 'authenticating':
        return {
          shimmerColor: '#fbbf24', // 黄色
          shimmerDuration: '1s',   // 速い
          shimmerSize: '0.12em',   // 大きめ
        };
      case 'authenticated':
        return {
          shimmerColor: '#34d399', // 緑
          shimmerDuration: '0.6s', // 一瞬フラッシュ
          shimmerSize: '0.15em',   // 大きめ
        };
      case 'logout':
        return {
          shimmerColor: '#f87171', // 赤
          shimmerDuration: '3s',   // ゆっくり
          shimmerSize: '0.06em',   // 小さめ
        };
      default: // ready
        return {
          shimmerColor: '#ffffff', // 白
          shimmerDuration: '2.5s', // ゆっくり
          shimmerSize: '0.08em',   // 標準
        };
    }
  };

  // 状態に応じたアニメーションクラス
  const getAnimationClass = () => {
    const effectiveState = loading ? 'authenticating' : successState ? 'authenticated' : state;

    switch (effectiveState) {
      case 'authenticating':
        return 'animate-pulse'; // パルス
      case 'authenticated':
        return 'animate-bounce-once'; // バウンス1回
      case 'logout':
        return 'opacity-90'; // やや透過
      default:
        return '';
    }
  };

  // バリアントに応じた背景色
  const getBackgroundColor = () => {
    const effectiveState = loading ? 'authenticating' : successState ? 'authenticated' : state;

    // 状態別の背景色
    switch (effectiveState) {
      case 'authenticating':
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'; // グレー（処理中）
      case 'authenticated':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // 緑（成功）
      case 'logout':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'; // 赤（警告）
      default: // ready
        // variantに従う
        switch (finalVariant) {
          case 'success':
            return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
          case 'danger':
            return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
          case 'primary':
            return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
          case 'secondary':
            return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
          case 'warning':
            return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
          default:
            return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        }
    }
  };

  const shimmerSettings = getShimmerSettings();
  const animationClass = getAnimationClass();

  // クリックハンドラー（ログ付き）
  const handleClick = () => {
    debugAction('LoginButton', 'click', { state, disabled: finalDisabled });
    onClick?.();
  };

  return (
    <ShimmerButton
      type={type}
      disabled={finalDisabled}
      onClick={handleClick}
      background={getBackgroundColor()}
      shimmerColor={shimmerSettings.shimmerColor}
      shimmerSize={shimmerSettings.shimmerSize}
      shimmerDuration={shimmerSettings.shimmerDuration}
      borderRadius="12px"
      data-component="login-button"
      className={`${getSizeStyles()} ${fullWidth ? 'w-full' : ''} ${animationClass} ${authenticatedClass} ${className}`}
    >
      {getContent()}
    </ShimmerButton>
  );
};

