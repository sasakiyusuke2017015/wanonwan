"use client";

import Link from "next/link";
import { useRouter, usePathname as useNextPathname } from "next/navigation";
import type { RouterAdapter, LinkProps } from "@ui-catalog/core/hooks/router";

// @ui-catalog の router 抽象（useLink / useNavigate / usePathname）を Next.js App Router に橋渡しする。
// これにより InternalLink / Breadcrumb 等の router 依存コンポーネントが wanonwan でも動く。
function AdapterLink({ href, children, ...rest }: LinkProps) {
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

export const nextRouterAdapter: RouterAdapter = {
  Link: AdapterLink,
  useNavigate: () => {
    const router = useRouter();
    return (path, options) => {
      if (options?.replace) router.replace(path);
      else router.push(path);
    };
  },
  usePathname: () => useNextPathname() ?? "/",
};
