import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResponsiveContainer } from './ResponsiveContainer';

describe('ResponsiveContainer', () => {
  it('コンテナがレンダリングされる', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>テストコンテンツ</div>
      </ResponsiveContainer>
    );
    expect(container.querySelector('[data-component="responsive-container"]')).toBeInTheDocument();
  });

  it('子要素が表示される', () => {
    render(
      <ResponsiveContainer>
        <div>テストコンテンツ</div>
      </ResponsiveContainer>
    );
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('heightPercent属性が正しく適用される (デフォルト60vh)', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]') as HTMLDivElement;
    expect(containerDiv.style.height).toBe('60vh');
  });

  it('heightPercent属性が正しく適用される (カスタム80vh)', () => {
    const { container } = render(
      <ResponsiveContainer heightPercent={80}>
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]') as HTMLDivElement;
    expect(containerDiv.style.height).toBe('80vh');
  });

  it('overflow属性が正しく適用される', () => {
    const { container } = render(
      <ResponsiveContainer overflow="auto">
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]') as HTMLDivElement;
    expect(containerDiv.style.overflow).toBe('auto');
  });

  it('enableKeyboardNav=falseの場合、role属性が設定されない', () => {
    const { container } = render(
      <ResponsiveContainer enableKeyboardNav={false}>
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]');
    expect(containerDiv).not.toHaveAttribute('role');
    expect(containerDiv).not.toHaveAttribute('tabIndex');
  });

  it('enableKeyboardNav=trueの場合、role属性とtabIndexが設定される', () => {
    const { container } = render(
      <ResponsiveContainer enableKeyboardNav={true}>
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]');
    expect(containerDiv).toHaveAttribute('role', 'region');
    expect(containerDiv).toHaveAttribute('tabIndex', '0');
    expect(containerDiv).toHaveAttribute('aria-label', 'Responsive container');
  });

  it('カスタムtabIndexが設定される', () => {
    const { container } = render(
      <ResponsiveContainer enableKeyboardNav={true} tabIndex={5}>
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]');
    expect(containerDiv).toHaveAttribute('tabIndex', '5');
  });

  it('onKeyDownイベントが発火する', async () => {
    const handleKeyDown = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <ResponsiveContainer enableKeyboardNav={true} onKeyDown={handleKeyDown}>
        <div>テスト</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.querySelector('[data-component="responsive-container"]') as HTMLDivElement;
    containerDiv.focus();
    await user.keyboard('{Enter}');

    expect(handleKeyDown).toHaveBeenCalled();
  });

  it('showDebugInfo=trueの場合、デバッグ情報が表示される', () => {
    const { container } = render(
      <ResponsiveContainer heightPercent={70} showDebugInfo={true}>
        <div>テスト</div>
      </ResponsiveContainer>
    );

    const debugInfo = container.querySelector('div > div');
    expect(debugInfo?.textContent).toContain('70vh');
  });

  it('showDebugInfo=falseの場合、デバッグ情報が表示されない (デフォルト)', () => {
    const { container } = render(
      <ResponsiveContainer heightPercent={70}>
        <div>テスト</div>
      </ResponsiveContainer>
    );

    const text = container.textContent;
    expect(text).not.toContain('70vh');
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-container">
        <div>テスト</div>
      </ResponsiveContainer>
    );
    const containerDiv = container.querySelector('[data-component="responsive-container"]');
    expect(containerDiv).toHaveClass('custom-container');
  });
});
