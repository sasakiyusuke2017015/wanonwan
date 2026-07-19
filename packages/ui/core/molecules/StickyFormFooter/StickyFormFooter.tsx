import { FC, ReactNode } from 'react'

export interface StickyFormFooterProps {
  /** 左側に表示する保存状態などのテキスト/要素 */
  status?: ReactNode
  /** 右側に並べるアクション（ボタン等） */
  children: ReactNode
  className?: string
}

/**
 * StickyFormFooter - 画面下部に固定するフォームのアクションバー
 *
 * 左に保存状態テキスト、右にキャンセル/保存などのボタンを並べる。
 *
 * Usage:
 * <StickyFormFooter status={<span>すべての変更は保存済みです</span>}>
 *   <Button variant="outline">キャンセル</Button>
 *   <Button variant="primary">変更を保存</Button>
 * </StickyFormFooter>
 */
export const StickyFormFooter: FC<StickyFormFooterProps> = ({
  status,
  children,
  className = '',
}) => {
  return (
    <footer
      className={`sticky bottom-0 z-10 border-t border-gray-200 bg-white ${className}`}
      style={{ boxShadow: '0 -4px 12px -4px rgb(0 0 0 / 0.08)' }}
      data-component="sticky-form-footer"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {status && <div className="min-w-0 text-[13px] text-gray-500">{status}</div>}
        <div className="ml-auto flex shrink-0 items-center gap-3">{children}</div>
      </div>
    </footer>
  )
}
