'use client'

import { useEffect, useRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, highlightActiveLine, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { syntaxHighlighting, defaultHighlightStyle, HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import styles from './MarkdownEditor.module.scss'

export interface MarkdownToolbarAction {
  readonly kind:
    | 'bold'
    | 'italic'
    | 'strike'
    | 'heading'
    | 'ul'
    | 'ol'
    | 'quote'
    | 'code'
    | 'codeblock'
    | 'link'
    | 'image'
    | 'hr'
  readonly label: string
  readonly icon?: string
}

export const DEFAULT_TOOLBAR: readonly MarkdownToolbarAction[] = [
  { kind: 'bold', label: '太字', icon: 'B' },
  { kind: 'italic', label: '斜体', icon: 'I' },
  { kind: 'strike', label: '打消', icon: 'S' },
  { kind: 'heading', label: '見出し', icon: 'H' },
  { kind: 'ul', label: '箇条書き', icon: '•' },
  { kind: 'ol', label: '番号付き', icon: '1.' },
  { kind: 'quote', label: '引用', icon: '❝' },
  { kind: 'code', label: 'コード', icon: '</>' },
  { kind: 'codeblock', label: 'コードブロック', icon: '{ }' },
  { kind: 'link', label: 'リンク', icon: '🔗' },
  { kind: 'image', label: '画像', icon: '🖼' },
  { kind: 'hr', label: '区切り', icon: '—' },
]

export interface MarkdownEditorProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly minHeight?: number | string
  readonly toolbar?: readonly MarkdownToolbarAction[] | false
  readonly className?: string
}

// シンタックスハイライト（Markdown 向け補強）
const markdownHighlight = HighlightStyle.define([
  { tag: t.heading1, fontSize: '1.4em', fontWeight: 'bold', color: 'var(--fg)' },
  { tag: t.heading2, fontSize: '1.25em', fontWeight: 'bold', color: 'var(--fg)' },
  { tag: t.heading3, fontSize: '1.1em', fontWeight: 'bold', color: 'var(--fg)' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: '#2563eb', textDecoration: 'underline' },
  { tag: t.url, color: '#2563eb' },
  { tag: t.monospace, color: '#b91c1c', background: '#f5f3ec' },
  { tag: t.quote, color: '#555', fontStyle: 'italic' },
  { tag: t.list, color: '#555' },
])

function surroundSelection(view: EditorView, left: string, right = left) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  view.dispatch({
    changes: { from, to, insert: `${left}${selected}${right}` },
    selection: { anchor: from + left.length, head: from + left.length + selected.length },
  })
  view.focus()
}

function prefixLines(view: EditorView, prefix: string) {
  const { from, to } = view.state.selection.main
  const startLine = view.state.doc.lineAt(from)
  const endLine = view.state.doc.lineAt(to)
  const changes: { from: number; insert: string }[] = []
  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = view.state.doc.line(i)
    changes.push({ from: line.from, insert: prefix })
  }
  view.dispatch({ changes })
  view.focus()
}

function insertBlock(view: EditorView, text: string) {
  const { from, to } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const atLineStart = from === line.from
  const prefix = atLineStart ? '' : '\n\n'
  view.dispatch({
    changes: { from, to, insert: `${prefix}${text}\n` },
    selection: { anchor: from + prefix.length + text.length },
  })
  view.focus()
}

export function applyAction(view: EditorView, kind: MarkdownToolbarAction['kind']) {
  switch (kind) {
    case 'bold':
      return surroundSelection(view, '**')
    case 'italic':
      return surroundSelection(view, '*')
    case 'strike':
      return surroundSelection(view, '~~')
    case 'heading':
      return prefixLines(view, '## ')
    case 'ul':
      return prefixLines(view, '- ')
    case 'ol':
      return prefixLines(view, '1. ')
    case 'quote':
      return prefixLines(view, '> ')
    case 'code':
      return surroundSelection(view, '`')
    case 'codeblock':
      return insertBlock(view, '```\n\n```')
    case 'link':
      return surroundSelection(view, '[', '](url)')
    case 'image':
      return insertBlock(view, '![alt](url)')
    case 'hr':
      return insertBlock(view, '---')
  }
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = '40vh',
  toolbar = DEFAULT_TOOLBAR,
  className,
}: MarkdownEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current) return
    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        syntaxHighlighting(markdownHighlight),
        highlightActiveLine(),
        lineNumbers(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
          },
          '.cm-content': {
            padding: '0.75rem 0.25rem',
            minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
            caretColor: 'var(--fg)',
          },
          '.cm-focused': { outline: 'none' },
          '.cm-activeLine': { backgroundColor: 'rgba(0,0,0,0.03)' },
          '.cm-gutters': {
            background: 'transparent',
            border: 'none',
            color: 'var(--muted, #8a8a8a)',
            fontSize: '12px',
          },
        }),
      ],
    })
    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
    // 初期化は一度だけ。value の後続反映は下のuseEffectで対応。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 外部から value を強制同期したい場合（sessionStorage 復元等）。
  // エディタ内のdocと異なれば書き戻す。
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  const handleToolbar = useCallback((kind: MarkdownToolbarAction['kind']) => {
    const view = viewRef.current
    if (!view) return
    applyAction(view, kind)
  }, [])

  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ''}`}>
      {toolbar !== false && toolbar && toolbar.length > 0 && (
        <div className={styles.toolbar} role="toolbar" aria-label="Markdown toolbar">
          {toolbar.map((item) => (
            <button
              key={item.kind}
              type="button"
              className={styles.toolbarBtn}
              title={item.label}
              aria-label={item.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleToolbar(item.kind)}
            >
              {item.icon ?? item.label}
            </button>
          ))}
          <div className={styles.toolbarSpacer} aria-hidden="true" />
          <div className={styles.toolbarHint} aria-hidden="true">
            {placeholder ? '' : 'Tab でインデント'}
          </div>
        </div>
      )}
      <div ref={hostRef} className={styles.editor} />
    </div>
  )
}

export default MarkdownEditor
