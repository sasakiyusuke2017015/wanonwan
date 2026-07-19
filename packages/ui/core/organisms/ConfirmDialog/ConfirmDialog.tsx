/**
 * ConfirmDialog — 確認ダイアログの正準 API (Dialog variant="confirm" の公開面)。
 * 定型メッセージ + 確定/キャンセルの確認はこれを使う。
 * 自由コンテンツの枠が必要なときは Modal を使う (棲み分けは Dialog.tsx の doc 参照)。
 *
 * @example
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
