"use client";

import { ROLE_LABELS } from "@wanonwan/domain";
import { Icon } from "@ui-catalog/core/atoms";
import { SidebarShell } from "@ui-catalog/core/organisms/SidebarShell";
import { SidebarAccountMenu } from "@ui-catalog/core/organisms/SidebarAccountMenu";
import { useAppShell } from "@ui-catalog/core/templates/AppShell";
import type { IconName } from "@ui-catalog/core/constants";
import { NAV_GROUPS } from "./navItems";
import type { Me, ResolvedNavItem } from "./useNavigationItems";
import { useAccountMenu } from "./useAccountMenu";
import { GuardedLink } from "./GuardedLink";

type Props = {
  items: ResolvedNavItem[];
  me: Me | null;
  isLoading: boolean;
  activeHref: string;
  onOpenTheme: () => void;
};

/** 表示可能な nav 項目を NAV_GROUPS の並びでグループへ写像する（空グループは落とす）。 */
function toSidebarGroups(items: ResolvedNavItem[]) {
  const byId = new Map(items.map((i) => [i.id, i]));
  return NAV_GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    items: g.itemIds
      .map((id) => byId.get(id))
      .filter((i): i is ResolvedNavItem => i !== undefined)
      .map((i) => ({ href: i.href, label: i.label, icon: i.iconName })),
  })).filter((g) => g.items.length > 0);
}

export function AppSidebar({ items, me, isLoading, activeHref, onOpenTheme }: Props) {
  const { sidebarState, toggleSidebar } = useAppShell();
  const collapsed = sidebarState === "collapsed";
  const { sections, onAction, activeRole } = useAccountMenu(me, onOpenTheme);

  return (
    <SidebarShell<IconName>
      groups={toSidebarGroups(items)}
      activeHref={activeHref}
      collapsed={collapsed}
      onToggle={toggleSidebar}
      resolveIcon={(key) => <Icon name={key} size={20} />}
      linkComponent={GuardedLink}
      brand={{ href: "/dashboard", icon: <Icon name="chat" size={20} />, label: "wanonwan" }}
      footer={
        // /me 取得前はアカウント行をスケルトンにする（name/email は必須 string のため、
        // 空文字で描くとイニシャルが "?" の行が一瞬出てしまう）。
        isLoading || !me ? (
          <div className="border-t border-sidebar-border p-3">
            <div className="h-9 animate-pulse rounded-lg bg-sidebar-accent" />
          </div>
        ) : (
          <SidebarAccountMenu
            name={me.name ?? "ユーザー"}
            email={me.email ?? ""}
            badge={activeRole ? ROLE_LABELS[activeRole] : undefined}
            collapsed={collapsed}
            sections={sections}
            onAction={onAction}
          />
        )
      }
    />
  );
}
