'use client'

import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

import styles from './MarkdownPreview.module.scss'

export interface MarkdownPreviewProps {
  /** Markdown ソース */
  readonly source: string
  /** ラッパーに追加する className（配置・余白の上書き用） */
  readonly className?: string
  /** 追加のスタイル */
  readonly style?: React.CSSProperties
}

/**
 * Markdown プレビュー。
 * - marked で同期的に HTML 化し、DOMPurify でサニタイズしてから描画する
 * - `<script>` や `on*` ハンドラ等の危険な HTML は DOMPurify が除去する
 */
export function MarkdownPreview({ source, className, style }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    try {
      const out = marked.parse(source, { async: false })
      const raw = typeof out === 'string' ? out : ''
      return DOMPurify.sanitize(raw)
    } catch (e) {
      // エラーメッセージにも入力由来の文字列が混ざりうるため sanitize を通す
      const msg = (e as Error).message ?? String(e)
      return DOMPurify.sanitize(`<p>プレビューエラー: ${msg}</p>`)
    }
  }, [source])

  const rootClass = className ? `${styles.prose} ${className}` : styles.prose

  return <div className={rootClass} style={style} dangerouslySetInnerHTML={{ __html: html }} />
}

export default MarkdownPreview
