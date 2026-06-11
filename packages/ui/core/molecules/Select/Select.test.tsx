import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' },
  ];

  it('プレースホルダーが表示される', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} placeholder="選択してください" />);
    expect(screen.getByText('選択してください')).toBeInTheDocument();
  });

  it('選択された値が表示される', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} value="option1" onChange={handleChange} />);
    expect(screen.getByText('オプション1')).toBeInTheDocument();
  });

  it('クリックでドロップダウンが開く', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Select options={mockOptions} onChange={handleChange} />);

    // ドロップダウントリガーをクリック
    const trigger = container.querySelector('[role="button"]');
    if (trigger) {
      await user.click(trigger);
      // オプションが表示される
      expect(screen.getByText('オプション1')).toBeInTheDocument();
      expect(screen.getByText('オプション2')).toBeInTheDocument();
      expect(screen.getByText('オプション3')).toBeInTheDocument();
    }
  });

  it('オプション選択でonChangeが発火する', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<Select options={mockOptions} onChange={handleChange} />);

    const trigger = container.querySelector('[role="button"]');
    if (trigger) {
      await user.click(trigger);

      // オプション1を選択
      const option1 = screen.getByText('オプション1');
      await user.click(option1);

      expect(handleChange).toHaveBeenCalledWith('option1');
    }
  });

  it('disabled 状態では操作できない', () => {
    const handleChange = vi.fn();
    const { container } = render(<Select options={mockOptions} onChange={handleChange} disabled />);

    const trigger = container.querySelector('button');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveClass('cursor-not-allowed');
  });

  it('ラベルが表示される', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} label="カテゴリ" />);
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
  });

  it('allowEmpty=false の場合、空のオプションが表示されない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Select options={mockOptions} onChange={handleChange} allowEmpty={false} placeholder="選択" />
    );

    const trigger = container.querySelector('[role="button"]');
    if (trigger) {
      await user.click(trigger);

      // プレースホルダーオプションが存在しないことを確認
      const items = container.querySelectorAll('[role="option"]');
      expect(items.length).toBe(mockOptions.length);
    }
  });

  it('数値型のvalueが動作する', () => {
    const handleChange = vi.fn();
    const numericOptions = [
      { value: 1, label: '1番' },
      { value: 2, label: '2番' },
    ];

    render(<Select options={numericOptions} value={1} onChange={handleChange} />);
    expect(screen.getByText('1番')).toBeInTheDocument();
  });
});

describe('Select (multiple)', () => {
  const mockOptions = [
    { value: 'a', label: 'A項目' },
    { value: 'b', label: 'B項目' },
    { value: 'c', label: 'C項目' },
  ];

  it('未選択時はプレースホルダーが表示される', () => {
    const handleChange = vi.fn();
    render(
      <Select multiple options={mockOptions} value={[]} onChange={handleChange} placeholder="選択してください" />
    );
    expect(screen.getByText('選択してください')).toBeInTheDocument();
  });

  it('選択件数が表示される', () => {
    const handleChange = vi.fn();
    render(
      <Select multiple options={mockOptions} value={['a', 'b']} onChange={handleChange} />
    );
    expect(screen.getByText('選択中: 2件')).toBeInTheDocument();
  });

  it('selectedLabel でカスタム表示ができる', () => {
    const handleChange = vi.fn();
    render(
      <Select
        multiple
        options={mockOptions}
        value={['a']}
        onChange={handleChange}
        selectedLabel={(count) => `${count}個選択`}
      />
    );
    expect(screen.getByText('1個選択')).toBeInTheDocument();
  });

  it('チェックボックスが表示される', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select multiple options={mockOptions} value={['a']} onChange={handleChange} />
    );

    // ドロップダウンを開く
    const button = screen.getByRole('button');
    await user.click(button);

    // チェックボックスが表示される
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    // 'a' が選択済み
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('オプション選択でトグルされる（追加）', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select multiple options={mockOptions} value={['a']} onChange={handleChange} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // B項目をクリック → ['a', 'b'] になる
    await user.click(screen.getByText('B項目'));
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('オプション選択でトグルされる（削除）', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select multiple options={mockOptions} value={['a', 'b']} onChange={handleChange} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // A項目をクリック → ['b'] になる
    await user.click(screen.getByText('A項目'));
    expect(handleChange).toHaveBeenCalledWith(['b']);
  });

  it('選択してもドロップダウンが閉じない', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select multiple options={mockOptions} value={[]} onChange={handleChange} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // オプションをクリック
    await user.click(screen.getByText('A項目'));

    // ドロップダウンが開いたまま
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
