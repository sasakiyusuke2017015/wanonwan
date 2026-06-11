"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "./AppLayout";

// シェルを外すパス。middleware の PUBLIC_PATHS（未認証で素通りするルート）と揃える。
const BARE_PATHS = ["/login", "/ui-demo"];

// 認証済みページにのみ AppLayout シェルを被せる。/login 等はそのまま描画する。
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <>{children}</>;
  }
  return <AppLayout>{children}</AppLayout>;
}
