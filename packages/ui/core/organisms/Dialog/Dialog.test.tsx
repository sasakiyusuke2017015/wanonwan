import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Dialog/Dialog';

// Button コンポーネントはラベルを <span class="content"> で wrap し、
// ダイアログのオーバーレイ div も role="button" を持つため、
// 真の <button> 要素だけを対象に絞り込む。
const findActualButtons = (name: RegExp) =>
  screen
    .queryAllByRole('button', { name })
    .filter((el): el is HTMLButtonElement => el.tagName === 'BUTTON');

const getActualButton = (name: RegExp): HTMLButtonElement => {
  const matches = findActualButtons(name);
  if (matches.length === 0) {
    throw new Error(`No <button> matched ${name}`);
  }
  return matches[0];
};
const getActualButtonRequired = getActualButton;
const queryActualButton = (name: RegExp): HTMLButtonElement | null => {
  const matches = findActualButtons(name);
  return matches[0] ?? null;
};

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
    expect(getActualButton(/閉じる/)).toBeInTheDocument();
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

    await user.click(getActualButtonRequired(/閉じる/));
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

  // ============================================================
  // a11y 強化 (role="dialog" / aria-modal / aria-labelledby / FocusTrap)
  // ============================================================

  it('modal panel に role="dialog" + aria-modal="true" が付く', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テストメッセージ"
        variant="alert"
      />
    );
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('title あり時に aria-labelledby で title id を参照', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        title="削除しますか?"
        message="テストメッセージ"
        variant="alert"
      />
    );
    const dialog = document.body.querySelector('[role="dialog"]');
    const labelledById = dialog?.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const titleEl = document.body.querySelector(`#${labelledById}`);
    expect(titleEl).toHaveTextContent('削除しますか?');
  });

  it('message が aria-describedby で参照される', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="操作内容の説明"
        variant="alert"
      />
    );
    const dialog = document.body.querySelector('[role="dialog"]');
    const describedById = dialog?.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();
    const messageEl = document.body.querySelector(`#${describedById}`);
    expect(messageEl).toHaveTextContent('操作内容の説明');
  });

  it('backdrop から role="button" が削除されている (W3C 準拠)', () => {
    // 注: aria-hidden を backdrop に付けると配下の dialog/button も a11y tree から消える
    // ため付与しない。modal の外側隔離は focus trap で行う。
    render(
      <Dialog
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        variant="alert"
      />
    );
    const backdrop = document.body.querySelector('[data-component="dialog"]');
    expect(backdrop).not.toHaveAttribute('role', 'button');
  });
});
