import { Banner } from '../Banner/Banner';

interface DevelopmentBannerProps {
  /** 説明文 */
  message: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 開発中機能を示すバナーコンポーネント
 */
export function DevelopmentBanner({ message, className }: DevelopmentBannerProps) {
  return (
    <div data-component="development-banner">
      <Banner
        variant="warning"
        title="開発中"
        message={message}
        className={className}
      />
    </div>
  );
}
