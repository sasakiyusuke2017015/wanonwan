import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { ThumbnailCropper } from './ThumbnailCropper'

// react-easy-crop は jsdom で DOM 計測に依存するため、表示の有無だけ確認できれば十分。
// クロップ確定パスは Canvas/Image を要し jsdom で非対応なので、ここでは
// 「アップロード前の Dropzone 表示」と「MIME / サイズのバリデーション」を検証する。
vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="cropper-mock" />,
}))

function makeImage(name: string, type: string, size = 1024): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function getDropzoneInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

describe('ThumbnailCropper', () => {
  beforeEach(() => {
    // FileReader.readAsDataURL を jsdom で安定化
    vi.restoreAllMocks()
  })

  it('初期状態では Dropzone を表示する', () => {
    render(<ThumbnailCropper onCropped={() => undefined} />)
    expect(screen.getByText('画像をドロップ、またはクリックして選択')).toBeInTheDocument()
  })

  it('既定の accept は image/jpeg,image/png', () => {
    const { container } = render(<ThumbnailCropper onCropped={() => undefined} />)
    expect(getDropzoneInput(container).accept).toBe('image/jpeg,image/png')
  })

  it('acceptedTypes を渡すと accept 属性に反映される', () => {
    const { container } = render(
      <ThumbnailCropper
        onCropped={() => undefined}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />,
    )
    expect(getDropzoneInput(container).accept).toBe('image/jpeg,image/png,image/webp')
  })

  it('許可リスト外の形式を選ぶとエラーを表示する', async () => {
    const { container } = render(<ThumbnailCropper onCropped={() => undefined} />)
    const input = getDropzoneInput(container)
    fireEvent.change(input, { target: { files: [makeImage('a.gif', 'image/gif')] } })
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('対応していない画像形式です')
    })
  })

  it('acceptedTypes に webp を足すと webp を受け付ける', async () => {
    const { container } = render(
      <ThumbnailCropper
        onCropped={() => undefined}
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />,
    )
    fireEvent.change(getDropzoneInput(container), {
      target: { files: [makeImage('ok.webp', 'image/webp')] },
    })
    await waitFor(() => {
      expect(screen.getByTestId('cropper-mock')).toBeInTheDocument()
    })
  })

  it('サイズ上限を超えるとエラーを表示する', async () => {
    const { container } = render(
      <ThumbnailCropper onCropped={() => undefined} maxBytes={1024} />,
    )
    const input = getDropzoneInput(container)
    fireEvent.change(input, {
      target: { files: [makeImage('big.jpg', 'image/jpeg', 2048)] },
    })
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ファイルサイズが大きすぎます')
    })
  })

  it('正しい JPG を選ぶと cropper 表示に切り替わる', async () => {
    const { container } = render(<ThumbnailCropper onCropped={() => undefined} />)
    const input = getDropzoneInput(container)
    fireEvent.change(input, {
      target: { files: [makeImage('ok.jpg', 'image/jpeg')] },
    })
    await waitFor(() => {
      expect(screen.getByTestId('cropper-mock')).toBeInTheDocument()
    })
    expect(screen.getByText('この範囲で切り出す')).toBeInTheDocument()
  })

  it('「選び直す」で Dropzone に戻り onReset が呼ばれる', async () => {
    const onReset = vi.fn()
    const { container } = render(
      <ThumbnailCropper onCropped={() => undefined} onReset={onReset} />,
    )
    fireEvent.change(getDropzoneInput(container), {
      target: { files: [makeImage('ok.png', 'image/png')] },
    })
    await waitFor(() => screen.getByText('選び直す'))
    fireEvent.click(screen.getByText('選び直す'))
    await waitFor(() => {
      expect(screen.getByText('画像をドロップ、またはクリックして選択')).toBeInTheDocument()
    })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('className を root に伝搬する', () => {
    const { container } = render(
      <ThumbnailCropper onCropped={() => undefined} className="custom-cls" />,
    )
    const root = container.querySelector('[data-component="thumbnail-cropper"]') as HTMLElement
    expect(root.className).toMatch(/custom-cls/)
  })
})
