"use client";

import { usePathname } from "next/navigation";
import { AppShellProvider } from "@ui-catalog/core/templates/AppShell";
import type { SidebarState } from "@ui-catalog/core/templates/AppShell/sidebarState";
import { AppLayout } from "./AppLayout";

// シェルを外すパス。/login・/ui-demo に加え、PW 強制変更ゲートの /change-password も
// シェル（ナビ）を被せない（変更が済むまで他へ遷移させないため）。
const BARE_PATHS = ["/login", "/ui-demo", "/change-password"];

// 認証済みページにのみ AppLayout シェルを被せる。/login 等はそのまま描画する。
// AppShellProvider（Sidebar 開閉状態）も BARE パスには不要なので、シェル経路の中に閉じる。
export function AppFrame({
  children,
  initialSidebarState,
}: {
  children: React.ReactNode;
  initialSidebarState: SidebarState;
}) {
  const pathname = usePathname();
  if (BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <>{children}</>;
  }
  return (
    <AppShellProvider initialState={initialSidebarState}>
      <AppLayout>{children}</AppLayout>
    </AppShellProvider>
  );
}
