import Link from "next/link";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessToken } from "@/lib/auth/session";

// middleware で保護済み（未認証は /login へ）。シェル(AppLayout)内で認証済みユーザーを表示する。
export default async function Home() {
  const token = await getAccessToken();
  const claims = token ? await verifyAccessToken(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">waoon</h1>
        <p className="text-sm text-gray-500">1on1 アンケート / 面談アプリ（再構築）</p>
      </div>
      <p className="text-sm">
        ログイン中: <strong>{claims?.email ?? "(unknown)"}</strong>
      </p>
      <div className="flex gap-4">
        <Link href="/surveys" className="text-sm text-blue-600 underline">
          アンケートに回答
        </Link>
        <Link href="/admin/users" className="text-sm text-blue-600 underline">
          管理画面へ
        </Link>
      </div>
    </div>
  );
}
