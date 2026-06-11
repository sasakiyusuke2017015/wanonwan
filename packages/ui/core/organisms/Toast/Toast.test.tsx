import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast', () => {
  it('isOpen=falseの場合、トーストは表示されない', () => {
    render(
      <Toast isOpen={false} onClose={() => {}} message="テストメッセージ" />
    );
    expect(screen.queryByText('テストメッセージ')).not.toBeInTheDocument();
  });

  it('isOpen=trueの場合、トーストが表示される', () => {
    render(
      <Toast isOpen={true} onClose={() => {}} message="テストメッセージ" />
    );
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Toast isOpen={true} onClose={handleClose} message="テスト" duration={0} />
    );

    const closeButton = screen.getByLabelText('閉じる');
    await user.click(closeButton);

    // アニメーション後にonCloseが呼ばれる（300ms後）
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(handleClose).toHaveBeenCalled();
  });

  it('data-component属性が設定される', () => {
    render(
      <Toast isOpen={true} onClose={() => {}} message="テスト" />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toast = document.body.querySelector('[data-component="toast"]');
    expect(toast).toBeInTheDocument();
  });

  it('data-type属性が正しく設定される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        type="success"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toast = document.body.querySelector('[data-component="toast"]');
    expect(toast).toHaveAttribute('data-type', 'success');
  });

  it('data-position属性が正しく設定される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        position="bottom-right"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toast = document.body.querySelector('[data-component="toast"]');
    expect(toast).toHaveAttribute('data-position', 'bottom-right');
  });

  it('position=top-rightの場合、正しいクラスが適用される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        position="top-right"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toast = document.body.querySelector('.fixed');
    expect(toast?.className).toContain('top-4');
    expect(toast?.className).toContain('right-4');
  });

  it('typeがinfoの場合、青色の背景が適用される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        type="info"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toastContent = document.body.querySelector('.bg-blue-500');
    expect(toastContent).toBeInTheDocument();
  });

  it('typeがwarningの場合、黄色の背景が適用される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        type="warning"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toastContent = document.body.querySelector('.bg-yellow-500');
    expect(toastContent).toBeInTheDocument();
  });

  it('typeがerrorの場合、赤色の背景が適用される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        type="error"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toastContent = document.body.querySelector('.bg-red-500');
    expect(toastContent).toBeInTheDocument();
  });

  it('typeがsuccessの場合、緑色の背景が適用される', () => {
    render(
      <Toast
        isOpen={true}
        onClose={() => {}}
        message="テスト"
        type="success"
      />
    );
    // createPortalでdocument.bodyに追加されるため、document.bodyから検索
    const toastContent = document.body.querySelector('.bg-green-500');
    expect(toastContent).toBeInTheDocument();
  });
});
