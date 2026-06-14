"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "./AppLayout";

// シェルを外すパス。/login・/ui-demo に加え、PW 強制変更ゲートの /change-password も
// シェル（ナビ）を被せない（変更が済むまで他へ遷移させないため）。
const BARE_PATHS = ["/login", "/ui-demo", "/change-password"];

// 認証済みページにのみ AppLayout シェルを被せる。/login 等はそのまま描画する。
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <>{children}</>;
  }
  return <AppLayout>{children}</AppLayout>;
}
