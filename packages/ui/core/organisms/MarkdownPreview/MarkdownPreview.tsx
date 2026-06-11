'use client'

import { useMemo } from 'react'
import { marked } from 'marked'

export interface MarkdownPreviewProps {
  /** Markdown ソース */
  readonly source: string
  /** ラッパーに付与する className（.prose など） */
  readonly className?: string
  /** 追加のスタイル */
  readonly style?: React.CSSProperties
}

/**
 * シンプルな Markdown プレビュー。
 * - marked v15+ で同期的に HTML 化
 * - 危険な HTML の除去は行わないため、信頼できる入力にのみ利用する
 */
export function MarkdownPreview({ source, className = 'prose', style }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    try {
      const out = marked.parse(source, { async: false })
      return typeof out === 'string' ? out : ''
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      return `<p style="color:#b91c1c">プレビューエラー: ${msg}</p>`
    }
  }, [source])

  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />
}

export default MarkdownPreview
