/**
 * TransferList コンポーネントの型定義
 */

export interface TransferListItem {
  /** アイテムのユニークキー */
  id: string;
  /** 表示名 */
  label: string;
  /** サブラベル（オプション） */
  subLabel?: string;
  /** 移動不可かどうか */
  disabled?: boolean;
  /** 無効化理由（disabled=true の場合に表示） */
  disabledReason?: string;
}

export interface TransferListProps<T extends TransferListItem = TransferListItem> {
  /** 左側のアイテム（有効/閲覧可能など） */
  leftItems: T[];
  /** 右側のアイテム（無効/閲覧不可など） */
  rightItems: T[];
  /** 左側のラベル */
  leftLabel: string;
  /** 右側のラベル */
  rightLabel: string;
  /** 左→右ボタンのラベル */
  toRightLabel?: string;
  /** 右→左ボタンのラベル */
  toLeftLabel?: string;
  /** 左側のアイコン（オプション） */
  leftIcon?: React.ReactNode;
  /** 右側のアイコン（オプション） */
  rightIcon?: React.ReactNode;
  /** 変更時のコールバック */
  onChange: (leftItems: T[], rightItems: T[]) => void;
  /** ローディング状態 */
  loading?: boolean;
  /** リストの最小高さ */
  minHeight?: string;
}
