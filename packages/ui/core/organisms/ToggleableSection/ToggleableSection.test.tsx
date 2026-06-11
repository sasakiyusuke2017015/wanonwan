import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleableSection } from './ToggleableSection';

describe('ToggleableSection', () => {
  it('タイトルが表示される', () => {
    render(
      <ToggleableSection title="セクション1" borderColor="#3b82f6">
        <p>内容</p>
      </ToggleableSection>
    );
    expect(screen.getByText('セクション1')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(
      <ToggleableSection title="テスト" borderColor="#3b82f6">
        <p>子要素の内容</p>
      </ToggleableSection>
    );
    expect(screen.getByText('子要素の内容')).toBeInTheDocument();
  });

  it('data-component属性が設定される', () => {
    const { container } = render(
      <ToggleableSection title="テスト" borderColor="#3b82f6">
        <p>内容</p>
      </ToggleableSection>
    );
    expect(container.querySelector('[data-component="toggleable-section"]')).toBeInTheDocument();
  });

  it('トグルボタンにaria-expanded属性が設定される', () => {
    render(
      <ToggleableSection title="テスト" borderColor="#3b82f6" defaultOpen={true}>
        <p>内容</p>
      </ToggleableSection>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
