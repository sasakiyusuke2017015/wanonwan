"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 12) {
      setError("新しいパスワードは12文字以上にしてください");
      return;
    }
    if (newPassword !== confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { reauth?: boolean };
      // 再ログインに失敗した場合（reauth）はログイン画面へ。通常はそのままトップへ。
      if (data.reauth) {
        router.replace("/login");
      } else {
        router.replace("/");
        router.refresh();
      }
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "パスワードの変更に失敗しました");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">パスワードの変更</h1>
        <p className="text-sm text-gray-600">
          現在のパスワードを入力し、新しいパスワードを設定してください。
        </p>
        <label className="block">
          <span className="text-sm text-gray-600">現在のパスワード</span>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">新しいパスワード（12文字以上）</span>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">新しいパスワード（確認）</span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "変更中..." : "パスワードを変更"}
        </button>
      </form>
    </main>
  );
}
