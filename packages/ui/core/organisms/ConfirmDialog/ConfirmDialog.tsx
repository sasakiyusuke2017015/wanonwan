// src/components/common/molecules/ConfirmDialog.tsx
/**
 * ConfirmDialogコンポーネント（後方互換ラッパー）
 * 新規実装ではDialogコンポーネントを直接使用してください
 *
 * @example
 * // 推奨: Dialogを直接使用
 * <Dialog variant="confirm" message="削除しますか？" onConfirm={handleConfirm} onCancel={handleCancel} />
 *
 * // 後方互換: ConfirmDialogも引き続き使用可能
 * <ConfirmDialog message="削除しますか？" onConfirm={handleConfirm} onCancel={handleCancel} />
 */
import { FC } from 'react';

import { Dialog, type DialogType } from '../Dialog/Dialog';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: Exclude<DialogType, 'success'>; // confirmではsuccessは使用しない
}

export const ConfirmDialog: FC<ConfirmDialogProps> = (props) => {
  return <Dialog variant="confirm" data-component="confirm-dialog" {...props} />;
};
