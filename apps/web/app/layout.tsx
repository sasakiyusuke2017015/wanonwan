import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppFrame } from "@/components/layout/AppFrame";

export const metadata: Metadata = {
  title: { default: "waoon", template: "%s ｜ waoon" },
  description: "1on1 アンケート / 面談アプリ（再構築）",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
