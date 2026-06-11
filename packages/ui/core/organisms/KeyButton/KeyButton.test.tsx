import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyButton } from './KeyButton';

describe('KeyButton', () => {
  const mockAction = {
    label: 'テストボタン',
    state: 'active',
    onClick: vi.fn(),
  };

  it('KeyButtonがレンダリングされる', () => {
    render(<KeyButton id="test-btn" action={mockAction} currentState="active" />);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('現在の状態と一致する場合、ボタンが有効化される', () => {
    const { container } = render(
      <KeyButton id="test-btn" action={mockAction} currentState="active" />
    );
    const button = container.querySelector('button');
    expect(button).not.toBeDisabled();
  });

  it('現在の状態と一致しない場合、ボタンが無効化される', () => {
    const { container } = render(
      <KeyButton id="test-btn" action={mockAction} currentState="inactive" />
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('onClick イベントが発火する', async () => {
    const handleClick = vi.fn();
    const action = { ...mockAction, onClick: handleClick };
    const user = userEvent.setup();

    render(<KeyButton id="test-btn" action={action} currentState="active" />);

    const button = screen.getByText('テストボタン');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('action.state が配列の場合、いずれかの状態で有効化される', () => {
    const action = { label: 'マルチ', state: ['active', 'pending'], onClick: vi.fn() };
    const { container } = render(
      <KeyButton id="test-btn" action={action} currentState="pending" />
    );
    const button = container.querySelector('button');
    expect(button).not.toBeDisabled();
  });

  it('action が配列の場合、複数のラベルが "/" で結合される', () => {
    const actions = [
      { label: 'アクション1', state: 'active' },
      { label: 'アクション2', state: 'active' },
    ];
    render(<KeyButton id="test-btn" action={actions} currentState="active" />);
    expect(screen.getByText('アクション1 / アクション2')).toBeInTheDocument();
  });

  it('variant属性が設定できる', () => {
    const { rerender } = render(
      <KeyButton id="test-btn" action={mockAction} currentState="active" variant="primary" />
    );
    expect(screen.getByText('テストボタン')).toBeInTheDocument();

    rerender(
      <KeyButton id="test-btn" action={mockAction} currentState="active" variant="secondary" />
    );
    expect(screen.getByText('テストボタン')).toBeInTheDocument();

    rerender(
      <KeyButton id="test-btn" action={mockAction} currentState="active" variant="danger" />
    );
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  it('disabled属性が優先される', () => {
    const { container } = render(
      <KeyButton id="test-btn" action={mockAction} currentState="active" disabled />
    );
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('action が undefined の場合、空のラベルが表示される', () => {
    const { container } = render(<KeyButton id="test-btn" action={undefined} currentState="active" />);
    const button = container.querySelector('button');
    expect(button?.textContent).toBe('');
  });
});
