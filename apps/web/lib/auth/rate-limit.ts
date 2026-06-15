import "server-only";

import { NextResponse } from "next/server";

// 認証エンドポイント用の簡易レートリミッタ（固定ウィンドウ・プロセス内メモリ）。
//
// 想定: dev / 単一プロセス(next start)。`next start` ではモジュール状態が
// プロセス内で保持されるため有効。**多重インスタンス / サーバーレスでは共有されない**
// ので、本番はエッジ(nginx)や Redis でのレートリミットが本命。これはアプリ層の多層防御。
//
// キーは IP 単位にする。email 単位で絞ると「攻撃者が被害者の email を叩いて
// アカウントをロックする」DoS を招くため採用しない（分散攻撃対策は captcha 等の
// 後続課題）。

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let nextSweep = 0;

// 期限切れバケットを定期的に掃除する（メモリ肥大防止）。
function sweep(now: number): void {
  if (now < nextSweep) return;
  nextSweep = now + 60_000;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export type RateResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

// クライアント IP を推定する。X-Forwarded-For はクライアントが詐称できるため、
// **クライアント由来の XFF を上書きする信頼できる proxy(nginx) 配下** で初めて信頼できる。
// それが無い環境では IP を分散させて回避され得る（その前提で運用する）。
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "リクエストが多すぎます。しばらくしてからお試しください。" },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

const positiveIntEnv = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

// 制限値は env で上書き可（未設定なら既定）。ウィンドウは 60 秒固定。
export const AUTH_RATE_LIMITS = {
  windowMs: 60_000,
  loginPerIp: positiveIntEnv(process.env.RATE_LIMIT_LOGIN_PER_IP, 10),
  refreshPerIp: positiveIntEnv(process.env.RATE_LIMIT_REFRESH_PER_IP, 30),
} as const;

// 認証エンドポイントの rate-limit プリリュードをまとめる。IP 単位（key は `${keyPrefix}:ip:${ip}`）。
// 制限超過なら 429 Response、通過なら null を返す。ウィンドウは AUTH_RATE_LIMITS.windowMs 固定。
export function checkRateLimit(req: Request, keyPrefix: string, limit: number): NextResponse | null {
  const ip = getClientIp(req);
  const result = rateLimit(`${keyPrefix}:ip:${ip}`, limit, AUTH_RATE_LIMITS.windowMs);
  return result.ok ? null : tooManyRequests(result.retryAfterSec);
}
