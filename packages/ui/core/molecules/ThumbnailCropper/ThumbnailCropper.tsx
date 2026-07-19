'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'

import { Dropzone } from '../../atoms/Dropzone'
import { Button } from '../Button'
import { cn } from '../../utils'
import { cropImage, readFileAsDataUrl, type CropImageType, type CropOutput } from './cropImage'

/** アップロードを許可する MIME の既定値。jpg / png */
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024 // 5 MiB

export interface ThumbnailCropperProps {
  /**
   * 切り出し枠の縦横比。未指定なら自由比率にはせず正方形 (1) を既定とする。
   * 例: 16 / 9, 4 / 3, 1
   */
  aspect?: number
  /**
   * アップロードを許可する MIME のリスト。default は ['image/jpeg', 'image/png']。
   * 出力は outputType に従うので、ここに webp を足しても保存形式は変わらない。
   */
  acceptedTypes?: readonly string[]
  /** アップロード許可サイズの上限 (byte)。default 5 MiB */
  maxBytes?: number
  /** 切り出し確定時に呼ばれる。Blob とプレビュー URL を返す (presentational) */
  onCropped: (output: CropOutput) => void
  /**
   * 出力 MIME を固定する。未指定なら元画像の形式に従う (png は png、それ以外は jpeg)。
   * 透過を捨ててよく常に jpeg で揃えたい用途では 'image/jpeg' を渡す。
   */
  outputType?: CropImageType
  /** Dropzone の中央ラベル */
  label?: string
  /** Dropzone の補助テキスト */
  helperText?: string
  /** 切り出しキャンセル / 画像リセット時に呼ばれる */
  onReset?: () => void
  disabled?: boolean
  className?: string
}

/**
 * サムネイル登録用の画像切り出しコンポーネント。
 *
 * jpg / png をアップロード → 指定 aspect の固定フレーム内に収まるよう
 * ドラッグ + ズームで位置調節 → Canvas で切り出して Blob を callback で返す。
 *
 * upload / 保存は呼び出し側 (apps/web) の責務。本コンポーネントは Blob を
 * 返すところまでを担う presentational component。
 */
export function ThumbnailCropper({
  aspect = 1,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxBytes = DEFAULT_MAX_BYTES,
  onCropped,
  outputType: outputTypeProp,
  label = '画像をドロップ、またはクリックして選択',
  helperText = 'JPG / PNG 形式',
  onReset,
  disabled = false,
  className,
}: ThumbnailCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [detectedType, setDetectedType] = useState<CropImageType>('image/jpeg')
  const outputType = outputTypeProp ?? detectedType
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // 直前に発行した crop プレビュー URL。再切り出し時に revoke して leak を防ぐ
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
    }
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return

      setError(null)

      if (!acceptedTypes.includes(file.type)) {
        setError('対応していない画像形式です')
        return
      }
      if (file.size > maxBytes) {
        const mib = Math.round((maxBytes / (1024 * 1024)) * 10) / 10
        setError(`ファイルサイズが大きすぎます (上限 ${mib} MiB)`)
        return
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        setImageSrc(dataUrl)
        setDetectedType(file.type === 'image/png' ? 'image/png' : 'image/jpeg')
        setCrop({ x: 0, y: 0 })
        setZoom(1)
      } catch {
        setError('ファイルの読み込みに失敗しました')
      }
    },
    [acceptedTypes, maxBytes],
  )

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleReset = useCallback(() => {
    setImageSrc(null)
    setCroppedAreaPixels(null)
    setError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    onReset?.()
  }, [onReset])

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setProcessing(true)
    setError(null)
    try {
      const output = await cropImage(imageSrc, croppedAreaPixels, outputType)
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
      lastUrlRef.current = output.url
      onCropped(output)
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の切り出しに失敗しました')
    } finally {
      setProcessing(false)
    }
  }, [imageSrc, croppedAreaPixels, outputType, onCropped])

  return (
    <div className={cn('flex flex-col gap-3', className)} data-component="thumbnail-cropper">
      {imageSrc ? (
        <>
          <div className="relative h-72 w-full overflow-hidden rounded-md bg-gray-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              showGrid
              restrictPosition
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <span className="shrink-0">ズーム</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={disabled || processing}
              className="w-full"
              aria-label="ズーム"
            />
          </label>

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleConfirm}
              loading={processing}
              disabled={disabled || !croppedAreaPixels}
            >
              この範囲で切り出す
            </Button>
            <Button variant="ghost" onClick={handleReset} disabled={disabled || processing}>
              選び直す
            </Button>
          </div>
        </>
      ) : (
        <Dropzone
          accept={acceptedTypes.join(',')}
          disabled={disabled}
          onFiles={handleFiles}
          label={label}
          helperText={helperText}
        />
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
