import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FloatingMenuButton } from './FloatingMenuButton';

describe('FloatingMenuButton', () => {
  it('閉じた状態でaria-labelが「メニューを開く」になる', () => {
    render(<FloatingMenuButton isOpen={false} onToggle={() => {}} />);
    expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
  });

  it('開いた状態でaria-labelが「メニューを閉じる」になる', () => {
    render(<FloatingMenuButton isOpen={true} onToggle={() => {}} />);
    expect(screen.getByLabelText('メニューを閉じる')).toBeInTheDocument();
  });

  it('クリック時にonToggleが呼ばれる', async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();
    render(<FloatingMenuButton isOpen={false} onToggle={handleToggle} />);
    await user.click(screen.getByLabelText('メニューを開く'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('data-component属性が設定される', () => {
    const { container } = render(<FloatingMenuButton isOpen={false} onToggle={() => {}} />);
    expect(container.querySelector('[data-component="floating-menu-button"]')).toBeInTheDocument();
  });
});
