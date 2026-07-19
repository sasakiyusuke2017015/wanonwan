"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ROLE_LABELS, type UserRole } from "@waoon/domain";
import { DropdownMenu } from "@ui-catalog/core/organisms/DropdownMenu";
import { MenuItemList } from "@ui-catalog/core/organisms/MenuItemList";
import { BlurFade } from "@ui-catalog/core/organisms/BlurFade";
import { Icon } from "@ui-catalog/core/atoms";
import { useAppToast } from "@ui-catalog/core/providers";
import { ApiError, apiSend } from "@/lib/api/client";
import { useNavigationGuard } from "@/components/navigation/NavigationGuardProvider";

type Props = {
  name: string | null;
  email?: string | null;
  /** 保有ロール（切替候補）。2 つ以上のときだけ視点切替を出す */
  roles?: readonly UserRole[];
  activeRole?: UserRole | null;
  primaryContrastText: string;
  onOpenTheme: () => void;
};

// 旧 1on1 踏襲: ヘッダー右のユーザーメニュー。person アイコンの DropdownMenu に
// 視点切替 / テーマ設定 / パスワード変更 / ログアウトを集約し、各項目を BlurFade で
// 段差フェードインさせる。視点切替は表示状態のみで認可には影響しない（認可は API + RLS）。
export function HeaderUserMenu({
  name,
  email,
  roles = [],
  activeRole = null,
  primaryContrastText,
  onOpenTheme,
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useAppToast();
  const { guardedNavigate, confirmLeave } = useNavigationGuard();
  const [loggingOut, setLoggingOut] = useState(false);

  const switchRole = useMutation({
    mutationFn: (role: UserRole) =>
      apiSend<{ data: { activeRole: UserRole } }>("/api/v1/auth/active-role", "PUT", { role }),
    onSuccess: (result) => {
      // ナビ / 管理画面ガードは ["me"] を参照しているため invalidate で即時追随する。
      qc.invalidateQueries({ queryKey: ["me"] });
      showToast(`${ROLE_LABELS[result.data.activeRole]}の視点に切り替えました`, {
        type: "success",
      });
    },
    onError: (e) =>
      showToast(e instanceof ApiError ? e.message : "視点の切り替えに失敗しました", {
        type: "error",
      }),
  });

  async function logout() {
    // 未保存の編集があるときはログアウト前に確認する（セッション破棄後だと引き返せないため先に確認）。
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

  return (
    <DropdownMenu
      label={name ?? undefined}
      icon="person"
      menuWidth="w-64"
      primaryContrastText={primaryContrastText}
      menuContent={(closeMenu: () => void) => (
        <MenuItemList
          menuHeader={
            <div>
              {name && <p className="text-sm font-medium text-gray-900">{name}</p>}
              {email && <p className="mt-0.5 text-xs text-gray-500">{email}</p>}
            </div>
          }
          onClose={closeMenu}
        >
          {/* 視点切替: 複数ロール保有者のみ。選択中は check アイコンで示す */}
          {roles.length > 1 &&
            roles.map((role, i) => (
              <MenuItemList.Item
                key={role}
                preventClose={role === activeRole}
                onClick={() => {
                  if (role !== activeRole) switchRole.mutate(role);
                }}
              >
                <BlurFade delay={0.05 + i * 0.05}>
                  <div className="flex items-center gap-2">
                    <Icon
                      name={role === activeRole ? "check" : "employee"}
                      size={20}
                      hover="auto"
                    />
                    <span>
                      {ROLE_LABELS[role]}視点
                      {role === activeRole && (
                        <span className="ml-1 text-xs text-gray-500">（選択中）</span>
                      )}
                    </span>
                  </div>
                </BlurFade>
              </MenuItemList.Item>
            ))}

          <MenuItemList.Item onClick={onOpenTheme}>
            <BlurFade delay={0.1}>
              <div className="flex items-center gap-2">
                <Icon name="sliders" size={20} hover="auto" />
                <span>表示テーマ</span>
              </div>
            </BlurFade>
          </MenuItemList.Item>

          <MenuItemList.Item onClick={() => guardedNavigate("/change-password")}>
            <BlurFade delay={0.15}>
              <div className="flex items-center gap-2">
                <Icon name="lock" size={20} hover="auto" />
                <span>パスワード変更</span>
              </div>
            </BlurFade>
          </MenuItemList.Item>

          <MenuItemList.Item preventClose onClick={logout}>
            <BlurFade delay={0.2}>
              <div className="flex items-center gap-2">
                {loggingOut ? (
                  <>
                    <Icon preset="spinner" size={20} />
                    <span>ログアウト中...</span>
                  </>
                ) : (
                  <>
                    <Icon name="door-out" size={20} hover="auto" />
                    <span>ログアウト</span>
                  </>
                )}
              </div>
            </BlurFade>
          </MenuItemList.Item>
        </MenuItemList>
      )}
    />
  );
}
