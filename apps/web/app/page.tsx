import { redirect } from "next/navigation";

// ルートはダッシュボードを既定の入口にする（独立したホーム画面は持たない）。
export default function Home() {
  redirect("/dashboard");
}
