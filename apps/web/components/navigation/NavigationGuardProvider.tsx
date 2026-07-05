"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@ui-catalog/core/organisms/ConfirmDialog";

// 未保存離脱ガードの中枢。アプリ内 SPA 遷移（router.push 由来）を choke point に集約し、
// dirty なフォームがあるときは ConfirmDialog（await 型）で確認してから遷移する。
// catalog は beforeunload のみ担当（useUnsavedGuard）。Next 依存の遷移傍受はここ（apps 層）。
type NavigationGuardContextValue = {
  /** フォームが自身の dirty 状態を登録/更新する（id はフォーム単位で一意）。 */
  setBlocker: (id: string, isDirty: boolean) => void;
  /** フォームのアンマウント時に登録を外す。 */
  removeBlocker: (id: string) => void;
  /** ガード付き遷移。dirty なら確認してから push/replace する。 */
  guardedNavigate: (path: string, options?: { replace?: boolean }) => void;
  /** 離脱してよいか確認する。dirty でなければ即 true。素の <Link> の onNavigate 等から使う。 */
  confirmLeave: () => Promise<boolean>;
};

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const blockersRef = useRef<Map<string, boolean>>(new Map());
  const [blocked, setBlocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const resolverRef = useRef<((leave: boolean) => void) | null>(null);
  // 確認中の Promise。popstate 連打 / logout など複数経路から confirmLeave が呼ばれても
  // 同じダイアログ・同じ Promise を共有し、resolver 上書きで先行 Promise が宙吊りになるのを防ぐ。
  const pendingRef = useRef<Promise<boolean> | null>(null);

  const isBlockedNow = useCallback(
    () => Array.from(blockersRef.current.values()).some(Boolean),
    [],
  );
  const recompute = useCallback(() => setBlocked(isBlockedNow()), [isBlockedNow]);

  const setBlocker = useCallback(
    (id: string, isDirty: boolean) => {
      blockersRef.current.set(id, isDirty);
      recompute();
    },
    [recompute],
  );
  const removeBlocker = useCallback(
    (id: string) => {
      blockersRef.current.delete(id);
      recompute();
    },
    [recompute],
  );

  // dirty でなければ即 true。dirty なら ConfirmDialog を開き、確定/取消で解決する Promise を返す。
  // 既に確認中なら新しい resolver を作らず in-flight の Promise をそのまま返す（多重呼び出し安全）。
  const confirmLeave = useCallback((): Promise<boolean> => {
    if (!isBlockedNow()) return Promise.resolve(true);
    if (pendingRef.current) return pendingRef.current;
    const promise = new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
    pendingRef.current = promise;
    setDialogOpen(true);
    return promise;
  }, [isBlockedNow]);

  const settle = useCallback((leave: boolean) => {
    setDialogOpen(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    pendingRef.current = null;
    resolve?.(leave);
  }, []);

  const guardedNavigate = useCallback(
    async (path: string, options?: { replace?: boolean }) => {
      if (!(await confirmLeave())) return;
      if (options?.replace) router.replace(path);
      else router.push(path);
    },
    [confirmLeave, router],
  );

  // ブラウザの戻る/進む（popstate）。dirty の間はセンチネル履歴を積んでおき、戻る操作で
  // 一旦ページに留めたまま確認する。確定時は実際に戻り、取消時はセンチネルを積み直して留まる。
  useEffect(() => {
    if (!blocked) return;
    window.history.pushState(null, "", window.location.href);
    let confirming = false;
    const onPopState = () => {
      // ダイアログ表示中の追加 back はセンチネルを積み直して無効化する
      // （resolver 上書き / センチネル貫通による確認なし離脱を防ぐ）。
      if (confirming) {
        window.history.pushState(null, "", window.location.href);
        return;
      }
      confirming = true;
      confirmLeave().then((leave) => {
        confirming = false;
        if (leave) {
          window.removeEventListener("popstate", onPopState);
          window.history.back();
        } else {
          window.history.pushState(null, "", window.location.href);
        }
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [blocked, confirmLeave]);

  const value = useMemo(
    () => ({ setBlocker, removeBlocker, guardedNavigate, confirmLeave }),
    [setBlocker, removeBlocker, guardedNavigate, confirmLeave],
  );

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      <ConfirmDialog
        isOpen={dialogOpen}
        title="編集中の内容が保存されていません"
        message="このページを離れると、入力した内容は失われます。移動してよろしいですか？"
        confirmText="移動する"
        cancelText="編集を続ける"
        type="warning"
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard(): NavigationGuardContextValue {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within <NavigationGuardProvider>");
  }
  return context;
}
