import type { UserRole } from "@wanonwan/domain";
import type { IconName } from "@ui-catalog/core/constants";

export type NavItemDef = {
  id: string;
  href: string;
  label: string;
  iconName: IconName;
  /** 表示対象のアクティブロール。省略 = 全ロールで表示。表示の出し分けのみで認可ではない */
  roles?: readonly UserRole[];
};

// アプリ共通のナビゲーション定義。AppLayout の SideNav / BottomTabBar の単一ソース。
// 出し分けはアクティブロール（視点）基準。認可は API + RLS が保有ロールで判定する。
export const NAV_ITEMS: readonly NavItemDef[] = [
  { id: "dashboard", href: "/dashboard", label: "ダッシュボード", iconName: "dashboard" },
  { id: "surveys", href: "/surveys", label: "アンケート", iconName: "survey" },
  { id: "schedule", href: "/schedule", label: "スケジュール", iconName: "calendar" },
  {
    id: "interviews",
    href: "/interviews",
    label: "担当面談",
    iconName: "chat",
    roles: ["interviewer"],
  },
  {
    id: "admin-users",
    href: "/admin/users",
    label: "ユーザー管理",
    iconName: "users-group",
    roles: ["admin"],
  },
  {
    id: "admin-surveys",
    href: "/admin/surveys",
    label: "アンケート管理",
    iconName: "list",
    roles: ["admin"],
  },
  {
    id: "admin-questions",
    href: "/admin/questions",
    label: "設問マスタ",
    iconName: "file",
    roles: ["admin"],
  },
  {
    id: "admin-answers",
    href: "/admin/answers",
    label: "回答・面談",
    iconName: "chat",
    roles: ["admin"],
  },
  {
    id: "admin-org",
    href: "/admin/org",
    label: "組織マスタ",
    iconName: "folder",
    roles: ["admin"],
  },
  {
    id: "admin-positions",
    href: "/admin/positions",
    label: "役職マスタ",
    iconName: "employee",
    roles: ["admin"],
  },
  {
    id: "admin-urgencies",
    href: "/admin/urgencies",
    label: "緊急度マスタ",
    iconName: "info-triangle",
    roles: ["admin"],
  },
];

/** pathname がナビ項目の配下かどうか（href 完全一致 or 配下プレフィックス）。 */
export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type NavGroupDef = {
  id: string;
  label?: string;
  /** このグループに属する NavItemDef.id。NAV_ITEMS に無い id は無視する */
  itemIds: readonly string[];
};

// Sidebar のグループ分け。項目の出し分け自体は useNavigationItems が
// アクティブロール基準で行い、ここは「どの見出しの下に並べるか」だけを持つ。
export const NAV_GROUPS: readonly NavGroupDef[] = [
  {
    id: "general",
    itemIds: ["dashboard", "surveys", "schedule", "interviews"],
  },
  {
    id: "admin",
    label: "管理",
    itemIds: [
      "admin-users",
      "admin-surveys",
      "admin-questions",
      "admin-answers",
      "admin-org",
      "admin-positions",
      "admin-urgencies",
    ],
  },
];
