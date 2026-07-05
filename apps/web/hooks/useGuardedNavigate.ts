"use client";

import { useNavigationGuard } from "@/components/navigation/NavigationGuardProvider";

// router.push / router.replace の代わりに使う、未保存ガード付きの遷移関数を返す。
// dirty なフォームがあるときは ConfirmDialog で確認してから遷移する。
export function useGuardedNavigate() {
  return useNavigationGuard().guardedNavigate;
}
