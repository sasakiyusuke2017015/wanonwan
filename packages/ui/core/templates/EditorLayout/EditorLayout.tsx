import styles from './EditorLayout.module.scss'

export interface EditorLayoutProps {
  /** ツールバー（保存ボタン等） */
  readonly toolbar?: React.ReactNode
  /** 保存メッセージやエラー表示 */
  readonly message?: React.ReactNode
  /** 入力フォーム側 */
  readonly form: React.ReactNode
  /** プレビュー側（null なら非表示、プレビュー切替は呼び出し側） */
  readonly preview?: React.ReactNode
  readonly className?: string
}

/**
 * エディタ画面のレイアウト。
 * ツールバー / メッセージ / フォーム（左）+ プレビュー（右）。
 */
export function EditorLayout({
  toolbar,
  message,
  form,
  preview,
  className,
}: EditorLayoutProps) {
  return (
    <div className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      {message && <div className={styles.message}>{message}</div>}
      <div className={preview ? styles.gridWithPreview : styles.gridFormOnly}>
        <div className={styles.form}>{form}</div>
        {preview && <div className={styles.preview}>{preview}</div>}
      </div>
    </div>
  )
}

export default EditorLayout
