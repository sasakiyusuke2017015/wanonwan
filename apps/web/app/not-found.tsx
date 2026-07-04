import Link from "next/link";

// 存在しない URL の専用 404。App Router はこのファイルが無いと素の Next.js
// デフォルト画面になるため明示的に定義する。
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-semibold text-gray-400">404</p>
      <h1 className="text-2xl font-bold text-gray-900">ページが見つかりません</h1>
      <p className="text-sm text-gray-600">
        指定された URL のページは存在しないか、移動・削除された可能性があります。
      </p>
      <Link
        href="/dashboard"
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        ダッシュボードへ戻る
      </Link>
    </main>
  );
}
