import type { MouseEvent } from 'react'

/**
 * 修飾キー付き / 非主ボタンのクリックか (= ブラウザのネイティブ動作に委ねるべきか)。
 *
 * `<a href>` を SPA 遷移に差し替えるとき、通常クリック (主ボタン + 修飾キーなし) だけ
 * `preventDefault` してプログラム遷移に置き換え、Ctrl/⌘/Shift/Alt や中・右クリックは
 * 素通ししてブラウザの別タブ / 新規ウィンドウ等を活かすために使う。
 *
 * app 側 (NavigationProgress のアンカー検知) と同一条件にすることで、進捗バーの
 * 起動判定とリンクの遷移判定の挙動を揃える。
 */
export function isModifiedClick(e: MouseEvent): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
}
