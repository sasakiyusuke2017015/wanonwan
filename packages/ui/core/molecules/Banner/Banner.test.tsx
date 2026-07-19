import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Banner } from './Banner';

describe('Banner', () => {
  it('メッセージを表示する', () => {
    render(<Banner variant="info" message="テストメッセージ" />);
    expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
  });

  it('タイトルが指定された場合は表示する', () => {
    render(<Banner variant="info" title="情報" message="詳細メッセージ" />);
    expect(screen.getByText('情報')).toBeInTheDocument();
    expect(screen.getByText('詳細メッセージ')).toBeInTheDocument();
  });

  it('タイトルが指定されない場合はメッセージのみ表示する', () => {
    render(<Banner variant="info" message="メッセージのみ" />);
    expect(screen.getByText('メッセージのみ')).toBeInTheDocument();
  });

  it('variantがinfoの場合、対応する variant class を適用する', () => {
    const { container } = render(
      <Banner variant="info" message="情報メッセージ" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('banner', 'banner--info');
  });

  it('variantがwarningの場合、対応する variant class を適用する', () => {
    const { container } = render(
      <Banner variant="warning" message="警告メッセージ" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('banner', 'banner--warning');
  });

  it('variantがsuccessの場合、対応する variant class を適用する', () => {
    const { container } = render(
      <Banner variant="success" message="成功メッセージ" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('banner', 'banner--success');
  });

  it('variantがerrorの場合、対応する variant class を適用する', () => {
    const { container } = render(
      <Banner variant="error" message="エラーメッセージ" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('banner', 'banner--error');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <Banner variant="info" message="テスト" className="custom-class" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('custom-class');
  });

  it('基本的なスタイルクラスが常に適用される', () => {
    const { container } = render(
      <Banner variant="info" message="テスト" />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner).toHaveClass('banner');
  });

  it('data-component属性が設定される', () => {
    const { container } = render(
      <Banner variant="info" message="テスト" />
    );
    const banner = container.querySelector('[data-component="Banner"]');
    expect(banner).toBeInTheDocument();
  });

  it('data-variant属性が正しく設定される', () => {
    const { container } = render(
      <Banner variant="warning" message="テスト" />
    );
    const banner = container.querySelector('[data-component="Banner"]');
    expect(banner).toHaveAttribute('data-variant', 'warning');
  });

  it('デフォルトでアイコンが表示される', () => {
    const { container } = render(
      <Banner variant="error" message="エラー" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('showIcon={false}でアイコンが非表示になる', () => {
    const { container } = render(
      <Banner variant="error" message="エラー" showIcon={false} />
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('ReactNodeをメッセージとして渡せる', () => {
    render(
      <Banner
        variant="info"
        message={<span data-testid="custom-message">カスタムメッセージ</span>}
      />
    );
    expect(screen.getByTestId('custom-message')).toBeInTheDocument();
  });
});
