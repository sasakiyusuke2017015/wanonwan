import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal } from './Modal';

// createPortal で document.body 直下に描画されるため、container ではなく document.body から検索する
const queryModal = () => document.body.querySelector('[data-component="modal"]');
const queryModalPanel = () => document.body.querySelector('[data-component="modal"] > div');

describe('Modal', () => {
  it('isOpen=false の場合、モーダルが表示されない', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(queryModal()).not.toBeInTheDocument();
  });

  it('isOpen=true の場合、モーダルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(queryModal()).toBeInTheDocument();
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
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );

    // 閉じるボタン（Xアイコン）をクリック
    const closeButton = document.body.querySelector('button');
    expect(closeButton).toBeInTheDocument();
    await user.click(closeButton!);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('背景をクリックすると onClose が呼ばれる', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );

    const background = queryModal();
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
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="テスト"
        maxWidth="42rem"
      >
        <div>コンテンツ</div>
      </Modal>
    );

    // maxWidth は panel の inline style として適用される
    const panel = queryModalPanel();
    expect(panel).toHaveStyle({ maxWidth: '42rem' });
  });

  it.skip('maxHeight が適用される (TODO: 現コンポーネントは maxHeight prop を持たない)', () => {
    // 現 Modal は maxHeight prop を持たない。
    // 必要であればコンポーネント側に追加して有効化する。
  });

  it('borderRadius が適用される', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="テスト"
        borderRadius="1rem"
      >
        <div>コンテンツ</div>
      </Modal>
    );

    // borderRadius は panel の inline style として適用される
    const panel = queryModalPanel();
    expect(panel?.getAttribute('style')).toContain('border-radius');
  });

  it('data-component 属性が設定される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(queryModal()).toBeInTheDocument();
  });

  it('backdrop class (z-index 10000 を含む SCSS module class) が適用される', () => {
    // z-index は Modal.module.scss の .backdrop ルールに定義されている。
    // JSDOM は CSS を評価しないので toHaveStyle({ zIndex }) は使えない。
    // backdrop class が当たっていることで間接的に確認する。
    render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    const modal = queryModal();
    expect(modal?.className).toContain('backdrop');
  });

  // ============================================================
  // a11y 強化 (role="dialog" / aria-modal / aria-labelledby / FocusTrap)
  // ============================================================

  it('modal panel に role="dialog" + aria-modal="true" が付く', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('title が aria-labelledby で参照される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="編集モーダル">
        <div>コンテンツ</div>
      </Modal>
    );
    const dialog = document.body.querySelector('[role="dialog"]');
    const labelledById = dialog?.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    const titleEl = document.body.querySelector(`#${labelledById}`);
    expect(titleEl).toHaveTextContent('編集モーダル');
  });

  it('createPortal で document.body 直下に描画される', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    // container (testing-library が用意した div) の中には modal は無い
    expect(container.querySelector('[data-component="modal"]')).not.toBeInTheDocument();
    // document.body 直下に存在する
    expect(document.body.querySelector('[data-component="modal"]')).toBeInTheDocument();
  });

  it('isOpen=false の場合、FocusTrap は active にならず modal も描画されない', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="テスト">
        <div>コンテンツ</div>
      </Modal>
    );
    expect(document.body.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
