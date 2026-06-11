/**
 * localStorage ヘルパー
 *
 * SSR 対応 + 型安全な localStorage 操作
 */

import { atom } from 'jotai'

/**
 * ブラウザ環境かどうかを判定
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * localStorage から同期的に値を取得
 *
 * @param key ストレージキー
 * @param defaultValue デフォルト値
 * @returns 取得した値またはデフォルト値
 */
export function getStoredValue<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

/**
 * localStorage に値を保存
 *
 * @param key ストレージキー
 * @param value 保存する値
 */
export function setStoredValue<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage が使えない場合は無視
  }
}

/**
 * localStorage から値を削除
 *
 * @param key ストレージキー
 */
export function removeStoredValue(key: string): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage が使えない場合は無視
  }
}

// ============================================
// Jotai Atom Factory
// ============================================

/**
 * localStorage 連携 atom を作成
 * 初期値を同期的に読み込み、変更時に自動保存
 *
 * @example
 * ```ts
 * const myAtom = atomWithStorageSync('myKey', 'default')
 * ```
 */
export function atomWithStorageSync<T>(key: string, defaultValue: T) {
  const initialValue = getStoredValue(key, defaultValue)
  const baseAtom = atom(initialValue)

  return atom(
    (get) => get(baseAtom),
    (_get, set, newValue: T) => {
      set(baseAtom, newValue)
      if (isBrowser()) {
        setStoredValue(key, newValue)
      }
    }
  )
}
