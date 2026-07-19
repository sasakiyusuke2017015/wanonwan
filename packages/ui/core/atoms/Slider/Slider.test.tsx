import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  it('現在の値が正しく表示される', () => {
    render(<Slider value={50} onChange={() => {}} label="音量" />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Slider value={30} onChange={() => {}} label="明るさ" />);
    expect(screen.getByText('明るさ')).toBeInTheDocument();
  });

  it('ラベルがない場合はラベル領域が表示されない', () => {
    const { container } = render(<Slider value={50} onChange={() => {}} />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('minとmaxプロパティが input 要素に適用される', () => {
    render(<Slider value={50} onChange={() => {}} min={10} max={90} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('min', '10');
    expect(input).toHaveAttribute('max', '90');
  });

  it('stepプロパティが input 要素に適用される', () => {
    render(<Slider value={50} onChange={() => {}} step={5} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('step', '5');
  });

  it('disabled状態が input 要素に適用される', () => {
    render(<Slider value={50} onChange={() => {}} disabled />);
    const input = screen.getByRole('slider');
    expect(input).toBeDisabled();
  });

  it('値変更時にonChangeが呼ばれる', () => {
    const handleChange = vi.fn();

    render(<Slider value={50} onChange={handleChange} />);
    const input = screen.getByRole('slider');

    fireEvent.change(input, { target: { value: '60' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('formatValue関数でカスタムフォーマットが適用される', () => {
    render(
      <Slider
        value={75}
        onChange={() => {}}
        label="進捗"
        formatValue={(v) => `${v}%`}
      />
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('デフォルトのmin, max, stepが適用される', () => {
    render(<Slider value={50} onChange={() => {}} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '1');
  });

  it('トラックの塗りを value の割合で gradient 描画する (ブラウザ任せにしない)', () => {
    render(<Slider value={30} onChange={() => {}} />);
    const input = screen.getByRole('slider');
    expect(input.style.background).toContain('linear-gradient');
    expect(input.style.background).toContain('30%');
  });

  it('min/max が 0-100 以外でも塗り割合を正しく計算する', () => {
    // value 30 in [10, 90] → (30-10)/(90-10) = 25%
    render(<Slider value={30} onChange={() => {}} min={10} max={90} />);
    const input = screen.getByRole('slider');
    expect(input.style.background).toContain('25%');
  });

  it('color prop が塗りとつまみ (accentColor) に反映される', () => {
    render(<Slider value={50} onChange={() => {}} color="#f59e0b" />);
    const input = screen.getByRole('slider');
    // jsdom は hex を rgb() に正規化する
    expect(input.style.background).toContain('rgb(245, 158, 11)');
    expect(input.style.accentColor).toBe('rgb(245, 158, 11)');
  });

  it('color 省略時は既定の #3b82f6 (blue-500) を使う', () => {
    render(<Slider value={50} onChange={() => {}} />);
    const input = screen.getByRole('slider');
    expect(input.style.accentColor).toBe('rgb(59, 130, 246)');
  });
});
