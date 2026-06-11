import { NextResponse } from "next/server";
import * as v from "valibot";
import { GoTrueError } from "@waoon/auth";
import { gotrue } from "@/lib/auth/gotrue";
import { setSession } from "@/lib/auth/session";

const LoginBody = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(1)),
});

export async function POST(req: Request) {
  let input: v.InferOutput<typeof LoginBody>;
  try {
    input = v.parse(LoginBody, await req.json());
  } catch {
    return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
  }

  try {
    const session = await gotrue.signInWithPassword(input.email, input.password);
    await setSession(session);
    return NextResponse.json({
      user: { id: session.user.id, email: session.user.email, role: session.user.role },
    });
  } catch (error) {
    if (error instanceof GoTrueError) {
      // 認証失敗の詳細はクライアントへ出さない（汎用メッセージ）
      const status = error.status === 400 || error.status === 401 ? 401 : 502;
      return NextResponse.json(
        { error: status === 401 ? "メールアドレスまたはパスワードが違います" : "認証サーバに接続できません" },
        { status },
      );
    }
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}
