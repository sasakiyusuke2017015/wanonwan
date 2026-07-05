import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { marked } from 'marked';
import { MarkdownPreview } from './MarkdownPreview';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MarkdownPreview', () => {
  it('通常の Markdown（見出し・リスト・テーブル）を HTML 化して表示する', () => {
    const source = [
      '# 見出し',
      '',
      '- 項目1',
      '- 項目2',
      '',
      '| A | B |',
      '| - | - |',
      '| 1 | 2 |',
    ].join('\n');
    const { container } = render(<MarkdownPreview source={source} />);
    expect(container.querySelector('h1')?.textContent).toBe('見出し');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('<script> タグを除去する', () => {
    const { container } = render(
      <MarkdownPreview source={'before\n\n<script>window.__xss = 1</script>\n\nafter'} />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('before');
    expect(container.textContent).toContain('after');
  });

  it('on* イベントハンドラ属性を除去する', () => {
    const { container } = render(
      <MarkdownPreview source={'<img src="x" onerror="window.__xss = 1">'} />,
    );
    const img = container.querySelector('img');
    // img 要素自体は許可されるが、onerror は落ちる
    expect(img?.getAttribute('onerror')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('javascript: スキームの link を無害化する', () => {
    const { container } = render(
      <MarkdownPreview source={'<a href="javascript:alert(1)">click</a>'} />,
    );
    const a = container.querySelector('a');
    expect(a?.getAttribute('href') ?? '').not.toContain('javascript:');
  });

  it('parse 失敗時のフォールバック HTML もサニタイズされる', () => {
    // エラーメッセージに入力由来の危険な HTML が混ざるケースを再現する。
    vi.spyOn(marked, 'parse').mockImplementation(() => {
      throw new Error('<img src="x" onerror="window.__xss = 1"> parse failed');
    });
    const { container } = render(<MarkdownPreview source={'anything'} />);
    expect(container.textContent).toContain('プレビューエラー');
    expect(container.innerHTML).not.toContain('onerror');
    expect(container.querySelector('script')).toBeNull();
  });
});
