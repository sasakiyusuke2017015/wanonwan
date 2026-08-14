/**
 * 明暗（light / dark / system）の DOM 反映
 *
 * 反転境界は semantic トークン層（core/styles/tokens.css の `[data-theme-mode="dark"]`）。
 * ここは「どちらを適用するか」を `<html data-theme-mode>` に書き込むだけを担う。
 *
 * FOUC 対策の pre-paint script は React 非依存の colorSchemeScript.ts にある
 * （Server Component から import するため）。
 */

import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { colorSchemeAtom, resolvedColorSchemeAtom, systemColorSchemeAtom } from './atoms'
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_DARK_QUERY } from './colorSchemeScript'
import type { ColorScheme, ResolvedColorScheme } from './types'

/**
 * 解決済みの明暗を `<html>` へ反映し、OS 設定の変化を購読する。
 *
 * アプリのルート（Jotai Provider 配下）で 1 回だけ呼ぶ。
 */
export function useApplyColorScheme(): void {
  const resolved = useAtomValue(resolvedColorSchemeAtom)
  const setSystem = useSetAtom(systemColorSchemeAtom)

  // OS 設定の変化を購読する。`system` 選択時だけ効くが、購読自体は常に張っておく
  // （選択を system へ戻した瞬間に最新値が要るため）。
  useEffect(() => {
    if (!window.matchMedia) return
    const mql = window.matchMedia(COLOR_SCHEME_DARK_QUERY)
    const sync = () => setSystem(mql.matches ? 'dark' : 'light')
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [setSystem])

  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark')
    } else {
      root.removeAttribute(COLOR_SCHEME_ATTRIBUTE)
    }
  }, [resolved])
}

/**
 * 明暗の選択と、解決後の値を返す。
 *
 * @example
 * ```tsx
 * const { colorScheme, setColorScheme, resolved } = useColorScheme()
 * ```
 */
export function useColorScheme(): {
  colorScheme: ColorScheme
  setColorScheme: (value: ColorScheme) => void
  resolved: ResolvedColorScheme
} {
  const colorScheme = useAtomValue(colorSchemeAtom)
  const setColorScheme = useSetAtom(colorSchemeAtom)
  const resolved = useAtomValue(resolvedColorSchemeAtom)
  return { colorScheme, setColorScheme, resolved }
}
