/**
 * 明暗の FOUC 対策（pre-paint script）
 *
 * **React に依存しない**モジュールとして切り出している。Server Component
 * （Next.js の layout.tsx）が `<head>` へ埋め込むために import するため、
 * hooks を含む colorScheme.ts と同居させると Server Component 側で
 * 「hooks を使うモジュールを import している」というビルドエラーになる。
 */

import { THEME_STORAGE_KEYS } from './types'

/** `<html>` に付ける属性名。tokens.css のセレクタと対で変更すること。 */
export const COLOR_SCHEME_ATTRIBUTE = 'data-theme-mode'

/** OS の明暗設定を問い合わせるメディアクエリ。 */
export const COLOR_SCHEME_DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * paint 前に `<html>` へ `data-theme-mode` を付与するスクリプト。
 *
 * Jotai は hydration 後にしか値を持てないため、これが無いとリロードのたびに
 * 明色が一瞬描画される（FOUC）。localStorage と `matchMedia` を直接読み、
 * React より前に属性を確定させる。
 *
 * `<head>` に `<script dangerouslySetInnerHTML>` で同期実行する前提。
 * 失敗しても握り潰す（属性が付かなければ light にフォールバックするだけで、
 * ここで例外を投げるとページ全体が描画されないため）。
 */
export const COLOR_SCHEME_PRE_PAINT_SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEYS.COLOR_SCHEME)});
s=s?JSON.parse(s):'system';
var d=s==='dark'||(s==='system'&&window.matchMedia&&window.matchMedia(${JSON.stringify(COLOR_SCHEME_DARK_QUERY)}).matches);
if(d)document.documentElement.setAttribute(${JSON.stringify(COLOR_SCHEME_ATTRIBUTE)},'dark');
}catch(e){}})()`
