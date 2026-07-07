"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@ui-catalog/core/templates/Header";
import { SubHeader } from "@ui-catalog/core/templates/SubHeader";
import { Footer } from "@ui-catalog/core/templates/Footer";
import { BackgroundTexture } from "@ui-catalog/core/organisms/BackgroundTexture";
import { BlurFade } from "@ui-catalog/core/organisms/BlurFade";
import { FloatingMenuButton } from "@ui-catalog/core/organisms/FloatingMenuButton";
import { DropdownMenu } from "@ui-catalog/core/organisms/DropdownMenu";
import { MenuItemList } from "@ui-catalog/core/organisms/MenuItemList";
import { Icon } from "@ui-catalog/core/atoms";
import { useDevice } from "@ui-catalog/core/hooks/useDevice";
import { LAYOUT_SIZES, getThemeConfig } from "@ui-catalog/core/constants";
import { useTheme, useBackgroundTheme, DEFAULT_GLOBAL_THEME } from "@ui-catalog/core/infra/theme";
import { useNavigationItems } from "./useNavigationItems";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AppSideNav } from "./AppSideNav";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { SubHeaderSlotProvider } from "./SubHeaderSlot";
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
  const guardedNavigate = useGuardedNavigate();
  const pathname = usePathname();
  const { items, me } = useNavigationItems();
  const [mounted, setMounted] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
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

  // SubHeader はフィルタ展開 (SubHeaderToolbar) で高さが変わる。実高を ResizeObserver で
  // 測り、本文 paddingTop と DataTable の sticky 基準 (--topbar-h) に反映する。
  // SSR / 初回描画は既定の 44px で一致させ、mount 後の実測だけで更新する。
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
  const activeLabel = items.find((i) => i.active)?.label ?? "waoon";
  // 認証ページ全体のタブタイトルを現在セクション名に（"use client" のため document.title 直設定）。
  useDocumentTitle(activeLabel);

  // ナビが 2 件以上のときだけサイドナビ / ハンバーガー / 下部タブを出す（旧踏襲）。
  const showSideNav = items.length > 1;
  const sideShift = showSideNav && sideOpen ? SIDENAV_WIDTH : 0;
  // サイドナビはデスクトップのみ（モバイルは下部タブ）。chrome(SubHeader/Footer) の左寄せも
  // モバイルでは 0 にする。mounted ガードで hydration mismatch を避ける。
  const { isMobile } = useDevice();
  const chromeShift = mounted && isMobile ? 0 : sideShift;

  // 旧 AppHeader 踏襲のパンくず（ダッシュボードを起点 + 現在のセクション）。
  const activeItem = items.find((i) => i.active);
  const crumbs = [{ label: "ホーム", href: "/dashboard" }];
  if (activeItem && activeItem.href !== "/dashboard")
    crumbs.push({ label: activeItem.label, href: activeItem.href });

  return (
    <SubHeaderSlotProvider value={slotContextValue}>
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundTexture theme={background} />

      <Header
        height={HEADER_HEIGHT}
        bgColor={colors.primaryBgColor}
        textColor={colors.primaryContrastText}
        borderColor={colors.primaryBorderColor}
        leftContent={
          <div className="flex items-center gap-3 px-2">
            <Link
              href="/dashboard"
              className="text-base font-bold transition-opacity hover:opacity-80"
              style={{ color: colors.primaryContrastText }}
              onNavigate={(e) => {
                // 未保存ガードに合流（modifier クリック等のネイティブ動作は onNavigate では発火しない）。
                e.preventDefault();
                guardedNavigate("/dashboard");
              }}
            >
              1on1
            </Link>
            {/* パンくずはアプリ層で描画し、リンク遷移を未保存ガードに合流させる
                （catalog Breadcrumb は素の SPA Link のため dirty なフォームから確認なしに離脱してしまう）。 */}
            <nav
              aria-label="breadcrumb"
              className="flex items-center gap-1 text-sm"
              style={{ color: colors.primaryContrastText }}
            >
              {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <span key={c.href} className="flex items-center gap-1">
                    {isLast ? (
                      <span>{c.label}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => guardedNavigate(c.href)}
                        className="transition-opacity hover:opacity-80"
                      >
                        {c.label}
                      </button>
                    )}
                    {!isLast && <span aria-hidden>{">"}</span>}
                  </span>
                );
              })}
            </nav>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-1 px-2">
            <DropdownMenu
              icon="bell"
              menuWidth="w-60"
              primaryContrastText={colors.primaryContrastText}
              menuContent={() => (
                <MenuItemList>
                  <MenuItemList.Item>
                    <span className="text-gray-500">お知らせはありません</span>
                  </MenuItemList.Item>
                </MenuItemList>
              )}
            />
            <HeaderUserMenu
              name={me?.name ?? null}
              email={me?.email ?? null}
              primaryContrastText={colors.primaryContrastText}
              onOpenTheme={() => setThemeOpen(true)}
            />
          </div>
        }
      />

      {/* サブヘッダー: 既定はアクティブ画面名。ページが SubHeaderPortal を使うと
          その内容 (SubHeaderToolbar 等) に置き換わり、高さも実測で本文へ反映される。 */}
      <SubHeader topOffset={HEADER_HEIGHT} leftOffset={chromeShift} innerRef={subHeaderRef}>
        <div ref={setSlotContainer} />
        {!slotClaimed && (
          <div
            className="flex h-11 items-center px-4 text-sm font-medium transition-all duration-300"
            style={{ color: colors.secondaryTextColor }}
          >
            {activeLabel}
          </div>
        )}
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
        className={`flex-grow overflow-y-auto transition-all duration-300 ${
          showSideNav && sideOpen ? "md:pl-9" : ""
        }`}
        style={
          {
            paddingTop: HEADER_HEIGHT + subHeaderH,
            paddingBottom: FOOTER_HEIGHT,
            // DataTable のヘッダ吸着 (position: sticky) の基準。fixed chrome が
            // スクロールポートの上端を覆う高さ = Header + SubHeader 実高。
            "--topbar-h": `${HEADER_HEIGHT + subHeaderH}px`,
          } as CSSProperties
        }
      >
        {/* 旧踏襲: 本文はほぼ全幅（px 余白のみ）。画面遷移ごとに BlurFade で出現（pathname key）。 */}
        <BlurFade key={pathname} className="w-full px-3 pb-24 pt-2 sm:px-5 md:pb-6">
          {children}
        </BlurFade>
      </main>

      <Footer height={FOOTER_HEIGHT} leftOffset={chromeShift}>
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

      <ThemeSettingsModal isOpen={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
    </SubHeaderSlotProvider>
  );
}
