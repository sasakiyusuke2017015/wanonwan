import type { Area } from 'react-easy-crop'

export interface CropOutput {
  /** 切り出した画像の Blob (caller が File 化 / upload する) */
  blob: Blob
  /** プレビュー用 object URL。caller 側で revokeObjectURL する責務 */
  url: string
}

export type CropImageType = 'image/jpeg' | 'image/png'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('画像の読み込みに失敗しました')))
    // dataURL / objectURL は same-origin 扱いなので crossOrigin 不要
    image.src = src
  })
}

/**
 * react-easy-crop の `croppedAreaPixels` を元に Canvas で切り出す。
 *
 * @param imageSrc クロップ元の画像 (dataURL or objectURL)
 * @param area     react-easy-crop が返す元画像ピクセル基準のクロップ領域
 * @param type     出力 MIME。元が png なら 'image/png' を渡すと透過を保てる
 * @param quality  jpeg 圧縮品質 (0〜1, png では無視される)
 */
export async function cropImage(
  imageSrc: string,
  area: Area,
  type: CropImageType = 'image/jpeg',
  quality = 0.92,
): Promise<CropOutput> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width)
  canvas.height = Math.round(area.height)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D コンテキストを取得できませんでした')
  }

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), type, quality)
  })

  if (!blob) {
    throw new Error('画像の切り出しに失敗しました')
  }

  return { blob, url: URL.createObjectURL(blob) }
}

/**
 * CropOutput の Blob を File 化する。upload API が File を要求する呼び出し側向け。
 * 拡張子は MIME から導出 (image/png → .png, それ以外 → .jpg)。
 */
export function cropOutputToFile(output: CropOutput, baseName = 'thumbnail'): File {
  const ext = output.blob.type === 'image/png' ? 'png' : 'jpg'
  return new File([output.blob], `${baseName}.${ext}`, { type: output.blob.type })
}

/** File を dataURL に変換 (react-easy-crop の image src に渡す) */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string))
    reader.addEventListener('error', () => reject(new Error('ファイルの読み込みに失敗しました')))
    reader.readAsDataURL(file)
  })
}
