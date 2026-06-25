import { NextResponse } from "next/server";

// Postgres エラーを HTTP に変換。詳細はクライアントへ出さない。
export function mapDbError(e: unknown): NextResponse {
  const code = (e as { code?: string } | null)?.code;
  if (code === "42501") {
    // RLS 違反（WITH CHECK 不成立 = 権限なし）
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }
  if (code === "23505") {
    return NextResponse.json({ error: "コードまたはメールが重複しています" }, { status: 409 });
  }
  if (code === "23503") {
    return NextResponse.json({ error: "参照先が存在しません" }, { status: 400 });
  }
  return NextResponse.json({ error: "処理に失敗しました" }, { status: 400 });
}

// DELETE 用。FK 違反(23503) は「他から参照されているため削除できない」= 409 に振り分ける
// （INSERT/UPDATE の 23503「参照先が無い」=400 とは意味が逆なので分ける）。
export function mapDeleteError(e: unknown): NextResponse {
  const code = (e as { code?: string } | null)?.code;
  if (code === "23503") {
    return NextResponse.json(
      { error: "他のデータから参照されているため削除できません" },
      { status: 409 },
    );
  }
  return mapDbError(e);
}
