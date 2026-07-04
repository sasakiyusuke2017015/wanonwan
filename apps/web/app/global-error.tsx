"use client";

// root layout ごと落ちたときの最終エラー境界。Next.js が root layout の代わりに
// マウントするため <html>/<body> を自前で描画する。この時点で Providers / テーマ /
// catalog は生きている保証がないので、素の Tailwind のみで完結させる。
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">問題が発生しました</h1>
          <p className="mt-2 text-sm text-gray-600">
            画面の表示中にエラーが発生しました。お手数ですが、もう一度お試しください。
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-gray-400">エラー ID: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
