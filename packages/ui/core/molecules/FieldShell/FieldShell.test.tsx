import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldShell } from './FieldShell'

describe('FieldShell', () => {
  it('ラベルを描画し、input と htmlFor / id で結ぶ', () => {
    render(
      <FieldShell label="会社名">
        {({ id }) => <input id={id} aria-label="会社名" />}
      </FieldShell>,
    )
    const input = screen.getByLabelText('会社名')
    const label = screen.getByText('会社名')
    // label の htmlFor と input の id が一致する
    expect(label.closest('label')?.getAttribute('for')).toBe(input.id)
    expect(input.id).toBeTruthy()
  })

  it('required=true で「必須」バッジを出す', () => {
    render(<FieldShell label="名前" required>{({ id }) => <input id={id} />}</FieldShell>)
    expect(screen.getByText('必須')).toBeInTheDocument()
    expect(screen.queryByText('任意')).not.toBeInTheDocument()
  })

  it('required=false で「任意」バッジを出す（既定）', () => {
    render(<FieldShell label="説明">{({ id }) => <input id={id} />}</FieldShell>)
    expect(screen.getByText('任意')).toBeInTheDocument()
    expect(screen.queryByText('必須')).not.toBeInTheDocument()
  })

  it('showOptionalBadge=false なら任意バッジを出さない', () => {
    render(
      <FieldShell label="名前" showOptionalBadge={false}>
        {({ id }) => <input id={id} />}
      </FieldShell>,
    )
    expect(screen.queryByText('任意')).not.toBeInTheDocument()
  })

  it('description を出し、aria-describedby に説明 id を含める', () => {
    render(
      <FieldShell label="名前" description="表示名です">
        {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} />}
      </FieldShell>,
    )
    const desc = screen.getByText('表示名です')
    const input = screen.getByRole('textbox')
    expect(desc.id).toBeTruthy()
    expect(input.getAttribute('aria-describedby')).toContain(desc.id)
  })

  it('error があるとき role=alert で表示し、invalid / aria-describedby に反映する', () => {
    render(
      <FieldShell label="名前" error="名前を入力してください">
        {({ id, describedBy, invalid }) => (
          <input id={id} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </FieldShell>,
    )
    const err = screen.getByRole('alert')
    expect(err).toHaveTextContent('名前を入力してください')
    const input = screen.getByRole('textbox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toContain(err.id)
  })

  it('error が無いとき invalid=false / role=alert は無い', () => {
    render(<FieldShell label="名前">{({ id, invalid }) => <input id={id} aria-invalid={invalid} />}</FieldShell>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('false')
  })
})
