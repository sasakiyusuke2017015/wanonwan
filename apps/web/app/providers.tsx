"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useState } from "react";

// アプリ全体の Provider。テーマ(Jotai) + サーバ状態(TanStack Query)。
// 旧 1on1 の ThemeRoot 相当はテーマ実装時にここへ載せる。
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}
