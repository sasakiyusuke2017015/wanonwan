"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Banner } from "@ui-catalog/core/molecules";
import { Checkbox } from "@ui-catalog/core/atoms";
import { AuthFormCard } from "@ui-catalog/core/organisms/AuthFormCard";
import { LoginButton } from "@ui-catalog/core/organisms/LoginButton";
import type { LoginButtonState } from "@ui-catalog/core/organisms/LoginButton";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const REMEMBER_KEY = "wanonwan.rememberedEmail";

// 旧 1on1 の LoginLayout をそのまま踏襲（2カラム: 左ブランディング teal / 右フォーム）。
// 旧はテーマに依らずログインだけ teal 固定。画像アセット（ロゴ/キャラ）は wanonwan に無いので省略。
// 認証は wanonwan の email/password（/api/v1/auth/login）に合わせる。
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [btnState, setBtnState] = useState<LoginButtonState>("ready");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowPassword(false);
    setError(null);
    setLoading(true);
    setBtnState("authenticating");

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
      setBtnState("authenticated");
      router.replace(params.get("next") || "/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    setBtnState("ready");
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "ログインに失敗しました");
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ログイン</h2>
        <p className="mt-2 text-sm text-slate-500">アカウント情報を入力してください</p>
      </div>

      <form className="space-y-4 sm:space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <Input
            id="email"
            name="username"
            type="email"
            autoComplete="username"
            required
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            size="large"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            size="large"
            icon={showPassword ? "eye-slashed" : "eye"}
            iconPosition="right"
            onIconClick={() => setShowPassword((v) => !v)}
          />
        </div>

        <Checkbox
          id="remember-me"
          name="remember-me"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          label="ログイン情報を記憶"
          size="large"
        />

        {error && <Banner variant="error" message={error} />}

        <LoginButton
          type="submit"
          state={btnState}
          variant="primary"
          fullWidth
          disabled={loading}
          loading={loading}
          loadingText="認証中..."
        >
          {btnState === "authenticated" ? "認証完了" : "ログイン"}
        </LoginButton>
      </form>
    </>
  );
}

export default function LoginPage() {
  useDocumentTitle("ログイン");
  return (
    <div className="flex min-h-screen">
      {/* デスクトップ: 左ブランディングパネル（旧踏襲 teal） */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-500 to-teal-600 p-12 md:flex md:w-1/2">
        <span className="text-2xl font-bold text-white">1on1</span>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-white">1on1 へようこそ</h1>
          <p className="mt-3 text-teal-100">効果的な 1on1 ミーティングを実現</p>
        </div>
        <div className="text-right text-xs text-teal-200">© 2026 wanonwan</div>
      </div>

      {/* デスクトップ: 右フォームパネル */}
      <div className="hidden w-full flex-col justify-center bg-white px-6 py-12 md:flex md:w-1/2">
        <div className="mx-auto w-full max-w-md space-y-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* モバイル: グラデーション背景 + カード型フォーム */}
      <div className="flex w-full flex-col bg-gradient-to-br from-teal-500 to-teal-600 md:hidden">
        <div className="flex flex-col items-center px-6 pb-4 pt-10 text-center">
          <h1 className="text-xl font-bold text-white">1on1 へようこそ</h1>
          <p className="mt-1 text-sm text-teal-100">効果的な 1on1 ミーティングを実現</p>
        </div>
        <AuthFormCard copyrightText="© 2026 wanonwan">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </AuthFormCard>
      </div>
    </div>
  );
}
