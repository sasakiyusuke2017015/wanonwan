"use client";

import { ROLE_LABELS } from "@wanonwan/domain";
import type { ThemeConfig } from "@ui-catalog/core/constants";
import { DropdownMenu } from "@ui-catalog/core/organisms/DropdownMenu";
import { MenuItemList } from "@ui-catalog/core/organisms/MenuItemList";
import { SidebarAccountMenu } from "@ui-catalog/core/organisms/SidebarAccountMenu";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";
import type { Me } from "./useNavigationItems";
import { useAccountMenu } from "./useAccountMenu";

type ColorConfig = ThemeConfig["colors"];

type Crumb = { label: string; href: string };

type Props = {
  crumbs: Crumb[];
  colors: ColorConfig;
  me: Me | null;
  onOpenTheme: () => void;
};

/**
 * Sidebar の右に置く上部バー。高さは `--topbar-h`、左 offset は `--sidebar-w`。
 *
 * アカウントメニューは Sidebar 下部が正だが、Sidebar を出さない画面幅では到達できなくなる。
 * ここに `placement="topbar"` の同じ部品を `md:hidden` で置いて導線を確保する
 * （sections / onAction は `useAccountMenu` で Sidebar と共有）。
 */
export function AppTopBar({ crumbs, colors, me, onOpenTheme }: Props) {
  const guardedNavigate = useGuardedNavigate();
  const { sections, onAction, activeRole } = useAccountMenu(me, onOpenTheme);

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-[var(--topbar-h)] items-center justify-between border-b px-3 transition-[left] duration-[var(--shell-transition-duration)] ease-out"
      style={{
        left: "var(--sidebar-w)",
        backgroundColor: colors.primaryBgColor,
        borderColor: colors.primaryBorderColor,
        color: colors.primaryContrastText,
      }}
    >
      {/* パンくずはアプリ層で描画し、リンク遷移を未保存ガードに合流させる
          （catalog Breadcrumb は素の SPA Link のため dirty なフォームから確認なしに離脱してしまう）。 */}
      <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={c.href} className="flex items-center gap-1">
              {isLast ? (
                <span className="font-medium">{c.label}</span>
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

      <div className="flex items-center gap-1">
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
        {/* モバイルは Sidebar を出さないため、ここがアカウント操作の唯一の導線になる。 */}
        {me && (
          <div className="md:hidden">
            <SidebarAccountMenu
              placement="topbar"
              name={me.name ?? "ユーザー"}
              email={me.email ?? ""}
              badge={activeRole ? ROLE_LABELS[activeRole] : undefined}
              sections={sections}
              onAction={onAction}
            />
          </div>
        )}
      </div>
    </header>
  );
}
