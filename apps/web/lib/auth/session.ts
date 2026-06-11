import "server-only";
import { cookies } from "next/headers";
import type { GoTrueSession } from "@waoon/auth";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./constants";

export { ACCESS_COOKIE, REFRESH_COOKIE };

const baseCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 日

export async function setSession(session: GoTrueSession): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.access_token, { ...baseCookie, maxAge: session.expires_in });
  store.set(REFRESH_COOKIE, session.refresh_token, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}
