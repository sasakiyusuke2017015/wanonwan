import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  SIDEBAR_STATE_COOKIE,
  parseSidebarState,
} from "@ui-catalog/core/templates/AppShell/sidebarState";
import { Providers } from "./providers";
import { AppFrame } from "@/components/layout/AppFrame";

export const metadata: Metadata = {
  title: { default: "waoon", template: "%s ｜ waoon" },
  description: "1on1 アンケート / 面談アプリ（再構築）",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Sidebar の開閉状態を SSR 時点で解決し、初期描画から正しい幅で出す
  // （クライアント側で復元すると 240px → 64px のガタつきが出る）。
  // これにより全ルートが dynamic rendering になるが、middleware が全ページを認証ゲート
  // しているため静的化の利得は元々無い。
  const sidebarState = parseSidebarState((await cookies()).get(SIDEBAR_STATE_COOKIE)?.value);

  return (
    <html lang="ja">
      <body>
        <Providers>
          <AppFrame initialSidebarState={sidebarState}>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
