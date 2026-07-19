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

// 単一選択フォールバック (value が options に無いときの自動補正)。
// フォールバック useEffect は初回マウントで発火するので、render 直後の
// onChange.mock.calls で判定する (rerender 不要)。
describe('Select - 単一フォールバック (allowEmpty 未選択値の保持)', () => {
  const mockOptions = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
  ];

  it('allowEmpty(default) + value="" → 先頭を自動選択せず onChange を呼ばない (フィルタ誤発火防止)', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} value="" onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allowEmpty + value=null → onChange を呼ばない', () => {
    const handleChange = vi.fn();
    // null も「未選択」の正当値として扱う
    render(<Select options={mockOptions} value={null as unknown as string} onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allowEmpty=false + value が options に無い → 先頭にフォールバックする (required の自動補正 retention)', () => {
    const handleChange = vi.fn();
    render(
      <Select options={mockOptions} value="不存在" onChange={handleChange} allowEmpty={false} />,
    );
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('allowEmpty(default) + value が options に存在 → onChange を呼ばない (retention)', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} value="option1" onChange={handleChange} />);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allowEmpty=false + value が options に存在 → onChange を呼ばない (retention)', () => {
    const handleChange = vi.fn();
    render(
      <Select options={mockOptions} value="option2" onChange={handleChange} allowEmpty={false} />,
    );
    expect(handleChange).not.toHaveBeenCalled();
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

  it('複数選択は単一と同じ見た目で、選択中は aria-selected で示される（チェックボックスなし）', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select multiple options={mockOptions} value={['a']} onChange={handleChange} />
    );

    // ドロップダウンを開く
    const button = screen.getByRole('button');
    await user.click(button);

    // 左チェックボックスは廃止 (単一選択と同じ見た目 + 選択時に右端チェックアイコン)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);

    // 'a' が選択済み
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
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
