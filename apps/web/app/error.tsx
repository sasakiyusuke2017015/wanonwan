"use client";

import Link from "next/link";

// root layout 配下のページエラー境界。シェル(AppFrame)は生きたまま、コンテンツ領域
// だけをエラー表示に差し替える。layout 自体のエラーは global-error.tsx が受ける。
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">エラーが発生しました</h1>
        <p className="mt-2 text-sm text-gray-600">
          ページの表示に失敗しました。再試行しても直らない場合は、時間をおいてお試しください。
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-gray-400">エラー ID: {error.digest}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            再試行
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </div>
  );
}
