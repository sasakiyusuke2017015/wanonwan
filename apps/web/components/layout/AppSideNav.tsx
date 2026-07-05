"use client";

import { useCallback, useRef, useState } from "react";
import { SideNav } from "@ui-catalog/core/templates/SideNav";
import { Icon } from "@ui-catalog/core/atoms";
import type { ThemeConfig } from "@ui-catalog/core/constants";
import type { ResolvedNavItem } from "./useNavigationItems";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";

type ColorConfig = ThemeConfig["colors"];

type TooltipState = { id: string; label: string; top: number };

type Props = {
  items: ResolvedNavItem[];
  isOpen: boolean;
  width: number;
  topOffset: number;
  colors: ColorConfig;
};

// 旧 1on1 踏襲: アイコン主体の細い縦レール。ホバーでツールチップ（レール外に fixed 表示）。
// SideNav テンプレートは left を isOpen で出し入れし、scss の transition で開閉アニメする。
export function AppSideNav({ items, isOpen, width, topOffset, colors }: Props) {
  const guardedNavigate = useGuardedNavigate();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleEnter = useCallback((id: string, label: string) => {
    const el = itemRefs.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({ id, label, top: rect.top + rect.height / 2 });
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  return (
    <>
      <SideNav
        className="hidden md:block"
        width={width}
        topOffset={topOffset}
        isOpen={isOpen}
        bgColor={colors.primaryBgColor}
      >
        <nav className="flex flex-col items-stretch py-2">
          {items.map((item) => {
            const hovered = tooltip?.id === item.id && !item.active;
            return (
              <button
                key={item.id}
                type="button"
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                }}
                onClick={() => {
                  handleLeave();
                  guardedNavigate(item.href);
                }}
                onMouseEnter={() => handleEnter(item.id, item.label)}
                onMouseLeave={handleLeave}
                aria-label={item.label}
                className="group flex w-full items-center justify-center py-2.5 transition-all duration-200"
                style={{
                  backgroundColor: item.active
                    ? colors.navActiveBgColor
                    : hovered
                      ? colors.navHoverBgColor
                      : undefined,
                }}
              >
                <Icon
                  name={item.iconName}
                  size={22}
                  fill="none"
                  stroke="currentColor"
                  hover="auto"
                  className="transition-colors duration-200"
                  style={{
                    color: item.active
                      ? colors.navActiveTextColor
                      : hovered
                        ? colors.navHoverTextColor
                        : colors.primaryContrastText,
                  }}
                />
              </button>
            );
          })}
        </nav>
      </SideNav>

      {/* ツールチップ: transform の影響を受けないようレール外に fixed 配置 */}
      {tooltip && isOpen && (
        <div
          className="pointer-events-none fixed z-[10000] hidden whitespace-nowrap rounded px-2 py-1 text-xs text-white shadow-lg md:block"
          style={{
            left: width + 8,
            top: tooltip.top,
            transform: "translateY(-50%)",
            backgroundColor: "rgba(31, 41, 55, 0.95)",
          }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}
