"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "@wanonwan/domain";
import { apiGet } from "@/lib/api/client";
import { NAV_ITEMS, isNavItemActive, type NavItemDef } from "./navItems";

// /api/v1/auth/me のレスポンス形（email は user.email にネスト。user.role は GoTrue JWT の
// role で業務ロールとは別物。業務ロールはトップレベル roles / activeRole）。
type MeResponse = {
  isAdmin: boolean;
  name: string | null;
  roles: UserRole[];
  activeRole: UserRole;
  user?: { email?: string | null } | null;
};

export type Me = {
  isAdmin: boolean;
  name: string | null;
  email: string | null;
  roles: UserRole[];
  activeRole: UserRole;
};

export type ResolvedNavItem = NavItemDef & { active: boolean };

export type NavigationState = {
  items: ResolvedNavItem[];
  me: Me | null;
  isLoading: boolean;
};

// アクティブロール（視点）と現在パスから表示ナビを解決する。出し分けは表示のみで、
// 認可は API + RLS が保有ロールで判定する。/me は管理画面ガードと同じ query key を共有。
export function useNavigationItems(): NavigationState {
  const pathname = usePathname();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<MeResponse>("/api/v1/auth/me"),
  });

  const activeRole = data?.activeRole;
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (activeRole != null && item.roles.includes(activeRole)),
  ).map((item) => ({
    ...item,
    active: isNavItemActive(item.href, pathname),
  }));

  const me: Me | null = data
    ? {
        isAdmin: data.isAdmin,
        name: data.name,
        email: data.user?.email ?? null,
        roles: data.roles ?? [],
        activeRole: data.activeRole,
      }
    : null;

  return { items, me, isLoading };
}
