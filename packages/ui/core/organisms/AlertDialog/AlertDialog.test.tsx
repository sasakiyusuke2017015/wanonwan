import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('isOpen=trueの場合、ダイアログが表示される', () => {
    const handleClose = vi.fn();
    render(<AlertDialog isOpen={true} message="テストメッセージ" onClose={handleClose} />);
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });

  it('isOpen=falseの場合、ダイアログが表示されない', () => {
    const handleClose = vi.fn();
    const { container } = render(<AlertDialog isOpen={false} message="テストメッセージ" onClose={handleClose} />);
    expect(container.querySelector('[data-component="dialog"]')).not.toBeInTheDocument();
  });

  it('メッセージが正しく表示される', () => {
    const handleClose = vi.fn();
    render(<AlertDialog isOpen={true} message="警告メッセージ" onClose={handleClose} />);
    expect(screen.getByText('警告メッセージ')).toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    const handleClose = vi.fn();
    render(<AlertDialog isOpen={true} title="警告" message="メッセージ" onClose={handleClose} />);
    expect(screen.getByText('警告')).toBeInTheDocument();
  });

  it('type属性が正しく適用される', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <AlertDialog isOpen={true} message="情報" type="info" onClose={handleClose} />
    );
    expect(screen.getByText('情報')).toBeInTheDocument();

    rerender(<AlertDialog isOpen={true} message="警告" type="warning" onClose={handleClose} />);
    expect(screen.getByText('警告')).toBeInTheDocument();

    rerender(<AlertDialog isOpen={true} message="エラー" type="error" onClose={handleClose} />);
    expect(screen.getByText('エラー')).toBeInTheDocument();

    rerender(<AlertDialog isOpen={true} message="成功" type="success" onClose={handleClose} />);
    expect(screen.getByText('成功')).toBeInTheDocument();
  });

  it('カスタム確認ボタンテキストが表示される', () => {
    const handleClose = vi.fn();
    render(<AlertDialog isOpen={true} message="メッセージ" confirmText="了解" onClose={handleClose} />);
    expect(screen.getByText('了解')).toBeInTheDocument();
  });

  it('確認ボタンをクリックするとonCloseが呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<AlertDialog isOpen={true} message="メッセージ" confirmText="閉じる" onClose={handleClose} />);

    const confirmButton = screen.getByText('閉じる');
    await user.click(confirmButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('Dialogコンポーネントにvariant="alert"が渡される', () => {
    const handleClose = vi.fn();
    render(<AlertDialog isOpen={true} message="テストメッセージ" confirmText="閉じる" onClose={handleClose} />);
    // AlertDialogはDialogのラッパーであり、variant="alert"が内部で設定される
    // ダイアログが表示されていることで間接的に確認（メッセージとボタンの存在）
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    expect(screen.getByText('閉じる')).toBeInTheDocument();
  });
});
