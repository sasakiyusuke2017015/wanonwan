"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { RouterProvider } from "@ui-catalog/core/hooks/router";
import { useState } from "react";
import { ToastProvider } from "@ui-catalog/core/providers";
import { nextRouterAdapter } from "@/components/router/nextRouterAdapter";

// アプリ全体の Provider。テーマ(Jotai, @ui-catalog の theme atom) + サーバ状態(TanStack Query)
// + @ui-catalog の router 抽象を Next.js に橋渡しする RouterProvider
// + 共有 Toast(ToastProvider)。Toast をここに置くことで、保存成功 → router.push の
// ルート遷移をまたいで通知が表示され続ける。
// シェル(Header/SideNav 等)とテーマ適用は AppFrame → AppLayout が担う。
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider adapter={nextRouterAdapter}>
          <ToastProvider>{children}</ToastProvider>
        </RouterProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
