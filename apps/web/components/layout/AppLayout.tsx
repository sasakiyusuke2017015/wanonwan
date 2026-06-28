"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@ui-catalog/core/templates/Header";
import { SubHeader } from "@ui-catalog/core/templates/SubHeader";
import { Footer } from "@ui-catalog/core/templates/Footer";
import { BackgroundTexture } from "@ui-catalog/core/organisms/BackgroundTexture";
import { BlurFade } from "@ui-catalog/core/organisms/BlurFade";
import { FloatingMenuButton } from "@ui-catalog/core/organisms/FloatingMenuButton";
import { Icon } from "@ui-catalog/core/atoms";
import { LAYOUT_SIZES, getThemeConfig } from "@ui-catalog/core/constants";
import { useTheme, useBackgroundTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { useNavigationItems } from "./useNavigationItems";
import { AppSideNav } from "./AppSideNav";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { ThemeSettingsModal } from "./ThemeSettingsModal";

const HEADER_HEIGHT = LAYOUT_SIZES.HEADER_HEIGHT;
const SUBHEADER_HEIGHT = 44;
const SIDENAV_WIDTH = LAYOUT_SIZES.LEFT_PANE_WIDTH;
const FOOTER_HEIGHT = LAYOUT_SIZES.FOOTER_HEIGHT;
const BOTTOM_TAB_HEIGHT = LAYOUT_SIZES.BOTTOM_TAB_HEIGHT;

// SSR は既定テーマ、クライアント初期描画も既定テーマで一致させ、mount 後に保存テーマへ切り替える
// （localStorage 由来のテーマで hydration mismatch を起こさないため）。既定値は ui-catalog の単一ソースを参照。
const DEFAULT_THEME = getThemeConfig(DEFAULT_GLOBAL_THEME.colorTheme, DEFAULT_GLOBAL_THEME.shapeTheme);
const DEFAULT_BACKGROUND = DEFAULT_GLOBAL_THEME.backgroundTheme;

// 旧 1on1 踏襲のアプリ共通シェル。
// - サイドナビは折りたたみ式アイコンレール（FloatingMenuButton で開閉、本文が transition で寄る）
// - ヘッダー右はユーザーメニュー（テーマ / PW変更 / ログアウトを集約、各項目を BlurFade）
// - 本文は h-screen 内で内側スクロール（chrome は position:fixed）
// /login など未認証ページは AppFrame 側でこのシェルを外す。
export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { items, me } = useNavigationItems();
  const [mounted, setMounted] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);
  const liveTheme = useTheme();
  const [liveBackground] = useBackgroundTheme();

  useEffect(() => setMounted(true), []);

  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;
  const background = mounted ? liveBackground : DEFAULT_BACKGROUND;
  const activeLabel = items.find((i) => i.active)?.label ?? "waoon";

  // ナビが 2 件以上のときだけサイドナビ / ハンバーガー / 下部タブを出す（旧踏襲）。
  const showSideNav = items.length > 1;
  const sideShift = showSideNav && sideOpen ? SIDENAV_WIDTH : 0;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
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
          <div className="flex items-center px-2">
            <HeaderUserMenu
              name={me?.name ?? null}
              email={me?.email ?? null}
              primaryContrastText={colors.primaryContrastText}
              onOpenTheme={() => setThemeOpen(true)}
            />
          </div>
        }
      />

      {/* サブヘッダー: 現在はアクティブ画面名のみ。タブ / パンくず供給は各画面側で別途。 */}
      <SubHeader topOffset={HEADER_HEIGHT} leftOffset={sideShift}>
        <div
          className="flex h-11 items-center px-4 text-sm font-medium transition-all duration-300"
          style={{ color: colors.secondaryTextColor }}
        >
          {activeLabel}
        </div>
      </SubHeader>

      {showSideNav && (
        <AppSideNav
          items={items}
          isOpen={sideOpen}
          width={SIDENAV_WIDTH}
          topOffset={HEADER_HEIGHT}
          colors={colors}
        />
      )}

      {/* デスクトップ: サイドナビ開閉ハンバーガー。モバイルは下部タブのため非表示。 */}
      {showSideNav && (
        <div className="hidden md:block">
          <FloatingMenuButton
            isOpen={sideOpen}
            onToggle={() => setSideOpen((v) => !v)}
            position="bottom-left"
            backgroundColor={colors.primaryBgColor}
            borderColor={colors.primaryBorderColor}
            color={colors.primaryContrastText}
            openIcon="hamburger"
            closeIcon="x"
          />
        </div>
      )}

      <main
        className="flex-grow overflow-y-auto transition-all duration-300"
        style={{
          paddingTop: HEADER_HEIGHT + SUBHEADER_HEIGHT,
          paddingBottom: FOOTER_HEIGHT,
          paddingLeft: sideShift,
        }}
      >
        {/* 旧踏襲: 画面遷移ごとに本文を BlurFade で出現させる（pathname を key に再マウント）。 */}
        <BlurFade key={pathname} className="mx-auto w-full max-w-5xl p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </BlurFade>
      </main>

      <Footer height={FOOTER_HEIGHT} leftOffset={sideShift}>
        <div
          className="flex h-full items-center justify-center text-xs transition-all duration-300"
          style={{ color: colors.secondaryTextColor }}
        >
          waoon — 1on1 アンケート / 面談
        </div>
      </Footer>

      {/* モバイル: 下部タブバー。 */}
      {showSideNav && (
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t md:hidden"
          style={{
            height: BOTTOM_TAB_HEIGHT,
            backgroundColor: colors.primaryBgColor,
            borderColor: colors.primaryBorderColor,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.href)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors"
              style={{
                color: item.active ? colors.navActiveTextColor : colors.primaryContrastText,
                backgroundColor: item.active ? colors.navActiveBgColor : undefined,
                borderRadius: shapes.buttonRadius,
              }}
            >
              <Icon name={item.iconName} size={20} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <ThemeSettingsModal isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
