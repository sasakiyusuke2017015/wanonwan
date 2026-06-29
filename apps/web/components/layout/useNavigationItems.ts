"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { NAV_ITEMS, isNavItemActive, type NavItemDef } from "./navItems";

// /api/v1/auth/me のレスポンス形（email は user.email にネストされる）。
type MeResponse = {
  isAdmin: boolean;
  name: string | null;
  user?: { email?: string | null } | null;
};

export type Me = { isAdmin: boolean; name: string | null; email: string | null };

export type ResolvedNavItem = NavItemDef & { active: boolean };

export type NavigationState = {
  items: ResolvedNavItem[];
  me: Me | null;
  isLoading: boolean;
};

// ロール(admin)と現在パスから表示ナビを解決する。/me は管理画面ガードと同じ query key を共有。
export function useNavigationItems(): NavigationState {
  const pathname = usePathname();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<MeResponse>("/api/v1/auth/me"),
  });

  const isAdmin = data?.isAdmin ?? false;
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => ({
    ...item,
    active: isNavItemActive(item.href, pathname),
  }));

  const me: Me | null = data
    ? { isAdmin: data.isAdmin, name: data.name, email: data.user?.email ?? null }
    : null;

  return { items, me, isLoading };
}
