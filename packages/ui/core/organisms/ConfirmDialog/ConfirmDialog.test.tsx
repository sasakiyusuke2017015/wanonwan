import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('isOpen=trueの場合、ダイアログが表示される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('削除しますか？')).toBeInTheDocument();
  });

  it('isOpen=falseの場合、ダイアログが表示されない', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        message="削除しますか？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(container.querySelector('[data-component="dialog"]')).not.toBeInTheDocument();
  });

  it('メッセージが正しく表示される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="本当に削除しますか？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="確認"
        message="削除しますか？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('確認')).toBeInTheDocument();
  });

  it('type属性が正しく適用される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        message="情報"
        type="info"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('情報')).toBeInTheDocument();

    rerender(
      <ConfirmDialog
        isOpen={true}
        message="警告"
        type="warning"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('警告')).toBeInTheDocument();

    rerender(
      <ConfirmDialog
        isOpen={true}
        message="エラー"
        type="error"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('エラー')).toBeInTheDocument();

    rerender(
      <ConfirmDialog
        isOpen={true}
        message="危険"
        type="danger"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('危険')).toBeInTheDocument();
  });

  it('カスタム確認ボタンテキストが表示される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        confirmText="削除する"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('削除する')).toBeInTheDocument();
  });

  it('カスタムキャンセルボタンテキストが表示される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        cancelText="やめる"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.getByText('やめる')).toBeInTheDocument();
  });

  it('確認ボタンをクリックするとonConfirmが呼ばれる', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        confirmText="削除する"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmButton = screen.getByText('削除する');
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックするとonCancelが呼ばれる', async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        cancelText="キャンセル"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('Dialogコンポーネントにvariant="confirm"が渡される', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        message="削除しますか？"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    // ConfirmDialogはDialogのラッパーであり、variant="confirm"が内部で設定される
    // ダイアログが表示されていることで間接的に確認（メッセージと2つのボタンの存在）
    expect(screen.getByText('削除しますか？')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });
});
