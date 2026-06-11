'use client'

// src/components/organisms/LoadingZone.tsx
// 汎用ローディングゾーンコンポーネント
import { FC, useState, useEffect, useRef } from 'react';

import { Icon } from '../../atoms/Icon';
import type { LoadingPreset } from '../../atoms/Icon/types';
import { type ColorTheme } from '../../constants';
import { cn } from '../../utils/cn';

export type LoadingZoneName =
  | 'table'
  | 'card'
  | 'list'
  | 'simple'
  | 'overlay'
  | 'inline';

interface LoadingZoneProps {
  variant: LoadingZoneName;
  loading?: boolean;
  children?: React.ReactNode;
  height?: string;
  message?: string;
  className?: string;
  /** ローディングプリセット */
  preset?: LoadingPreset;
  size?: number;
  color?: string;
  fill?: string;
  /** カラーテーマ（未指定時はグローバルテーマを使用） - 現在は未使用 */
  colorTheme?: ColorTheme;
  /** 最低表示時間(ms) - ローディングが短すぎるフラッシュを防止 */
  minDisplayTime?: number;
  /** アクセントテキスト色 - Layout から props で渡す */
  accentTextColor?: string;
  /** プライマリ背景色 - Layout から props で渡す */
  primaryBgColor?: string;
}

export const LoadingZone: FC<LoadingZoneProps> = ({
  variant,
  loading,
  children,
  height = '100px',
  message = 'データを読み込み中...',
  className = '',
  preset,
  size = 32,
  color,
  fill,
  minDisplayTime = 500,
  accentTextColor = '#3b82f6', // デフォルト値（blue-500）
  primaryBgColor = '#3b82f6', // デフォルト値（blue-500）
}) => {
  // colorが指定されていない場合はpropsから渡された色を使用
  const iconColor = color || accentTextColor;

  // 最低表示時間の制御
  const [showLoading, setShowLoading] = useState(loading);
  const loadingStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      // ローディング開始
      setShowLoading(true);
      loadingStartTimeRef.current = Date.now();
    } else if (loadingStartTimeRef.current !== null) {
      // ローディング終了 - 最低表示時間をチェック
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remaining = minDisplayTime - elapsed;

      if (remaining > 0) {
        // 最低表示時間に満たない場合は待機
        const timer = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        // 最低表示時間を超えている場合は即座に非表示
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    } else {
      // 初回レンダリング時
      setShowLoading(false);
    }
  }, [loading, minDisplayTime]);

  // loading propが指定されている場合は、children を条件付きで表示
  if (loading !== undefined) {
    if (showLoading) {
      // ローディング中は LoadingZone を表示
      return renderLoadingZone();
    } else {
      // ローディング完了時は children を表示
      return <>{children}</>;
    }
  }

  // 従来の動作(loading propが未指定の場合)
  return renderLoadingZone();

  function renderLoadingZone() {
    switch (variant) {
      case 'table':
        return (
          <div
            className={`relative flex flex-col overflow-hidden bg-white shadow-lg ${className}`}
            style={{
              height,
              minHeight: height,
              maxHeight: height,
            }}
            data-component="loading-zone"
            data-variant={variant}
          >
            {/* ヘッダー部分(テーブルヘッダーの代替) */}
            <div
              className="text-white"
              style={{ backgroundColor: primaryBgColor }}
            >
              <div className="border-b border-white/20 p-3">
                <div className="h-6 animate-pulse rounded bg-white/20"></div>
              </div>
            </div>

            {/* ローディングコンテンツ部分 */}
            <div className="flex flex-1 items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <p className="text-fluid-lg font-medium text-gray-600">{message}</p>

                {/* アニメーション付きの点々(上下バウンス・タイミングずらし) */}
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:200ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:400ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                </div>

                {/* ダミーテーブル行のスケルトン（シマーエフェクト付き） */}
                <div className="mt-8 space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-center space-x-3"
                    >
                      {[...Array(6)].map((_, cellIndex) => (
                        <div
                          key={cellIndex}
                          className="relative h-5 overflow-hidden rounded-md bg-gray-200/70"
                          style={{
                            width: `${70 + Math.random() * 50}px`,
                          }}
                        >
                          {/* シマーエフェクト */}
                          <div
                            className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            style={{
                              animationDelay: `${(index * 6 + cellIndex) * 100}ms`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* フッター部分(余白調整用) */}
            <div className="h-4 border-t border-gray-200 bg-white"></div>
          </div>
        );

      case 'card':
        return (
          <div
            className={`relative flex flex-col overflow-hidden bg-white p-6 shadow-lg ${className}`}
            style={{
              height,
              minHeight: height,
            }}
            data-component="loading-zone"
            data-variant={variant}
          >
            {/* ローディングコンテンツ部分 */}
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="text-center">
                <p className="text-fluid-lg font-medium text-gray-600">{message}</p>

                {/* アニメーション付きの点々(上下バウンス・タイミングずらし) */}
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:200ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full [animation-delay:400ms]"
                    style={{ backgroundColor: primaryBgColor }}
                  ></div>
                </div>
              </div>

              {/* ダミーカードのスケルトン */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200/50 bg-gray-50 p-4 shadow-sm"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* アバター */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300/60"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300/60"></div>
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200/60"></div>
                      </div>
                    </div>
                    {/* コンテンツ行 */}
                    <div className="space-y-2">
                      <div className="h-3 animate-pulse rounded bg-gray-200/60"></div>
                      <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200/60"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div
            className={`overflow-hidden rounded-lg bg-white shadow ${className}`}
            style={{ height }}
            data-component="loading-zone"
            data-variant={variant}
          >
            <div className="border-b p-4">
              <div className="h-5 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 text-center">
              <div className="flex justify-center">
                <Icon
                  preset={preset}
                  size={size}
                  style={{ color: iconColor }}
                  fill={fill}
                  animate
                />
              </div>
            </div>
          </div>
        );

      case 'simple':
        return (
          <div
            className={`flex items-center justify-center ${className}`}
            style={{ height }}
            data-component="loading-zone"
            data-variant={variant}
          >
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Icon
                  preset={preset}
                  size={size}
                  style={{ color: iconColor }}
                  fill={fill}
                  animate
                />
              </div>
              <p className="text-gray-500">{message}</p>
            </div>
          </div>
        );

      case 'overlay':
        return (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
            data-component="loading-zone"
            data-variant={variant}
          >
            <div className="rounded-lg bg-white p-8 text-center shadow-xl">
              <div className="mb-4 flex justify-center">
                <Icon
                  preset={preset}
                  size={size}
                  style={{ color: iconColor }}
                  fill={fill}
                  animate
                />
              </div>
              <p className="text-gray-700">{message}</p>
            </div>
          </div>
        );

      case 'inline':
        return (
          <div className={cn("flex items-center space-x-3", className)} data-component="loading-zone" data-variant={variant}>
            <div className="flex-shrink-0">
              <Icon
                preset={preset}
                size={size}
                style={{ color: iconColor }}
                fill={fill}
                animate
              />
            </div>
            <span className="text-gray-600">{message}</span>
          </div>
        );

      default:
        return null;
    }
  }
};

