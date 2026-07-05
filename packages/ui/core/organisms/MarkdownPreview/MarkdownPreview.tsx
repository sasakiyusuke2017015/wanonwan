'use client'

import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

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
 * - marked v15+ で同期的に HTML 化し、DOMPurify でサニタイズしてから描画する
 * - `<script>` や `on*` ハンドラ等の危険な HTML は DOMPurify が除去するため、
 *   ユーザー入力をそのまま渡してよい
 */
export function MarkdownPreview({ source, className = 'prose', style }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    try {
      const out = marked.parse(source, { async: false })
      return DOMPurify.sanitize(typeof out === 'string' ? out : '')
    } catch (e) {
      // エラーメッセージにも入力由来の文字列が混ざりうるため sanitize を通す
      const msg = (e as Error).message ?? String(e)
      return DOMPurify.sanitize(`<p style="color:#b91c1c">プレビューエラー: ${msg}</p>`)
    }
  }, [source])

  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />
}

export default MarkdownPreview
