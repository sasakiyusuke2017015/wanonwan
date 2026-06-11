'use client'

import React, { useState, useCallback } from 'react';

// サポートされるメディアタイプの配列をソース・オブ・トゥルースとして定義
const SUPPORTED_MEDIA_TYPES = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif', 'bmp'] as const;

// MediaType型を配列から自動導出
export type MediaType = typeof SUPPORTED_MEDIA_TYPES[number];

export interface MediaProps {
  src: string;
  alt: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  rounded?: boolean;
  circle?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  loading?: 'lazy' | 'eager';
}

export const Media: React.FC<MediaProps> = ({
  src,
  alt,
  size,
  width,
  height,
  className = '',
  objectFit = 'contain',
  rounded = false,
  circle = false,
  fallbackSrc,
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 画像サイズの決定
  const imageWidth = width || size;
  const imageHeight = height || size;

  // 画像タイプの判別
  const getMediaType = (source: string): MediaType | null => {
    const extension = source.split('.').pop()?.toLowerCase();
    return SUPPORTED_MEDIA_TYPES.includes(extension as MediaType) ? extension as MediaType : null;
  };

  // エラーハンドリング
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(event.nativeEvent);
    }
  }, [onError]);

  // ロード完了ハンドリング
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // スタイルクラスの生成
  const getClassName = () => {
    const classes = [className];
    
    if (rounded) classes.push('rounded-lg');
    if (circle) classes.push('rounded-full');
    
    classes.push('transition-opacity duration-200');
    
    return classes.filter(Boolean).join(' ');
  };

  // エラー時のフォールバック表示
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${getClassName()}`}
        style={{ 
          width: imageWidth, 
          height: imageHeight,
          minWidth: imageWidth || 'auto',
          minHeight: imageHeight || 'auto'
        }}
      >
        <svg 
          className="w-6 h-6 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const mediaType = getMediaType(currentSrc);

  return (
    <div className="relative inline-block" data-component="media">
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-100 animate-pulse ${getClassName()}`}
          style={{ 
            width: imageWidth, 
            height: imageHeight 
          }}
        />
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${getClassName()} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          objectFit,
          width: imageWidth,
          height: imageHeight
        }}
        data-media-type={mediaType}
      />
    </div>
  );
};