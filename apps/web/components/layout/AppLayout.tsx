"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BackgroundTexture } from "@ui-catalog/core/organisms/BackgroundTexture";
import { BlurFade } from "@ui-catalog/core/organisms/BlurFade";
import { Icon } from "@ui-catalog/core/atoms";
import { LAYOUT_SIZES, getThemeConfig } from "@ui-catalog/core/constants";
import { useTheme, useBackgroundTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { AppShellRoot } from "@ui-catalog/core/templates/AppShell";
import { useNavigationItems } from "./useNavigationItems";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AppSidebar } from "./AppSidebar";
import { AppTopBar } from "./AppTopBar";
import { SubHeaderSlotProvider } from "./SubHeaderSlot";
import { ThemeSettingsModal } from "./ThemeSettingsModal";
import { sidebarThemeVars } from "./SidebarThemeBridge";

const BOTTOM_TAB_HEIGHT = LAYOUT_SIZES.BOTTOM_TAB_HEIGHT;
const SUBHEADER_HEIGHT = 44;

// SSR は既定テーマ、クライアント初期描画も既定テーマで一致させ、mount 後に保存テーマへ切り替える
// （localStorage 由来のテーマで hydration mismatch を起こさないため）。既定値は ui-catalog の単一ソースを参照。
const DEFAULT_THEME = getThemeConfig(DEFAULT_GLOBAL_THEME.colorTheme, DEFAULT_GLOBAL_THEME.shapeTheme);
const DEFAULT_BACKGROUND = DEFAULT_GLOBAL_THEME.backgroundTheme;

// アプリ共通シェル。左 Sidebar (AppShell 基盤) + TopBar + SubHeader 帯 + 本文。
// - Sidebar の開閉状態は AppShellProvider が cookie に持ち、SSR 初期描画から幅が一致する
// - モバイルは Sidebar を出さず、画面下部のタブバーで移動する
// - ページは本文だけでなくページ全体がスクロールする（DataTable の sticky が --topbar-h と
//   --chrome-subheader-h を停留基準に使うため）
// /login など未認証ページは AppFrame 側でこのシェルを外す。
export function AppLayout({ children }: { children: React.ReactNode }) {
  const guardedNavigate = useGuardedNavigate();
  const pathname = usePathname();
  const { items, me, isLoading } = useNavigationItems();
  const [mounted, setMounted] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const liveTheme = useTheme();
  const [liveBackground] = useBackgroundTheme();

  useEffect(() => setMounted(true), []);

  // SubHeader スロット: ページが SubHeaderPortal で chrome にツールバー等を差し込める。
  // claimed の間は既定の画面名表示を隠す。
  const [slotContainer, setSlotContainer] = useState<HTMLDivElement | null>(null);
  const [slotClaimed, setSlotClaimed] = useState(false);
  const slotContextValue = useMemo(
    () => ({ container: slotContainer, setClaimed: setSlotClaimed }),
    [slotContainer],
  );

  // SubHeader 帯はフィルタ展開 (SubHeaderToolbar) で高さが変わる。実高を ResizeObserver で
  // 測り、--chrome-subheader-h として配下へ流す。DataTable の sticky ヘッダはこの値を
  // 停留基準に足し込むので、帯の裏に潜らない。SSR / 初回描画は既定の 44px で一致させる。
  const subHeaderRef = useRef<HTMLDivElement | null>(null);
  const [subHeaderH, setSubHeaderH] = useState(SUBHEADER_HEIGHT);
  useEffect(() => {
    const el = subHeaderRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setSubHeaderH(Math.round(el.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { colors, shapes } = mounted ? liveTheme : DEFAULT_THEME;
  const background = mounted ? liveBackground : DEFAULT_BACKGROUND;
  const activeLabel = items.find((i) => i.active)?.label ?? "wanonwan";
  // 認証ページ全体のタブタイトルを現在セクション名に（"use client" のため document.title 直設定）。
  useDocumentTitle(activeLabel);

  // ナビが 2 件以上のときだけ Sidebar / 下部タブを出す（旧踏襲）。
  const showNav = items.length > 1;

  // 旧 AppHeader 踏襲のパンくず（ダッシュボードを起点 + 現在のセクション）。
  const activeItem = items.find((i) => i.active);
  const crumbs = [{ label: "ホーム", href: "/dashboard" }];
  if (activeItem && activeItem.href !== "/dashboard")
    crumbs.push({ label: activeItem.label, href: activeItem.href });

  return (
    <SubHeaderSlotProvider value={slotContextValue}>
      <AppShellRoot className="relative">
        <BackgroundTexture theme={background} />

        {/* sidebar トークンをテーマ 3 軸へ連動させ、chrome 帯の実高を配下へ流す。
            AppShellRoot は style を受け取らないため、直下のラッパで宣言する。 */}
        <div
          style={{
            ...sidebarThemeVars(colors),
            "--chrome-subheader-h": `${subHeaderH}px`,
          } as React.CSSProperties}
        >
          {showNav && (
            <div className="hidden md:block">
              <AppSidebar
                items={items}
                me={me}
                isLoading={isLoading}
                activeHref={pathname}
                onOpenTheme={() => setThemeOpen(true)}
              />
            </div>
          )}

          <AppTopBar
            crumbs={crumbs}
            colors={colors}
            me={me}
            onOpenTheme={() => setThemeOpen(true)}
          />

          {/* SubHeader 帯: 既定はアクティブ画面名。ページが SubHeaderPortal を使うと
              その内容 (SubHeaderToolbar 等) に置き換わる。TopBar 直下に sticky で貼り付く。 */}
          <div
            ref={subHeaderRef}
            className="fixed right-0 z-20 border-b transition-[left] duration-[var(--shell-transition-duration)] ease-out"
            style={{
              top: "var(--topbar-h)",
              left: "var(--sidebar-w)",
              backgroundColor: colors.secondaryBgColor,
              borderColor: colors.secondaryBorderColor,
            }}
          >
            <div ref={setSlotContainer} />
            {!slotClaimed && (
              <div
                className="flex h-11 items-center px-4 text-sm font-medium"
                style={{ color: colors.secondaryTextColor }}
              >
                {activeLabel}
              </div>
            )}
          </div>

          <main
            className="transition-[padding] duration-[var(--shell-transition-duration)] ease-out"
            style={{
              paddingLeft: "var(--sidebar-w)",
              paddingTop: `calc(var(--topbar-h) + ${subHeaderH}px)`,
            }}
          >
            {/* 旧踏襲: 本文はほぼ全幅（px 余白のみ）。画面遷移ごとに BlurFade で出現（pathname key）。 */}
            <BlurFade key={pathname} className="w-full px-3 pb-24 pt-2 sm:px-5 md:pb-6">
              {children}
            </BlurFade>
          </main>

          {/* モバイル: 下部タブバー。 */}
          {showNav && (
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
                  onClick={() => guardedNavigate(item.href)}
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
        </div>

        <ThemeSettingsModal isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
      </AppShellRoot>
    </SubHeaderSlotProvider>
  );
}
