import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';



import { ContentBlock } from './ContentBlock';

describe('ContentBlock', () => {
  it('基本的なレンダリングができる', () => {
    const { container } = render(
      <ContentBlock>
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(container.querySelector('[data-component="content-block"]')).toBeInTheDocument();
  });

  it('children が表示される', () => {
    render(
      <ContentBlock>
        <div data-testid="child">子要素</div>
      </ContentBlock>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('子要素')).toBeInTheDocument();
  });

  it('title が表示される', () => {
    render(
      <ContentBlock title="タイトル">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(screen.getByText('タイトル')).toBeInTheDocument();
  });

  it('title が ReactNode の場合も表示される', () => {
    render(
      <ContentBlock title={<span data-testid="custom-title">カスタムタイトル</span>}>
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });

  it('titleColor が適用される', () => {
    const { container } = render(
      <ContentBlock title="タイトル" titleColor="text-blue-600">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    const title = container.querySelector('h3');
    expect(title).toHaveClass('text-blue-600');
  });

  it('titleAlign が適用される', () => {
    const { container } = render(
      <ContentBlock title="タイトル" titleAlign="center">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    const title = container.querySelector('h3');
    expect(title).toHaveClass('text-center');
  });

  it('iconType="icon" の場合、アイコンが表示される', () => {
    const { container } = render(
      <ContentBlock iconType="icon" iconName={'person'}>
        <div>コンテンツ</div>
      </ContentBlock>
    );
    // Icon コンポーネントは svg 要素
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('iconType="media" の場合、メディアが表示される', () => {
    const { container } = render(
      <ContentBlock iconType="media" logoSrc="/test.png" logoAlt="テストロゴ">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    // Media コンポーネントは img 要素
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('iconType="none" の場合、アイコンが表示されない', () => {
    const { container } = render(
      <ContentBlock iconType="none">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('loading=true の場合、LoadingZone が表示される', () => {
    render(
      <ContentBlock loading={true}>
        <div>コンテンツ</div>
      </ContentBlock>
    );
    // LoadingZone が表示され、コンテンツは非表示
    expect(screen.queryByText('コンテンツ')).not.toBeInTheDocument();
  });

  it('variant="card" が data-variant 属性に設定される', () => {
    const { container } = render(
      <ContentBlock variant="card">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(container.querySelector('[data-variant="card"]')).toBeInTheDocument();
  });

  it('variant="section" が data-variant 属性に設定される', () => {
    const { container } = render(
      <ContentBlock variant="section">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(container.querySelector('[data-variant="section"]')).toBeInTheDocument();
  });

  it('id が適用される', () => {
    const { container } = render(
      <ContentBlock id="test-block">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    expect(container.querySelector('#test-block')).toBeInTheDocument();
  });

  it('className が適用される', () => {
    const { container } = render(
      <ContentBlock className="custom-class">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    const block = container.querySelector('[data-component="content-block"]');
    expect(block).toHaveClass('custom-class');
  });

  it('cardRadius が適用される', () => {
    const { container } = render(
      <ContentBlock cardRadius="1rem">
        <div>コンテンツ</div>
      </ContentBlock>
    );
    const block = container.querySelector('[data-component="content-block"]');
    // インラインスタイルで borderRadius が設定されていることを確認
    expect(block?.getAttribute('style')).toContain('border-radius');
  });
});
