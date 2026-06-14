import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { verifyAccessToken } from "@/lib/auth/jwt";

// 認証不要のパス（前方一致）
const PUBLIC_PATHS = ["/login", "/ui-demo"];
// パスワード強制変更中でも到達できるページ。
const CHANGE_PASSWORD_PATH = "/change-password";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (token) {
    try {
      const claims = await verifyAccessToken(token);
      // 初回 PW 強制変更フラグが立つユーザーは /change-password へ誘導する
      // （ページ UX 誘導。セキュリティ境界は各 API の forceChangeGuard）。
      if (claims.mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
        const url = req.nextUrl.clone();
        url.pathname = CHANGE_PASSWORD_PATH;
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    } catch {
      // 失効 / 改ざん → ログインへ
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

// API（自前で認証）・静的アセットは除外
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
