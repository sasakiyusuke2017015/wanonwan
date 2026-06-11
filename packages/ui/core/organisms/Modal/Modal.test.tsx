import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal } from './Modal';

describe('Modal', () => {
  it('isOpen=false の場合、モーダルが表示されない', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(container.querySelector('[data-component="modal"]')).not.toBeInTheDocument();
  });

  it('isOpen=true の場合、モーダルが表示される', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(container.querySelector('[data-component="modal"]')).toBeInTheDocument();
  });

  it('title が表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="モーダルタイトル">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(screen.getByText('モーダルタイトル')).toBeInTheDocument();
  });

  it('children が表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div data-testid="modal-content">モーダルの中身</div>
      </Modal>
    );
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('モーダルの中身')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックすると onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );

    // 閉じるボタン（Xアイコン）をクリック
    const closeButton = container.querySelector('button');
    expect(closeButton).toBeInTheDocument();
    await user.click(closeButton!);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('背景をクリックすると onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );

    const background = container.querySelector('[data-component="modal"]');
    expect(background).toBeInTheDocument();
    await user.click(background!);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('モーダルコンテンツをクリックしても onClose が呼ばれない', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div data-testid="modal-content">コンテンツ</div>
      </Modal>
    );

    const content = screen.getByTestId('modal-content');
    await user.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Escape キーを押すと onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('maxWidth が適用される', () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="テスト"
        maxWidth="max-w-4xl"
      >
        <div>コンテンツ</div>
      </Modal>
    );

    const modalContent = container.querySelector('.max-w-4xl');
    expect(modalContent).toBeInTheDocument();
  });

  it('maxHeight が適用される', () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="テスト"
        maxHeight="max-h-[90vh]"
      >
        <div>コンテンツ</div>
      </Modal>
    );

    const modalContent = container.querySelector('.max-h-\\[90vh\\]');
    expect(modalContent).toBeInTheDocument();
  });

  it('borderRadius が適用される', () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="テスト"
        borderRadius="1rem"
      >
        <div>コンテンツ</div>
      </Modal>
    );

    // モーダルコンテンツ（白い部分）を探す - bg-white を持つ div
    const modalContent = container.querySelector('.bg-white');
    expect(modalContent).toBeInTheDocument();
    // インラインスタイルで borderRadius が設定されていることを確認
    expect(modalContent?.getAttribute('style')).toContain('border-radius');
  });

  it('data-component 属性が設定される', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(container.querySelector('[data-component="modal"]')).toBeInTheDocument();
  });

  it('z-index が 10000 に設定される', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    const modal = container.querySelector('[data-component="modal"]');
    expect(modal).toHaveStyle({ zIndex: '10000' });
  });
});
