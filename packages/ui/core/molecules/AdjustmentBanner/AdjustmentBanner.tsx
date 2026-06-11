import { Banner } from '../Banner/Banner';

interface AdjustmentBannerProps {
  /** 説明文 */
  message: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 調整中機能を示すバナーコンポーネント
 */
export function AdjustmentBanner({ message, className }: AdjustmentBannerProps) {
  return (
    <div data-component="adjustment-banner">
      <Banner
        variant="info"
        title="調整中"
        message={message}
        className={className}
      />
    </div>
  );
}
