"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ROLE_LABELS, type UserRole } from "@wanonwan/domain";
import { Icon } from "@ui-catalog/core/atoms";
import type { SidebarAccountMenuSection } from "@ui-catalog/core/organisms/SidebarAccountMenu";
import { useAppToast } from "@ui-catalog/core/providers";
import { ApiError, apiSend } from "@/lib/api/client";
import { useNavigationGuard } from "@/components/navigation/NavigationGuardProvider";
import type { Me } from "./useNavigationItems";

// 視点切替の action id は `role:` 接頭辞で区別する（catalog は id を解釈しない）。
const ROLE_ACTION_PREFIX = "role:";
const ACTION_THEME = "theme";
const ACTION_PASSWORD = "password";
const ACTION_LOGOUT = "logout";

/**
 * アカウントメニューの sections と onAction を組み立てる。
 *
 * Sidebar 下部（デスクトップ）と TopBar（モバイル）の両方が同じ `SidebarAccountMenu` を
 * 使うため、視点切替 / テーマ / PW 変更 / ログアウトの実装はここに一本化する。
 */
export function useAccountMenu(me: Me | null, onOpenTheme: () => void) {
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useAppToast();
  const { guardedNavigate, confirmLeave } = useNavigationGuard();
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const switchRole = useMutation({
    mutationFn: (role: UserRole) =>
      apiSend<{ data: { activeRole: UserRole } }>("/api/v1/auth/active-role", "PUT", { role }),
    onSuccess: (result) => {
      // ナビ / 管理画面ガードは ["me"] を参照しているため invalidate で即時追随する。
      qc.invalidateQueries({ queryKey: ["me"] });
      setRoleError(null);
      showToast(`${ROLE_LABELS[result.data.activeRole]}の視点に切り替えました`, {
        type: "success",
      });
    },
    onError: (e) =>
      setRoleError(e instanceof ApiError ? e.message : "視点の切り替えに失敗しました"),
  });

  async function logout() {
    // 未保存の編集があるときはログアウト前に確認する（セッション破棄後だと引き返せないため）。
    if (!(await confirmLeave())) return;
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const roles = me?.roles ?? [];
  const activeRole = me?.activeRole ?? null;

  const sections: SidebarAccountMenuSection[] = [
    ...(roles.length > 1
      ? [
          {
            id: "roles",
            title: "視点",
            showCheck: true,
            error: roleError,
            items: roles.map((role) => ({
              id: `${ROLE_ACTION_PREFIX}${role}`,
              label: `${ROLE_LABELS[role]}視点`,
              active: role === activeRole,
            })),
          },
        ]
      : []),
    {
      id: "settings",
      items: [
        { id: ACTION_THEME, label: "表示テーマ", icon: <Icon name="sliders" size={18} /> },
        { id: ACTION_PASSWORD, label: "パスワード変更", icon: <Icon name="lock" size={18} /> },
        {
          id: ACTION_LOGOUT,
          label: loggingOut ? "ログアウト中..." : "ログアウト",
          icon: loggingOut ? (
            <Icon preset="spinner" size={18} />
          ) : (
            <Icon name="door-out" size={18} />
          ),
          destructive: true,
          disabled: loggingOut,
        },
      ],
    },
  ];

  function onAction(id: string, { closeMenu }: { closeMenu: () => void }) {
    if (id.startsWith(ROLE_ACTION_PREFIX)) {
      const role = id.slice(ROLE_ACTION_PREFIX.length) as UserRole;
      if (role === activeRole) return;
      // 失敗時は section.error を出したままにしたいので、成功後に閉じる。
      switchRole.mutate(role, { onSuccess: () => closeMenu() });
      return;
    }
    if (id === ACTION_THEME) {
      closeMenu();
      onOpenTheme();
      return;
    }
    if (id === ACTION_PASSWORD) {
      closeMenu();
      guardedNavigate("/change-password");
      return;
    }
    if (id === ACTION_LOGOUT) void logout();
  }

  return { sections, onAction, activeRole };
}
