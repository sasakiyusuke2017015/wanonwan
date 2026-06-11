import type { IconName } from "@ui-catalog/core/constants";

export type NavItemDef = {
  id: string;
  href: string;
  label: string;
  iconName: IconName;
  /** admin のみ表示 */
  adminOnly?: boolean;
};

// アプリ共通のナビゲーション定義。AppLayout の SideNav / BottomTabBar の単一ソース。
export const NAV_ITEMS: readonly NavItemDef[] = [
  { id: "home", href: "/", label: "ホーム", iconName: "home" },
  { id: "surveys", href: "/surveys", label: "アンケート", iconName: "survey" },
  {
    id: "admin-users",
    href: "/admin/users",
    label: "ユーザー管理",
    iconName: "users-group",
    adminOnly: true,
  },
  {
    id: "admin-surveys",
    href: "/admin/surveys",
    label: "アンケート管理",
    iconName: "list",
    adminOnly: true,
  },
  {
    id: "admin-answers",
    href: "/admin/answers",
    label: "回答・面談",
    iconName: "chat",
    adminOnly: true,
  },
];

/** pathname がナビ項目の配下かどうか（href 完全一致 or 配下プレフィックス）。 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
