import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropzone } from './Dropzone'

function makeFile(name: string, type = 'text/plain') {
  return new File([`content of ${name}`], name, { type })
}

describe('Dropzone', () => {
  it('default label をレンダリングする', () => {
    render(<Dropzone onFiles={() => undefined} />)
    expect(screen.getByText(/ファイルをドロップ/)).toBeInTheDocument()
  })

  it('custom label と helperText を表示する', () => {
    render(
      <Dropzone
        onFiles={() => undefined}
        label="HTML / PDF / Markdown をここにドロップ"
        helperText="各 5 MiB まで"
      />
    )
    expect(screen.getByText('HTML / PDF / Markdown をここにドロップ')).toBeInTheDocument()
    expect(screen.getByText('各 5 MiB まで')).toBeInTheDocument()
  })

  it('role="button" + tabIndex=0 を持つ', () => {
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    expect(root.getAttribute('role')).toBe('button')
    expect(root.getAttribute('tabindex')).toBe('0')
  })

  it('click で内部 input がクリックされる', async () => {
    const user = userEvent.setup()
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    await user.click(root)
    expect(clickSpy).toHaveBeenCalled()
  })

  it('Enter キーで input がクリックされる', () => {
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    fireEvent.keyDown(root, { key: 'Enter' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('Space キーで input がクリックされる', () => {
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    fireEvent.keyDown(root, { key: ' ' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('dragOver で dragOver class が付く', () => {
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    fireEvent.dragOver(root)
    expect(root.className).toMatch(/dragOver/)
  })

  it('dragLeave で dragOver class が外れる', () => {
    const { container } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    fireEvent.dragOver(root)
    fireEvent.dragLeave(root)
    expect(root.className).not.toMatch(/dragOver/)
  })

  it('drop で onFiles(File[]) が呼ばれる', () => {
    const handleFiles = vi.fn()
    const file1 = makeFile('a.txt')
    const file2 = makeFile('b.pdf', 'application/pdf')
    const { container } = render(<Dropzone onFiles={handleFiles} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    fireEvent.drop(root, {
      dataTransfer: { files: [file1, file2] },
    })
    expect(handleFiles).toHaveBeenCalledTimes(1)
    const calledWith = handleFiles.mock.calls[0]?.[0] as File[]
    expect(Array.isArray(calledWith)).toBe(true)
    expect(calledWith).toHaveLength(2)
    expect(calledWith[0]?.name).toBe('a.txt')
    expect(calledWith[1]?.name).toBe('b.pdf')
  })

  it('input change で onFiles(File[]) が呼ばれる', () => {
    const handleFiles = vi.fn()
    const file = makeFile('c.md', 'text/markdown')
    const { container } = render(<Dropzone onFiles={handleFiles} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    expect(handleFiles).toHaveBeenCalledTimes(1)
    const calledWith = handleFiles.mock.calls[0]?.[0] as File[]
    expect(Array.isArray(calledWith)).toBe(true)
    expect(calledWith[0]?.name).toBe('c.md')
  })

  it('disabled で click / keyboard / drop が無効化される', async () => {
    const handleFiles = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<Dropzone onFiles={handleFiles} disabled />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.disabled).toBe(true)
    expect(root.getAttribute('aria-disabled')).toBe('true')

    const clickSpy = vi.spyOn(input, 'click')
    await user.click(root)
    expect(clickSpy).not.toHaveBeenCalled()

    fireEvent.drop(root, { dataTransfer: { files: [makeFile('x.txt')] } })
    expect(handleFiles).not.toHaveBeenCalled()
  })

  it('accept / multiple を input に渡す', () => {
    const { container } = render(
      <Dropzone onFiles={() => undefined} accept=".html,.pdf" multiple />
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toBe('.html,.pdf')
    expect(input.multiple).toBe(true)
  })

  it('size="large" で large class が付く (default では付かない)', () => {
    const { container, rerender } = render(<Dropzone onFiles={() => undefined} />)
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    expect(root.className).not.toMatch(/large/)
    rerender(<Dropzone onFiles={() => undefined} size="large" />)
    expect(root.className).toMatch(/large/)
  })

  it('className を root に伝搬する', () => {
    const { container } = render(
      <Dropzone onFiles={() => undefined} className="custom-cls" />
    )
    const root = container.querySelector('[data-component="dropzone"]') as HTMLElement
    expect(root.className).toMatch(/custom-cls/)
  })
})
