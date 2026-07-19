import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';



import { TitledBlock } from './TitledBlock';

describe('TitledBlock', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(
      <TitledBlock>
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(container.querySelector('[data-component="titled-block"]')).toBeInTheDocument();
  });

  it('children が表示される', () => {
    render(
      <TitledBlock>
        <div data-testid="child">子要素</div>
      </TitledBlock>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('子要素')).toBeInTheDocument();
  });

  it('title が表示される', () => {
    render(
      <TitledBlock title="タイトル">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(screen.getByText('タイトル')).toBeInTheDocument();
  });

  it('title が ReactNode の場合も表示される', () => {
    render(
      <TitledBlock title={<span data-testid="custom-title">カスタムタイトル</span>}>
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });

  it('titleColor が適用される', () => {
    const { container } = render(
      <TitledBlock title="タイトル" titleColor="text-blue-600">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    const title = container.querySelector('h3');
    expect(title).toHaveClass('text-blue-600');
  });

  it('titleAlign が適用される', () => {
    const { container } = render(
      <TitledBlock title="タイトル" titleAlign="center">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    const title = container.querySelector('h3');
    expect(title).toHaveClass('text-center');
  });

  it('iconType="icon" の場合、アイコンが表示される', () => {
    const { container } = render(
      <TitledBlock iconType="icon" iconName={'person'}>
        <div>コンテンツ</div>
      </TitledBlock>
    );
    // Icon コンポーネントは svg 要素
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('iconType="media" の場合、メディアが表示される', () => {
    const { container } = render(
      <TitledBlock iconType="media" logoSrc="/test.png" logoAlt="テストロゴ">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    // Media コンポーネントは img 要素
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('iconType="none" の場合、アイコンが表示されない', () => {
    const { container } = render(
      <TitledBlock iconType="none">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('loading=true の場合、LoadingZone が表示される', () => {
    render(
      <TitledBlock loading={true}>
        <div>コンテンツ</div>
      </TitledBlock>
    );
    // LoadingZone が表示され、コンテンツは非表示
    expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
  });

  it('variant="card" が data-variant 属性に設定される', () => {
    const { container } = render(
      <TitledBlock variant="card">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(container.querySelector('[data-variant="card"]')).toBeInTheDocument();
  });

  it('variant="section" が data-variant 属性に設定される', () => {
    const { container } = render(
      <TitledBlock variant="section">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(container.querySelector('[data-variant="section"]')).toBeInTheDocument();
  });

  it('id が適用される', () => {
    const { container } = render(
      <TitledBlock id="test-block">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    expect(container.querySelector('#test-block')).toBeInTheDocument();
  });

  it('className が適用される', () => {
    const { container } = render(
      <TitledBlock className="custom-class">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    const block = container.querySelector('[data-component="titled-block"]');
    expect(block).toHaveClass('custom-class');
  });

  it('cardRadius が適用される', () => {
    const { container } = render(
      <TitledBlock cardRadius="1rem">
        <div>コンテンツ</div>
      </TitledBlock>
    );
    const block = container.querySelector('[data-component="titled-block"]');
    // インラインスタイルで borderRadius が設定されていることを確認
    expect(block?.getAttribute('style')).toContain('border-radius');
  });
});
