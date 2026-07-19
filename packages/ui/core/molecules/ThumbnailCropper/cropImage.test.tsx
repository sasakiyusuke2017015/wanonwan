import { describe, it, expect, vi } from 'vitest'

import { cropOutputToFile, readFileAsDataUrl, type CropOutput } from './cropImage'

describe('cropOutputToFile', () => {
  it('jpeg Blob を .jpg File に変換する', () => {
    const output: CropOutput = {
      blob: new Blob(['x'], { type: 'image/jpeg' }),
      url: 'blob:x',
    }
    const file = cropOutputToFile(output, 'avatar')
    expect(file.name).toBe('avatar.jpg')
    expect(file.type).toBe('image/jpeg')
  })

  it('png Blob を .png File に変換する', () => {
    const output: CropOutput = {
      blob: new Blob(['x'], { type: 'image/png' }),
      url: 'blob:x',
    }
    const file = cropOutputToFile(output)
    expect(file.name).toBe('thumbnail.png')
    expect(file.type).toBe('image/png')
  })
})

describe('readFileAsDataUrl', () => {
  it('File を dataURL 文字列に変換する', async () => {
    const file = new File(['hello'], 'a.txt', { type: 'text/plain' })
    const url = await readFileAsDataUrl(file)
    expect(url).toMatch(/^data:text\/plain/)
  })

  it('読み込み失敗時は reject する', async () => {
    const file = new File(['x'], 'a.txt', { type: 'text/plain' })
    const original = FileReader.prototype.readAsDataURL
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (
      this: FileReader,
    ) {
      this.dispatchEvent(new Event('error'))
    })
    await expect(readFileAsDataUrl(file)).rejects.toThrow('ファイルの読み込みに失敗しました')
    FileReader.prototype.readAsDataURL = original
  })
})
