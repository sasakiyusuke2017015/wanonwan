import { NextResponse } from "next/server";
import { withActiveUser } from "@/lib/auth/route";
import { withUser } from "@/lib/db/client";
import { mapDbError } from "@/lib/db/errors";
import { aiEnabled } from "@/lib/ai/client";
import { embed, embeddingsEnabled, toVectorLiteral } from "@/lib/ai/embed";
import { suggestMentorActions } from "@/lib/ai/mentor";

type Ctx = { params: Promise<{ id: string }> };

// 面談メンター提案（RAG）。面談者/admin 限定。
// 1) 対象面談を lazy にベクトル化（自前ホスト埋め込み）→ 保存
// 2) pgvector で類似の過去面談を近傍検索（RLS で見える範囲のみ）
// 3) Claude が次アクション/論点を提案（= 外部送信）
// ANTHROPIC_API_KEY / EMBEDDINGS_URL 未設定なら 503（外部送信ゼロ）。
export const POST = withActiveUser(async (_req, claims, { params }: Ctx) => {
  if (!aiEnabled || !embeddingsEnabled) {
    return NextResponse.json(
      { error: "AI メンター機能は未設定です（ANTHROPIC_API_KEY / EMBEDDINGS_URL）" },
      { status: 503 },
    );
  }

  const { id } = await params;
  const answerId = Number(id);

  // 対象の面談（面談者 or admin 限定）。
  let target: { interviewMemo: string | null; nextAction: string | null; hasEmbedding: boolean } | undefined;
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        select interview_memo as "interviewMemo", next_action as "nextAction",
               (embedding is not null) as "hasEmbedding"
        from public.answers a
        where a.id = ${answerId} and (app.is_admin() or a.interviewer_id = app.uid())
      `,
    );
    target = rows[0] as typeof target;
  } catch (e) {
    return mapDbError(e);
  }
  if (!target) return NextResponse.json({ error: "権限がありません" }, { status: 403 });

  const targetText = [target.interviewMemo, target.nextAction].filter(Boolean).join("\n\n");
  if (!targetText.trim()) {
    return NextResponse.json({ error: "提案する面談記録がありません" }, { status: 400 });
  }

  // 対象をベクトル化（社内 embeddings コンテナ）。
  let vec: number[];
  try {
    vec = await embed(targetText, "passage");
  } catch (e) {
    console.error("embedding failed", e);
    return NextResponse.json({ error: "埋め込み生成に失敗しました" }, { status: 502 });
  }
  const vecLit = toVectorLiteral(vec);

  // 初回は保存（lazy）。失敗しても検索は続行（best-effort）。
  if (!target.hasEmbedding) {
    try {
      await withUser(
        claims.sub,
        (tx) => tx`update public.answers set embedding = ${vecLit}::vector where id = ${answerId}`,
      );
    } catch (e) {
      console.error("embedding store failed", e);
    }
  }

  // 類似の過去面談（RLS で見える範囲・embedding あり・自分以外）。
  let similars: string[];
  try {
    const rows = await withUser(
      claims.sub,
      (tx) => tx`
        select interview_memo as "memo"
        from public.answers a
        where a.id <> ${answerId}
          and a.embedding is not null
          and a.interview_memo is not null
        order by a.embedding <=> ${vecLit}::vector
        limit 3
      `,
    );
    similars = rows.map((r) => (r as { memo: string }).memo).filter(Boolean);
  } catch (e) {
    return mapDbError(e);
  }

  try {
    const suggestion = await suggestMentorActions(targetText, similars);
    return NextResponse.json({ data: { suggestion, referencedCount: similars.length } });
  } catch (e) {
    console.error("AI mentor failed", e);
    return NextResponse.json({ error: "AI 提案に失敗しました" }, { status: 502 });
  }
});
