import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginButton } from './LoginButton';

describe('LoginButton', () => {
  it('子要素が表示される', () => {
    render(<LoginButton>ログイン</LoginButton>);
    expect(screen.getByText('ログイン')).toBeInTheDocument();
  });

  it('state=authenticatingの場合、loadingTextが表示される', () => {
    render(<LoginButton state="authenticating" loadingText="認証中...">ログイン</LoginButton>);
    expect(screen.getByText('認証中...')).toBeInTheDocument();
  });

  it('state=authenticatedの場合、「認証完了」が表示される', () => {
    render(<LoginButton state="authenticated">ログイン</LoginButton>);
    expect(screen.getByText('認証完了')).toBeInTheDocument();
  });

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<LoginButton onClick={handleClick}>ログイン</LoginButton>);
    await user.click(screen.getByText('ログイン'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
