import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { Animated } from './Animated';

describe('Animated', () => {
  it('表示状態で正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={true}>
        <div>テストコンテンツ</div>
      </Animated>
    );
    expect(getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('非表示状態で正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={false}>
        <div>テストコンテンツ</div>
      </Animated>
    );
    expect(getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('collapse タイプで正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={true} type="collapse">
        <div>Collapseコンテンツ</div>
      </Animated>
    );
    expect(getByText('Collapseコンテンツ')).toBeInTheDocument();
  });

  it('fade タイプで正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={true} type="fade">
        <div>Fadeコンテンツ</div>
      </Animated>
    );
    expect(getByText('Fadeコンテンツ')).toBeInTheDocument();
  });

  it('slide タイプで正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={true} type="slide" slideDirection="left">
        <div>Slideコンテンツ</div>
      </Animated>
    );
    expect(getByText('Slideコンテンツ')).toBeInTheDocument();
  });

  it('scale タイプで正しくレンダリングされる', () => {
    const { getByText } = render(
      <Animated show={true} type="scale">
        <div>Scaleコンテンツ</div>
      </Animated>
    );
    expect(getByText('Scaleコンテンツ')).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <Animated show={true} className="custom-class">
        <div>テストコンテンツ</div>
      </Animated>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });

  it('カスタム duration と delay が設定できる', () => {
    const { getByText } = render(
      <Animated show={true} duration={0.5} delay={0.2}>
        <div>カスタム設定</div>
      </Animated>
    );
    expect(getByText('カスタム設定')).toBeInTheDocument();
  });
});
