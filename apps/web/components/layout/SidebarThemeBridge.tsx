"use client";

import type { CSSProperties } from "react";
import type { ThemeConfig } from "@ui-catalog/core/constants";

type ColorConfig = ThemeConfig["colors"];

/**
 * ui-catalog の sidebar トークン（--sidebar-*）を waoon のテーマ 3 軸へ連動させる。
 *
 * catalog 側 tokens.css の既定は固定のダーク slate で、テーマを切り替えても sidebar だけ
 * 取り残される。ここで現在のテーマ色から同名トークンを上書きし、SidebarShell / SidebarNav /
 * SidebarAccountMenu の Tailwind utility（bg-sidebar 等）を追随させる。
 *
 * 上書きは AppShellRoot 配下の要素に inline で載せる。catalog の既定値は
 * `[data-sidebar-state]` セレクタで宣言されており、`:root` 側からは上書きできないため。
 */
export function sidebarThemeVars(colors: ColorConfig): CSSProperties {
  return {
    "--sidebar": colors.primaryBgColor,
    "--sidebar-foreground": colors.primaryContrastText,
    "--sidebar-border": colors.primaryBorderColor,
    "--sidebar-accent": colors.navHoverBgColor,
    "--sidebar-accent-foreground": colors.navActiveTextColor,
    "--sidebar-primary": colors.accentBgColor,
    "--sidebar-primary-foreground": colors.accentContrastText,
    "--sidebar-ring": colors.focusRingColor,
  } as CSSProperties;
}
