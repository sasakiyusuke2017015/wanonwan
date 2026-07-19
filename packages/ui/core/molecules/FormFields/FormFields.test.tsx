import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ColorField } from './ColorField'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { TextField } from './TextField'
import { TextareaField } from './TextareaField'
import { ToggleChipsField } from './ToggleChipsField'
import { UnitNumberField } from './UnitNumberField'
import { UnitNumberInput } from './UnitNumberInput'

describe('TextField', () => {
  it('ラベルと必須バッジを描画し、入力で文字列値を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TextField label="会社名" required value="" onChange={onChange} />)

    expect(screen.getByText('会社名')).toBeInTheDocument()
    expect(screen.getByText('必須')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), 'A')
    expect(onChange).toHaveBeenLastCalledWith('A')
  })

  it('error を role=alert で表示し、input を aria-invalid にする', () => {
    render(<TextField label="会社名" required error="必須です" value="" onChange={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('必須です')
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('error が無いとき role=alert は無い（collapse で空 alert を残さない）', () => {
    render(<TextField label="会社名" value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('onBlur が blur で呼ばれる（その場検証フック）', async () => {
    const onBlur = vi.fn()
    const user = userEvent.setup()
    render(<TextField label="氏名" value="" onChange={vi.fn()} onBlur={onBlur} />)
    await user.click(screen.getByRole('textbox'))
    await user.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  it('type を渡せる（email 等）', () => {
    render(<TextField label="メール" type="email" value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })
})

describe('NumberField', () => {
  it('type=number で入力し、文字列値を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<NumberField label="表示順" value="" onChange={onChange} />)

    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
    await user.type(input, '5')
    expect(onChange).toHaveBeenLastCalledWith('5')
  })
})

describe('SelectField', () => {
  it('ラベルとプレースホルダを描画し、選択肢を開ける', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SelectField
        label="会社"
        required
        value={undefined}
        onChange={onChange}
        options={[
          { value: 1, label: '会社A' },
          { value: 2, label: '会社B' },
        ]}
      />,
    )
    expect(screen.getByText('会社')).toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('会社A')).toBeInTheDocument()
    await user.click(screen.getByText('会社B'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('error があるとき Select の button に aria-describedby / aria-invalid が付く', () => {
    render(
      <SelectField
        label="会社"
        required
        error="会社を選択してください"
        value={undefined}
        onChange={vi.fn()}
        options={[{ value: 1, label: '会社A' }]}
      />,
    )
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-invalid')).toBe('true')
    const alert = screen.getByRole('alert')
    expect(button.getAttribute('aria-describedby')).toContain(alert.id)
  })
})

describe('ColorField', () => {
  it('hex 入力で文字列値を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorField label="色" value="" onChange={onChange} />)
    const hex = screen.getByPlaceholderText('#3B82F6')
    await user.type(hex, '#')
    expect(onChange).toHaveBeenLastCalledWith('#')
  })
})

describe('UnitNumberField', () => {
  it('固定単位: ラベル・単位サフィックスを描画し、入力で文字列値を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <UnitNumberField label="制限時間" unit="分" min={1} max={300} step={5} value="60" onChange={onChange} />,
    )

    expect(screen.getByText('制限時間')).toBeInTheDocument()
    expect(screen.getByText('分')).toBeInTheDocument()

    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '300')
    expect(input).toHaveAttribute('step', '5')
    await user.type(input, '0')
    expect(onChange).toHaveBeenLastCalledWith('600')
  })

  it('選択単位: 単位 Select を描画し、切替で onUnitChange が呼ばれる', async () => {
    const onUnitChange = vi.fn()
    const user = userEvent.setup()
    render(
      <UnitNumberField
        label="修了目安時間"
        unitOptions={[
          { value: 'min', label: '分' },
          { value: 'hour', label: '時間' },
        ]}
        unitValue="min"
        onUnitChange={onUnitChange}
        value="90"
        onChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('時間'))
    expect(onUnitChange).toHaveBeenCalledWith('hour')
  })

  it('error があるとき input が aria-invalid になり role=alert が出る', () => {
    render(<UnitNumberField label="合格点" unit="%" error="0〜100 で入力してください" value="120" onChange={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('0〜100 で入力してください')
    expect(screen.getByRole('spinbutton').getAttribute('aria-invalid')).toBe('true')
  })

  it('disabled で入力を無効化する', () => {
    render(<UnitNumberField label="有効期限" unit="年" disabled value="3" onChange={vi.fn()} />)
    expect(screen.getByRole('spinbutton')).toBeDisabled()
  })
})

describe('UnitNumberInput', () => {
  it('裸コントロール単体でも単位付きで描画できる（FieldShell 複合ウィジェット埋め込み用）', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<UnitNumberInput unit="%" min={0} max={100} value="70" onChange={onChange} />)

    expect(screen.getByText('%')).toBeInTheDocument()
    await user.type(screen.getByRole('spinbutton'), '0')
    expect(onChange).toHaveBeenLastCalledWith('700')
  })
})

describe('ToggleChipsField', () => {
  const options = [
    { value: 1, label: '基礎' },
    { value: 2, label: '応用', color: '#f59e0b' },
    { value: 3, label: '実践' },
  ]

  it('選択状態を aria-pressed で表現し、クリックで追加した配列を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ToggleChipsField label="タグ" options={options} value={[2]} onChange={onChange} />)

    expect(screen.getByRole('button', { name: '応用' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '基礎' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: '基礎' }))
    expect(onChange).toHaveBeenCalledWith([2, 1])
  })

  it('選択済みチップのクリックで除いた配列を返す（元配列は変更しない）', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    const value = [1, 2]
    render(<ToggleChipsField label="タグ" options={options} value={value} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '応用' }))
    expect(onChange).toHaveBeenCalledWith([1])
    expect(value).toEqual([1, 2])
  })

  it('checkIcon 指定時、選択中チップにだけチェックマークを出す', () => {
    const { container } = render(
      <ToggleChipsField label="カテゴリ" checkIcon options={options} value={[1]} onChange={vi.fn()} />,
    )
    const checked = screen.getByRole('button', { name: '基礎' })
    const unchecked = screen.getByRole('button', { name: '実践' })
    expect(checked.querySelector('svg')).not.toBeNull()
    expect(unchecked.querySelector('svg')).toBeNull()
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('color 付き option は未選択時にだけ色ドットを出す', () => {
    render(<ToggleChipsField label="タグ" options={options} value={[]} onChange={vi.fn()} />)
    const withColor = screen.getByRole('button', { name: '応用' })
    const noColor = screen.getByRole('button', { name: '基礎' })
    expect(withColor.querySelector('[data-chip-dot]')).not.toBeNull()
    expect(noColor.querySelector('[data-chip-dot]')).toBeNull()
  })

  it('disabled で全チップを無効化する', () => {
    render(<ToggleChipsField label="タグ" disabled options={options} value={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '基礎' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '応用' })).toBeDisabled()
  })
})

describe('TextareaField', () => {
  it('複数行入力で文字列値を返す', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TextareaField label="説明" value="" onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'x')
    expect(onChange).toHaveBeenLastCalledWith('x')
  })
})
