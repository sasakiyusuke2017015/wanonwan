/**
 * デバイス検出フック
 * 画面幅に基づいてPC/スマホを判定
 */
import { useState, useEffect, useCallback } from 'react';

/** ブレークポイント定義 */
export const BREAKPOINTS = {
  /** スマホ: 0-767px */
  mobile: 768,
  /** タブレット: 768-1023px */
  tablet: 1024,
  /** PC: 1024px以上 */
  pc: 1024,
} as const;

/** デバイスタイプ */
export type DeviceType = 'mobile' | 'tablet' | 'pc';

/** useDevice の戻り値 */
export interface UseDeviceReturn {
  /** 現在のデバイスタイプ */
  deviceType: DeviceType;
  /** スマホかどうか */
  isMobile: boolean;
  /** タブレットかどうか */
  isTablet: boolean;
  /** PCかどうか */
  isPC: boolean;
  /** スマホまたはタブレットかどうか */
  isMobileOrTablet: boolean;
  /** 画面幅 */
  width: number;
}

/**
 * デバイスタイプを判定
 */
function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'pc';
}

/**
 * デバイス検出フック
 *
 * @example
 * ```tsx
 * const { isMobile, isPC } = useDevice();
 *
 * return isMobile ? <MobileView /> : <PCView />;
 * ```
 */
export function useDevice(): UseDeviceReturn {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.pc
  );

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    // 初期値を設定
    handleResize();

    // リサイズイベントをリッスン（デバウンス付き）
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  const deviceType = getDeviceType(width);

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isPC: deviceType === 'pc',
    isMobileOrTablet: deviceType === 'mobile' || deviceType === 'tablet',
    width,
  };
}

export default useDevice;
