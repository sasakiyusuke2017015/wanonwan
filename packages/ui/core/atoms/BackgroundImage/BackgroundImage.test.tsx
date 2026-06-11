import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundImage } from './BackgroundImage';

describe('BackgroundImage', () => {
  it('背景画像がレンダリングされる', () => {
    const { container } = render(<BackgroundImage src="/test-image.jpg" />);
    expect(container.querySelector('[data-component="background-image"]')).toBeInTheDocument();
  });

  it('背景画像のsrc属性が正しく適用される', () => {
    const { container } = render(<BackgroundImage src="/test-image.jpg" />);
    const bgDiv = container.querySelector('[data-component="background-image"] > div') as HTMLDivElement;
    expect(bgDiv.style.backgroundImage).toContain('test-image.jpg');
  });

  it('背景画像のposition属性が正しく適用される', () => {
    const { container } = render(<BackgroundImage src="/test.jpg" position="top center" />);
    const bgDiv = container.querySelector('[data-component="background-image"] > div') as HTMLDivElement;
    // CSSはbackgroundPositionを"center top"の順序で返す場合がある
    expect(bgDiv.style.backgroundPosition).toContain('center');
    expect(bgDiv.style.backgroundPosition).toContain('top');
  });

  it('背景画像のsize属性が正しく適用される', () => {
    const { container } = render(<BackgroundImage src="/test.jpg" size="contain" />);
    const bgDiv = container.querySelector('[data-component="background-image"] > div') as HTMLDivElement;
    expect(bgDiv.style.backgroundSize).toBe('contain');
  });

  it('背景画像のrepeat属性が正しく適用される', () => {
    const { container } = render(<BackgroundImage src="/test.jpg" repeat="repeat" />);
    const bgDiv = container.querySelector('[data-component="background-image"] > div') as HTMLDivElement;
    expect(bgDiv.style.backgroundRepeat).toBe('repeat');
  });

  it('showFloatingElements=falseの場合、フローティング要素が表示されない', () => {
    const { container } = render(<BackgroundImage src="/test.jpg" showFloatingElements={false} />);
    const floatingElements = container.querySelectorAll('.animate-pulse');
    expect(floatingElements.length).toBe(0);
  });

  it('showFloatingElements=trueの場合、デフォルトで5つのフローティング要素が表示される', () => {
    const { container } = render(<BackgroundImage src="/test.jpg" showFloatingElements={true} />);
    const floatingElements = container.querySelectorAll('.animate-pulse');
    expect(floatingElements.length).toBe(5);
  });

  it('カスタムフローティング要素が設定できる', () => {
    const customElements = [
      {
        position: 'top-0 left-0',
        size: 'w-32 h-32',
        gradient: 'from-red-500 to-blue-500',
        blur: 'blur-lg',
      },
    ];
    const { container } = render(
      <BackgroundImage src="/test.jpg" showFloatingElements={true} floatingElements={customElements} />
    );
    const floatingElements = container.querySelectorAll('.animate-pulse');
    expect(floatingElements.length).toBe(1);
  });

  it('フローティング要素にanimationDelayが適用される', () => {
    const customElements = [
      {
        position: 'top-0 left-0',
        size: 'w-32 h-32',
        gradient: 'from-red-500 to-blue-500',
        blur: 'blur-lg',
        animationDelay: '2s',
      },
    ];
    const { container } = render(
      <BackgroundImage src="/test.jpg" showFloatingElements={true} floatingElements={customElements} />
    );
    const floatingElement = container.querySelector('.animate-pulse') as HTMLDivElement;
    expect(floatingElement.style.animationDelay).toBe('2s');
  });
});
