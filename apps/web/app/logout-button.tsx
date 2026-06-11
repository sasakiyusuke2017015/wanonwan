"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {loading ? "..." : "ログアウト"}
    </button>
  );
}
