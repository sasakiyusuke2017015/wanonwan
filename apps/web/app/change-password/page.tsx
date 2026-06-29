"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Banner, Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { shapes } = useTheme();
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
      if (data.reauth) {
        router.replace("/login");
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "パスワードの変更に失敗しました");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div
        className="w-full max-w-md space-y-6 bg-white p-8 shadow-lg"
        style={{ borderRadius: shapes.cardRadius }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">パスワードの変更</h1>
          <p className="mt-2 text-sm text-slate-500">
            現在のパスワードを入力し、新しいパスワードを設定してください。
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <FormField label="現在のパスワード" required>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              size="large"
              borderRadius={shapes.inputRadius}
            />
          </FormField>

          <FormField label="新しいパスワード（12文字以上）" required>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              size="large"
              borderRadius={shapes.inputRadius}
            />
          </FormField>

          <FormField label="新しいパスワード（確認）" required>
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              size="large"
              borderRadius={shapes.inputRadius}
            />
          </FormField>

          {error && <Banner variant="error" message={error} />}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="w-full justify-center"
            borderRadius={shapes.buttonRadius}
          >
            {loading ? "変更中..." : "パスワードを変更"}
          </Button>
        </form>
      </div>
    </main>
  );
}
