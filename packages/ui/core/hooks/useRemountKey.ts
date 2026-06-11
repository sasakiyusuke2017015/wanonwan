import { useState, useCallback } from 'react';

/**
 * コンポーネント再マウント用のkeyを管理するフック
 *
 * @returns key - React keyとして使用する数値
 * @returns remount - keyをインクリメントして再マウントをトリガーする関数
 *
 * @example
 * ```tsx
 * const { key, remount } = useRemountKey();
 *
 * return (
 *   <>
 *     <button onClick={remount}>再生</button>
 *     <Animated key={key}>...</Animated>
 *   </>
 * );
 * ```
 */
export const useRemountKey = () => {
  const [key, setKey] = useState(0);
  const remount = useCallback(() => setKey((k) => k + 1), []);

  return { key, remount };
};
