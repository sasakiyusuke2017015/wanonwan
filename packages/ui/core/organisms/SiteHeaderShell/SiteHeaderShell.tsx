import styles from './SiteHeaderShell.module.scss'

export interface SiteHeaderShellProps {
  /** 左端：ブランドロゴ or テキスト */
  readonly brand: React.ReactNode
  /** ナビ領域 */
  readonly nav?: React.ReactNode
  /** ナビと右アクションの間に柔軟スペースを入れるか */
  readonly withSpacer?: boolean
  /** 右側のアクション群（ボタン、プロフィール等） */
  readonly actions?: React.ReactNode
  readonly className?: string
}

/**
 * サイトヘッダーの shell。中身は children slot で受ける。
 * 認証状態やルーティングの判定は呼び出し側。
 */
export function SiteHeaderShell({
  brand,
  nav,
  withSpacer = true,
  actions,
  className,
}: SiteHeaderShellProps) {
  return (
    <header className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {brand}
      {nav}
      {withSpacer && <div className={styles.spacer} />}
      {actions}
    </header>
  )
}

export default SiteHeaderShell
