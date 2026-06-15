import { describe, it, expect } from "vitest";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/auth/rate-limit";

function reqWithIp(ip: string) {
  return new Request("http://test/api", { headers: { "x-forwarded-for": ip } });
}

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks with 429 + Retry-After", () => {
    const limit = 3;
    expect(checkRateLimit(reqWithIp("10.0.0.1"), "test-a", limit)).toBeNull();
    expect(checkRateLimit(reqWithIp("10.0.0.1"), "test-a", limit)).toBeNull();
    expect(checkRateLimit(reqWithIp("10.0.0.1"), "test-a", limit)).toBeNull();
    const blocked = checkRateLimit(reqWithIp("10.0.0.1"), "test-a", limit);
    expect(blocked).toBeInstanceOf(NextResponse);
    expect((blocked as NextResponse).status).toBe(429);
    expect((blocked as NextResponse).headers.get("Retry-After")).toBeTruthy();
  });

  it("keys by IP — different IPs have independent buckets", () => {
    expect(checkRateLimit(reqWithIp("10.0.0.2"), "test-b", 1)).toBeNull();
    // same IP, 2nd call over the limit of 1
    expect(checkRateLimit(reqWithIp("10.0.0.2"), "test-b", 1)).not.toBeNull();
    // different IP, independent bucket → allowed
    expect(checkRateLimit(reqWithIp("10.0.0.3"), "test-b", 1)).toBeNull();
  });
});
