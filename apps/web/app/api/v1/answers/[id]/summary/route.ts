import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { aiEnabled } from "@/lib/ai/client";
import { summarizeInterview } from "@/lib/ai/summarize";

type Ctx = { params: Promise<{ id: string }> };

// 面談記録（interview_memo / next_action）を Claude で要約する。面談者 or admin 限定。
// ANTHROPIC_API_KEY 未設定なら 503（外部送信は発生しない）。都度生成・DB 非保存。
export const POST = withActiveUser(async (_req, claims, { params }: Ctx) => {
  if (!aiEnabled) {
    return NextResponse.json(
      { error: "AI 機能は未設定です（管理者に ANTHROPIC_API_KEY の設定を依頼してください）" },
      { status: 503 },
    );
  }

  const { id } = await params;
  let rows: Array<{ interviewMemo: string | null; nextAction: string | null }>;
  try {
    rows = await withUser(
      claims.sub,
      (tx) => tx`
        select interview_memo as "interviewMemo", next_action as "nextAction"
        from public.answers a
        where a.id = ${Number(id)}
          and (app.is_admin() or a.interviewer_id = app.uid())
      `,
    );
  } catch (e) {
    return mapDbError(e);
  }

  const row = rows[0];
  if (!row) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const text = [row.interviewMemo, row.nextAction].filter(Boolean).join("\n\n");
  if (!text.trim()) {
    return NextResponse.json({ error: "要約する面談記録がありません" }, { status: 400 });
  }

  try {
    const summary = await summarizeInterview(text);
    return NextResponse.json({ data: { summary } });
  } catch (e) {
    console.error("AI summarize failed", e);
    return NextResponse.json({ error: "AI 要約に失敗しました" }, { status: 502 });
  }
});
