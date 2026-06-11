"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useState } from "react";

// アプリ全体の Provider。テーマ(Jotai, @ui-catalog の theme atom) + サーバ状態(TanStack Query)。
// シェル(Header/SideNav 等)とテーマ適用は AppFrame → AppLayout が担う。
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}
