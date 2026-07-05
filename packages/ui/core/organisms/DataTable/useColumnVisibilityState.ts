'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { defaultVisibleKeys } from './columnVisibility'
import type { Column } from './types'

/**
 * DataTable の表示列を localStorage に永続化する内部フック (uncontrolled モード用)。
 *
 * - 呼び出し側が `onColumnsChange` を渡さない (= uncontrolled) とき、DataTable が
 *   このフックで表示列を自管理し、列ピッカー (gear) を既定で出す。
 * - `storageKey` 明示時はそれを使う。未指定なら **route の pathname + 列キー署名**
 *   から自動でキーを生成する (テーブルごとに衝突しにくい既定キー)。
 * - SSR / 初回 hydration は `defaultHidden` を除いた全列を返し、hydration 後に
 *   localStorage の保存値へ切り替える (`useSyncExternalStore` が mismatch を吸収)。
 * - 変更は即 localStorage に書き戻し、同タブ / 他タブへ通知する。
 *
 * 永続化は browser API (localStorage / location) のみに依存し framework 非依存なので
 * packages/ui に置いてよい (URL 駆動の検索 / フィルタは app 側の useTableQueryState 管轄)。
 */

const STORAGE_PREFIX = 'datatable:cols:'
// 同タブ内の localStorage 変更は 'storage' イベントが飛ばないため自前で通知する。
const LOCAL_EVENT = 'datatable:cols:change'

// getSnapshot は同一参照を返す必要がある (新配列を返すと無限レンダになる)。
// raw 文字列が変わったときだけ再計算するため、キャッシュをモジュールレベルに持つ。
const snapshotCache = new Map<string, { raw: string | null; value: string[] }>()
const defaultStore = new Map<string, string[]>()

// 既定表示集合は defaultHidden に依存するため、署名 (= キャッシュキーの一部) にも
// defaultHidden を含める。列キーが同じで defaultHidden だけ違うテーブル同士で
// 既定値キャッシュが衝突するのを防ぐ。
function columnSignature<TRow>(columns: Column<TRow>[]): string {
  return columns.map((c) => `${c.key}${c.defaultHidden ? '!' : ''}`).join(',')
}

function resolveStorageKey<TRow>(storageKey: string | undefined, columns: Column<TRow>[]): string {
  if (storageKey) return STORAGE_PREFIX + storageKey
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  return `${STORAGE_PREFIX}${path}|${columnSignature(columns)}`
}

function getDefault<TRow>(fullKey: string, columns: Column<TRow>[]): string[] {
  const cached = defaultStore.get(fullKey)
  if (cached) return cached
  const value = defaultVisibleKeys(columns)
  defaultStore.set(fullKey, value)
  return value
}

function readSnapshot<TRow>(
  fullKey: string,
  columns: Column<TRow>[],
  extraValidKeys?: readonly string[],
): string[] {
  const fallback = getDefault(fullKey, columns)
  let raw: string | null
  try {
    raw = window.localStorage.getItem(fullKey)
  } catch {
    raw = null
  }
  const cached = snapshotCache.get(fullKey)
  if (cached && cached.raw === raw) return cached.value

  let value = fallback
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // 操作列など合成キー (extraValidKeys) も並べ替え位置を保存できるよう許容する。
        const known = new Set([...columns.map((c) => c.key), ...(extraValidKeys ?? [])])
        value = parsed.filter((k): k is string => typeof k === 'string' && known.has(k))
      }
    } catch {
      value = fallback
    }
  }
  snapshotCache.set(fullKey, { raw, value })
  return value
}

export interface ColumnVisibilityState {
  visibleColumns: string[]
  onColumnsChange: (columns: string[]) => void
  /** 保存値を破棄して既定表示 (defaultHidden を除く全列) に戻す。 */
  reset: () => void
}

export function useColumnVisibilityState<TRow>(
  columns: Column<TRow>[],
  storageKey?: string,
  /** columns に含まれないが許容する追加キー (操作列など合成列)。署名/storage key には含めない。 */
  extraValidKeys?: readonly string[],
): ColumnVisibilityState {
  const fullKey = resolveStorageKey(storageKey, columns)
  // extraValidKeys は安定参照でない可能性があるため文字列化して dep に使う。
  const extraValidKey = (extraValidKeys ?? []).join(',')

  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('storage', onChange)
    window.addEventListener(LOCAL_EVENT, onChange)
    return () => {
      window.removeEventListener('storage', onChange)
      window.removeEventListener(LOCAL_EVENT, onChange)
    }
  }, [])

  const getSnapshot = useCallback(
    () => readSnapshot(fullKey, columns, extraValidKeys),
    // extraValidKeys は extraValidKey で代表（react-hooks/exhaustive-deps 対策の意図）
    [fullKey, columns, extraValidKey],
  )
  const getServerSnapshot = useCallback(() => getDefault(fullKey, columns), [fullKey, columns])

  const visibleColumns = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const onColumnsChange = useCallback(
    (next: string[]) => {
      try {
        window.localStorage.setItem(fullKey, JSON.stringify(next))
      } catch {
        // quota 超過等は無視 (通知だけ行い再読込で復元を試みる)
      }
      window.dispatchEvent(new Event(LOCAL_EVENT))
    },
    [fullKey],
  )

  // 保存値を消すと readSnapshot が既定 (defaultHidden を除く全列) を返す。
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(fullKey)
    } catch {
      // ignore (読めない環境では既に既定にフォールバックしている)
    }
    window.dispatchEvent(new Event(LOCAL_EVENT))
  }, [fullKey])

  return { visibleColumns, onColumnsChange, reset }
}
