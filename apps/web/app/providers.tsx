"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { RouterProvider } from "@ui-catalog/core/hooks/router";
import { useState } from "react";
import { ToastProvider } from "@ui-catalog/core/providers";
import { useApplyColorScheme } from "@ui-catalog/core/infra/theme";
import { nextRouterAdapter } from "@/components/router/nextRouterAdapter";
import { NavigationGuardProvider } from "@/components/navigation/NavigationGuardProvider";

// 明暗（light/dark/system）を <html data-theme-mode> へ反映し、OS 設定の変化を購読する。
// JotaiProvider の内側でなければ atom を読めないため、子コンポーネントに切り出す。
function ColorSchemeApplier() {
  useApplyColorScheme();
  return null;
}

// アプリ全体の Provider。テーマ(Jotai, @ui-catalog の theme atom) + サーバ状態(TanStack Query)
// + @ui-catalog の router 抽象を Next.js に橋渡しする RouterProvider
// + 共有 Toast(ToastProvider)。Toast をここに置くことで、保存成功 → router.push の
// ルート遷移をまたいで通知が表示され続ける。
// シェル(Header/SideNav 等)とテーマ適用は AppFrame → AppLayout が担う。
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider>
      <ColorSchemeApplier />
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={nextRouterAdapter}>
          <ToastProvider>
            <NavigationGuardProvider>{children}</NavigationGuardProvider>
          </ToastProvider>
        </RouterProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
