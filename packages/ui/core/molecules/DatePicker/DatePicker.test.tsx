import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DatePicker } from './DatePicker';

/** data-component="date-picker" セレクタ */
const PICKER_SELECTOR = '[data-component="date-picker"]';

describe('DatePicker', () => {
  it('DatePickerがレンダリングされる', () => {
    const { container } = render(<DatePicker />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();
  });

  it('value属性が正しく表示される', () => {
    const { container } = render(<DatePicker pickerMode="date" value="2024-01-15" />);
    const display = container.querySelector('.font-mono');
    expect(display).toBeInTheDocument();
    expect(display!.textContent).toBe('2024年01月15日');
  });

  it('onChange プロパティが設定できる', () => {
    const { container } = render(<DatePicker onChange={() => {}} />);
    // DatePickerは複雑なカレンダーUIを持つため、onChangeが設定可能であることを確認
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();
  });

  it('pickerMode="date" でレンダリングされる (デフォルト)', () => {
    const { container } = render(<DatePicker pickerMode="date" />);
    const picker = container.querySelector(PICKER_SELECTOR);
    expect(picker).toBeInTheDocument();
    expect(picker!.getAttribute('data-picker-mode')).toBe('date');
  });

  it('pickerMode="month" でレンダリングされる', () => {
    const { container } = render(<DatePicker pickerMode="month" />);
    const picker = container.querySelector(PICKER_SELECTOR);
    expect(picker).toBeInTheDocument();
    expect(picker!.getAttribute('data-picker-mode')).toBe('month');
  });

  it('variant属性が設定できる', () => {
    const { rerender, container } = render(<DatePicker variant="default" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();

    rerender(<DatePicker variant="dark" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();

    rerender(<DatePicker variant="outlined" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();
  });

  it('size属性が設定できる', () => {
    const { rerender, container } = render(<DatePicker size="small" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();

    rerender(<DatePicker size="medium" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();

    rerender(<DatePicker size="large" />);
    expect(container.querySelector(PICKER_SELECTOR)).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<DatePicker className="custom-datepicker" />);
    expect(container.querySelector(PICKER_SELECTOR)).toHaveClass('custom-datepicker');
  });
});
