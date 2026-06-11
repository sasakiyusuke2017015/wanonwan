import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

// middleware で保護済み（未認証は /login へ）。ここでは認証済み前提でユーザーを表示する。
export default async function Home() {
  const token = await getAccessToken();
  const claims = token ? await verifyAccessToken(token).catch(() => null) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">waoon</h1>
      <p className="text-sm text-gray-500">1on1 アンケート / 面談アプリ（再構築）</p>
      <div className="flex items-center gap-3 rounded border border-gray-200 px-4 py-2">
        <span className="text-sm">
          ログイン中: <strong>{claims?.email ?? "(unknown)"}</strong>
        </span>
        <LogoutButton />
      </div>
    </main>
  );
}
