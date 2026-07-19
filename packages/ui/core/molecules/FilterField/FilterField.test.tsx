import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterField } from './FilterField';

describe('FilterField', () => {
  describe('text', () => {
    it('ラベルが表示され、入力と関連付く (htmlFor/id)', () => {
      render(<FilterField type="text" label="検索" value="" onChange={() => {}} />);
      expect(screen.getByLabelText('検索')).toBeInTheDocument();
    });

    it('値が入力できる', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<FilterField type="text" label="検索" value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('プレースホルダーが表示される', () => {
      render(
        <FilterField
          type="text"
          label="検索"
          value=""
          onChange={() => {}}
          placeholder="キーワードを入力"
        />
      );
      expect(screen.getByPlaceholderText('キーワードを入力')).toBeInTheDocument();
    });
  });

  describe('numberRange', () => {
    it('範囲入力 (min/max の 2 スピン) が表示される', () => {
      render(
        <FilterField type="numberRange" label="スコア範囲" value={[1, 5]} onChange={() => {}} />
      );
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });

    it('min/max 属性が両方の入力に設定される', () => {
      render(
        <FilterField
          type="numberRange"
          label="スコア"
          value={[2, 4]}
          onChange={() => {}}
          min={1}
          max={5}
        />
      );
      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('min', '1');
        expect(input).toHaveAttribute('max', '5');
      });
    });

    it('min 入力が max を超えたら max を追従させて onChange する', async () => {
      const handleChange = vi.fn();
      render(
        <FilterField
          type="numberRange"
          label="スコア"
          value={[1, 3]}
          onChange={handleChange}
          min={0}
          max={10}
        />
      );
      const [minInput] = screen.getAllByRole('spinbutton');
      await userEvent.clear(minInput);
      await userEvent.type(minInput, '5');
      const last = handleChange.mock.calls.at(-1)?.[0] as [number, number];
      expect(last[0]).toBeLessThanOrEqual(last[1]);
    });
  });

  describe('date', () => {
    it('日付入力が表示され、ラベルと関連付く', () => {
      render(<FilterField type="date" label="日付" value="" onChange={() => {}} />);
      expect(screen.getByLabelText('日付')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('multiSelect', () => {
    const options = [
      { value: 'active', label: 'アクティブ' },
      { value: 'inactive', label: '非アクティブ' },
    ];

    it('ドロップダウンボタンが表示され、ラベルと関連付く', () => {
      render(
        <FilterField
          type="multiSelect"
          label="ステータス"
          value={[]}
          onChange={() => {}}
          options={options}
        />
      );
      expect(screen.getByLabelText('ステータス')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('選択肢を選ぶと onChange に選択値配列が渡る', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(
        <FilterField
          type="multiSelect"
          label="ステータス"
          value={[]}
          onChange={handleChange}
          options={options}
        />
      );
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('アクティブ'));
      expect(handleChange).toHaveBeenCalledWith(['active']);
    });
  });

  describe('select (単一選択)', () => {
    const options = [
      { value: 'today', label: '今日' },
      { value: 'week', label: '今週' },
    ];

    it('ドロップダウンボタンが表示され、ラベルと関連付く', () => {
      render(
        <FilterField
          type="select"
          label="期間"
          value=""
          onChange={() => {}}
          options={options}
        />
      );
      expect(screen.getByLabelText('期間')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('選択肢を選ぶと onChange に値が渡る', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(
        <FilterField
          type="select"
          label="期間"
          value=""
          onChange={handleChange}
          options={options}
        />
      );
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('今週'));
      expect(handleChange).toHaveBeenCalledWith('week');
    });
  });

  describe('Common', () => {
    it('disabled 状態が適用される', () => {
      render(<FilterField type="text" label="検索" value="" onChange={() => {}} disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });
});
