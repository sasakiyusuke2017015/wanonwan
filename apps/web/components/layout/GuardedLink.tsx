"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";

// catalog の linkComponent スロットは href に string しか渡さない。UrlObject を許すと
// guardedNavigate へ "[object Object]" が流れるため、型で string に縛る。
type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * 未保存ガードに合流する Link。catalog の `linkComponent` スロット
 * （SidebarNav / SidebarShell）へ差し込んで使う。
 *
 * `onNavigate` は修飾キークリック / 中クリックでは発火しないため、別タブで開く操作は
 * ブラウザのネイティブ動作に委ねたまま、通常クリックだけをガード経路へ寄せられる。
 */
export function GuardedLink({ href, ...rest }: Props) {
  const guardedNavigate = useGuardedNavigate();
  return (
    <Link
      href={href}
      onNavigate={(e) => {
        e.preventDefault();
        guardedNavigate(typeof href === "string" ? href : String(href));
      }}
      {...rest}
    />
  );
}
