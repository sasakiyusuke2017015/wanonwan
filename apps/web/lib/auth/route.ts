import "server-only";
import { NextResponse } from "next/server";
import { getCurrentClaims, forceChangeGuard } from "./current-user";
import type { AuthClaims } from "./jwt";

// 業務ルートの高階ラッパ。claims をラッパ経由でしか得られない形にして、認可ガードの
// 書き忘れ＝認可漏れを構造的に防ぐ。export 関数は (req, ctx) のまま、inner に
// (req, claims, ctx) を渡す。ctx は Next の { params: Promise<…> }（無いルートは未使用）。
type Handler<C> = (req: Request, claims: AuthClaims, ctx: C) => Response | Promise<Response>;

const unauthenticated = () =>
  NextResponse.json({ error: "unauthenticated" }, { status: 401 });

// 業務 API（大多数 + admin ルート）。valid access 必須（401）+ force-change を 403 で弾く。
// admin 判定は各 route の tx 内に残す（ラッパに持ち上げるとラウンドトリップが増えるため）。
export function withActiveUser<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const claims = await getCurrentClaims();
    if (!claims) return unauthenticated();
    const blocked = forceChangeGuard(claims);
    if (blocked) return blocked;
    return handler(req, claims, ctx);
  };
}

// auth/change-password 用。valid access 必須（401）だが force-change は bypass（許可）。
// rate-limit・email 欠落 401・parseBody・service_role は route 本体に残す（順序を保つ）。
export function withSessionUser<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const claims = await getCurrentClaims();
    if (!claims) return unauthenticated();
    return handler(req, claims, ctx);
  };
}
