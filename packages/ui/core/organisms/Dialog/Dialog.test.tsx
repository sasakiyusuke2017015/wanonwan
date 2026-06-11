import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Dialog/Dialog';
import {
  getActualButton,
  getActualButtonRequired,
  queryActualButton,
} from '../../__tests__/helpers';

describe('Dialog', () => {
  it('isOpen=falseの場合、ダイアログは表示されない', () => {
    render(
      <Dialog
        isOpen={false}
        onClose={() => {}}
        message="テストメッセージ"
        variant="alert"
      />
    );
    expect(screen.queryByText('テストメッセージ')).not.toBeInTheDocument();
  });

  it('isOpen=trueの場合、ダイアログが表示される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テストメッセージ"
        variant="alert"
      />
    );
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        title="確認"
        message="削除しますか？"
        variant="alert"
      />
    );
    expect(screen.getByText('確認')).toBeInTheDocument();
  });

  it('alertバリアントの場合、OKボタンのみ表示される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        variant="alert"
      />
    );
    expect(getActualButton(/OK/i)).toBeInTheDocument();
    expect(queryActualButton(/キャンセル/i)).not.toBeInTheDocument();
  });

  it('confirmバリアントの場合、確定とキャンセルボタンが表示される', () => {
    render(
      <Dialog
        isOpen={true}
        onConfirm={() => {}}
        onCancel={() => {}}
        message="削除しますか？"
        variant="confirm"
      />
    );
    expect(getActualButton(/確定/i)).toBeInTheDocument();
    expect(getActualButton(/キャンセル/i)).toBeInTheDocument();
  });

  it('alertバリアントでOKボタンをクリックするとonCloseが呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog
        isOpen={true}
        onClose={handleClose}
        message="テスト"
        variant="alert"
      />
    );

    await user.click(getActualButtonRequired(/OK/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('confirmバリアントで確定ボタンをクリックするとonConfirmが呼ばれる', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={() => {}}
        message="テスト"
        variant="confirm"
      />
    );

    await user.click(getActualButtonRequired(/確定/i));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmバリアントでキャンセルボタンをクリックするとonCancelが呼ばれる', async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog
        isOpen={true}
        onConfirm={() => {}}
        onCancel={handleCancel}
        message="テスト"
        variant="confirm"
      />
    );

    await user.click(getActualButtonRequired(/キャンセル/i));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        variant="alert"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const dialog = document.body.querySelector('[data-component="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  it('data-variant属性が正しく設定される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        variant="alert"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const dialog = document.body.querySelector('[data-component="dialog"]');
    expect(dialog).toHaveAttribute('data-variant', 'alert');
  });

  it('data-type属性が正しく設定される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        variant="alert"
        type="warning"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const dialog = document.body.querySelector('[data-component="dialog"]');
    expect(dialog).toHaveAttribute('data-type', 'warning');
  });
});
