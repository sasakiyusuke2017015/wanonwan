"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@ui-catalog/core/templates/Header";
import { SubHeader } from "@ui-catalog/core/templates/SubHeader";
import { SideNav } from "@ui-catalog/core/templates/SideNav";
import { Footer } from "@ui-catalog/core/templates/Footer";
import { BackgroundTexture } from "@ui-catalog/core/organisms/BackgroundTexture";
import { NavItem } from "@ui-catalog/core/molecules";
import { Icon } from "@ui-catalog/core/atoms";
import { useTheme, useBackgroundTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { getThemeConfig } from "@ui-catalog/core/constants";
import { LogoutButton } from "@/app/logout-button";
import { useNavigationItems } from "./useNavigationItems";
import { ThemeSettingsModal } from "./ThemeSettingsModal";

const HEADER_HEIGHT = 56;
const SUBHEADER_HEIGHT = 44;
const SIDENAV_WIDTH = 240;
const FOOTER_HEIGHT = 36;

// SSR は既定テーマ、クライアント初期描画も既定テーマで一致させ、mount 後に保存テーマへ切り替える
// （localStorage 由来のテーマで hydration mismatch を起こさないため）。既定値は ui-catalog の単一ソースを参照。
const DEFAULT_THEME = getThemeConfig(DEFAULT_GLOBAL_THEME.colorTheme, DEFAULT_GLOBAL_THEME.shapeTheme);
const DEFAULT_BACKGROUND = DEFAULT_GLOBAL_THEME.backgroundTheme;

// アプリ共通シェル。@ui-catalog の templates(Header/SubHeader/SideNav/Footer) + テーマで chrome を構成する。
// /login など未認証ページは AppFrame 側でこのシェルを外す。
export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { items, me } = useNavigationItems();
  const [mounted, setMounted] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const liveTheme = useTheme();
  const [liveBackground] = useBackgroundTheme();

  useEffect(() => setMounted(true), []);

  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;
  const background = mounted ? liveBackground : DEFAULT_BACKGROUND;
  const activeLabel = items.find((i) => i.active)?.label ?? "waoon";

  const navList = (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          iconName={item.iconName}
          selected={item.active}
          accentColor="green"
          onClick={() => router.push(item.href)}
        />
      ))}
    </nav>
  );

  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundTexture theme={background} />

      <Header
        height={HEADER_HEIGHT}
        bgColor={colors.primaryBgColor}
        textColor={colors.primaryContrastText}
        borderColor={colors.primaryBorderColor}
        leftContent={
          <span className="px-2 text-base font-bold" style={{ color: colors.primaryContrastText }}>
            waoon
          </span>
        }
        rightContent={
          <div className="flex items-center gap-3 px-2">
            {me?.name && (
              <span
                className="hidden text-sm sm:inline"
                style={{ color: colors.primaryContrastText }}
              >
                {me.name}
              </span>
            )}
            <button
              type="button"
              aria-label="表示テーマ"
              onClick={() => setThemeOpen(true)}
              className="rounded p-1.5"
              style={{ color: colors.primaryContrastText }}
            >
              <Icon name="gear" size={20} />
            </button>
            <LogoutButton />
          </div>
        }
      />

      <SubHeader topOffset={HEADER_HEIGHT}>
        <div
          className="flex h-11 items-center px-4 text-sm font-medium"
          style={{ color: colors.secondaryTextColor }}
        >
          {activeLabel}
        </div>
      </SubHeader>

      {/* デスクトップ: 左サイドナビ。モバイルは下部タブバーへ。 */}
      <SideNav
        className="hidden md:block"
        width={SIDENAV_WIDTH}
        topOffset={HEADER_HEIGHT + SUBHEADER_HEIGHT}
        isOpen
        bgColor={colors.secondaryBgColor}
      >
        {navList}
      </SideNav>

      <main
        className="flex-grow pb-24 md:pb-12 md:pl-60"
        style={{ paddingTop: HEADER_HEIGHT + SUBHEADER_HEIGHT }}
      >
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">{children}</div>
      </main>

      <Footer height={FOOTER_HEIGHT} leftOffset={0}>
        <div
          className="flex h-9 items-center justify-center text-xs"
          style={{ color: colors.secondaryTextColor }}
        >
          waoon — 1on1 アンケート / 面談
        </div>
      </Footer>

      {/* モバイル: 下部タブバー。 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t md:hidden"
        style={{
          backgroundColor: colors.secondaryBgColor,
          borderColor: colors.secondaryBorderColor,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(item.href)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]"
            style={{
              color: item.active ? colors.primaryBgColor : colors.secondaryTextColor,
              borderRadius: shapes.buttonRadius,
            }}
          >
            <Icon name={item.iconName} size={20} />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <ThemeSettingsModal isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
