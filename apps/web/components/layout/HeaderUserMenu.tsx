"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "@ui-catalog/core/organisms/DropdownMenu";
import { MenuItemList } from "@ui-catalog/core/organisms/MenuItemList";
import { BlurFade } from "@ui-catalog/core/organisms/BlurFade";
import { Icon } from "@ui-catalog/core/atoms";
import { useNavigationGuard } from "@/components/navigation/NavigationGuardProvider";

type Props = {
  name: string | null;
  email?: string | null;
  primaryContrastText: string;
  onOpenTheme: () => void;
};

// 旧 1on1 踏襲: ヘッダー右のユーザーメニュー。person アイコンの DropdownMenu に
// テーマ設定 / パスワード変更 / ログアウトを集約し、各項目を BlurFade で段差フェードインさせる。
export function HeaderUserMenu({ name, email, primaryContrastText, onOpenTheme }: Props) {
  const router = useRouter();
  const { guardedNavigate, confirmLeave } = useNavigationGuard();
  const [loggingOut, setLoggingOut] = useState(false);

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
