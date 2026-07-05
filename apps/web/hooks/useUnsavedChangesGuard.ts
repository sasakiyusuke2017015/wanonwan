"use client";

import { useEffect, useId } from "react";
import { useUnsavedGuard } from "@ui-catalog/core/hooks/ui";
import { useNavigationGuard } from "@/components/navigation/NavigationGuardProvider";

// フォームが「未保存変更あり」を宣言するためのフック。
// - catalog useUnsavedGuard: タブ閉じ / リロードの beforeunload 警告
// - NavigationGuard へ dirty を登録: アプリ内 SPA 遷移（サイドナビ等）で確認を出す
// 保存成功でフォームが baseline をリセットして isDirty=false にすると、以降は素通りする。
export function useUnsavedChangesGuard(isDirty: boolean): void {
  useUnsavedGuard(isDirty);
  const { setBlocker, removeBlocker } = useNavigationGuard();
  const id = useId();
  useEffect(() => {
    setBlocker(id, isDirty);
    return () => removeBlocker(id);
  }, [id, isDirty, setBlocker, removeBlocker]);
}
