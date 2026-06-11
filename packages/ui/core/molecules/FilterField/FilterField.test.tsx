import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterField } from './FilterField';

describe('FilterField', () => {
  describe('TextFilter', () => {
    it('ラベルが表示される', () => {
      render(
        <FilterField
          type="text"
          label="検索"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByText('検索')).toBeInTheDocument();
    });

    it('値が入力できる', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterField
          type="text"
          label="検索"
          value=""
          onChange={handleChange}
        />
      );

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

  describe('ScoreFilter', () => {
    it('範囲入力が表示される', () => {
      render(
        <FilterField
          type="score"
          label="スコア範囲"
          value={[1, 5]}
          onChange={() => {}}
        />
      );
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(2);
    });

    it('min/max値が設定される', () => {
      render(
        <FilterField
          type="score"
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
  });

  describe('DateFilter', () => {
    it('日付入力が表示される', () => {
      render(
        <FilterField
          type="date"
          label="日付"
          value=""
          onChange={() => {}}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('StatusFilter', () => {
    const options = [
      { value: 'active', label: 'アクティブ' },
      { value: 'inactive', label: '非アクティブ' },
    ];

    it('ドロップダウンボタンが表示される', () => {
      render(
        <FilterField
          type="status"
          label="ステータス"
          value={[]}
          onChange={() => {}}
          options={options}
        />
      );
      // ドロップダウンボタンがレンダリングされる
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('DateRangeFilter', () => {
    const options = [
      { value: 'today', label: '今日' },
      { value: 'week', label: '今週' },
    ];

    it('ドロップダウンボタンが表示される', () => {
      render(
        <FilterField
          type="dateRange"
          label="期間"
          value=""
          onChange={() => {}}
          options={options}
        />
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Common', () => {
    it('disabled状態が適用される', () => {
      render(
        <FilterField
          type="text"
          label="検索"
          value=""
          onChange={() => {}}
          disabled
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });
  });
});
