import { Card, CardBody } from '../../molecules/Card'

export interface ComingSoonProps {
  title: string
  description?: string
  /** Hint message shown under the body. Defaults to a Japanese Phase 2 note. */
  hint?: string
  className?: string
}

/**
 * Placeholder for routes that are reserved but not yet implemented.
 *
 * Renders as a <section> so it can sit inside any page or layout
 * without nesting <main> landmarks. Pages that need <main> should
 * supply it themselves (typically in the layout).
 */
export function ComingSoon({
  title,
  description,
  hint = 'この機能は Phase 2 で実装予定です。URL・ナビゲーションは予約済みです。',
  className,
}: ComingSoonProps) {
  return (
    <section className={['mx-auto max-w-2xl px-6 py-16', className].filter(Boolean).join(' ')}>
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Coming soon
          </span>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description ? <p className="text-sm text-slate-600">{description}</p> : null}
          {hint ? <p className="mt-4 text-xs text-slate-400">{hint}</p> : null}
        </CardBody>
      </Card>
    </section>
  )
}

export default ComingSoon
