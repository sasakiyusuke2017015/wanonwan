import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('外部リンクがレンダリングされる', () => {
    render(<ExternalLink href="https://example.com">テストリンク</ExternalLink>);
    expect(screen.getByText('テストリンク')).toBeInTheDocument();
  });

  it('href属性が正しく適用される', () => {
    const { container } = render(<ExternalLink href="https://example.com">テスト</ExternalLink>);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('target="_blank"が設定される', () => {
    const { container } = render(<ExternalLink href="https://example.com">テスト</ExternalLink>);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('rel="noopener noreferrer"が設定される', () => {
    const { container } = render(<ExternalLink href="https://example.com">テスト</ExternalLink>);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('variant属性が正しく適用される', () => {
    const { container, rerender } = render(
      <ExternalLink href="https://example.com" variant="default">テスト</ExternalLink>
    );
    expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument();

    rerender(<ExternalLink href="https://example.com" variant="primary">テスト</ExternalLink>);
    expect(container.querySelector('[data-variant="primary"]')).toBeInTheDocument();

    rerender(<ExternalLink href="https://example.com" variant="secondary">テスト</ExternalLink>);
    expect(container.querySelector('[data-variant="secondary"]')).toBeInTheDocument();
  });

  it('borderRadiusプロパティがstyle属性に適用される', () => {
    const { container } = render(
      <ExternalLink href="https://example.com" borderRadius="1rem">テスト</ExternalLink>
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('style')).toContain('border-radius: 1rem');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <ExternalLink href="https://example.com" className="custom-link">テスト</ExternalLink>
    );
    const link = container.querySelector('a');
    expect(link).toHaveClass('custom-link');
  });

  it('アイコンが表示される', () => {
    const { container } = render(<ExternalLink href="https://example.com">テスト</ExternalLink>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
