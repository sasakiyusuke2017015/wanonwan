import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const claims = await verifyAccessToken(token);
    return NextResponse.json({ user: { id: claims.sub, email: claims.email, role: claims.role } });
  } catch {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }
}
