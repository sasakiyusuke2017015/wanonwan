// src/components/common/molecules/AlertDialog.tsx
/**
 * AlertDialogコンポーネント（後方互換ラッパー）
 * 新規実装ではDialogコンポーネントを直接使用してください
 *
 * @example
 * // 推奨: Dialogを直接使用
 * <Dialog variant="alert" message="保存しました" onClose={handleClose} />
 *
 * // 後方互換: AlertDialogも引き続き使用可能
 * <AlertDialog message="保存しました" onClose={handleClose} />
 */
import { FC } from 'react';

import { Dialog, type DialogType } from '../Dialog/Dialog';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: Exclude<DialogType, 'danger'>; // alertではdangerは使用しない
  confirmText?: string;
}

export const AlertDialog: FC<AlertDialogProps> = (props) => {
  return <Dialog variant="alert" data-component="alert-dialog" {...props} />;
};
