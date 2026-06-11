'use client'

import { FC } from 'react';

import { useOperationLog } from '../../../infra/devtools';
import { Button } from '../../molecules/Button';
import { Icon } from '../../atoms/Icon';


interface RefreshButtonProps {
  /** 更新コールバック */
  onRefresh: () => void;
  /** React Query の dataUpdatedAt（0 = 未取得） */
  dataUpdatedAt?: number;
  /** データ読み込み中 */
  loading?: boolean;
  /** リフレッシュ中（refetch実行中） */
  refreshing?: boolean;
}

/**
 * 更新ボタン + 最終更新時刻の共通コンポーネント
 *
 * - ボタン押下でデータをリフレッシュ
 * - refreshing中はアイコンが回転アニメーション
 * - dataUpdatedAt > 0 で時刻表示、0 or undefined は「...」表示
 */
export const RefreshButton: FC<RefreshButtonProps> = ({
  onRefresh,
  dataUpdatedAt,
  loading = false,
  refreshing = false,
}) => {
  const log = useOperationLog('RefreshButton');

  const handleRefresh = () => {
    log('click', { dataUpdatedAt });
    onRefresh();
  };

  return (
  <div className="flex items-center gap-1.5" data-component="refresh-button">
    <Button
      variant="ghost"
      size="small"
      onClick={handleRefresh}
      disabled={loading || refreshing}
      className="!p-1.5 !min-w-0 rounded-full"
      title="データを更新"
      enableShimmer={false}
    >
      <Icon
        name={'arrow-rotate'}
        size={16}
        animation={refreshing ? 'spin' : undefined}
        animate={refreshing}
      />
    </Button>
    <span className="text-fluid-xs text-gray-400">
      {dataUpdatedAt && dataUpdatedAt > 0
        ? new Date(dataUpdatedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        : '...'}
    </span>
  </div>
  );
};

