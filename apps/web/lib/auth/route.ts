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

// auth/me（独自実装）・auth/change-password（rate-limit を最外に保つため）は本ラッパを使わず、
// それぞれ既存の認証プリミティブを route 本体で直接扱う。force-change bypass の allowlist。
