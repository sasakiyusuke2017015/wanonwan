import { NextResponse } from "next/server";
import * as v from "valibot";

// リクエスト body を valibot で検証する。成功で検証済みデータ、失敗で 400 Response を返す。
// 400 文言は route ごとに異なるため errorMessage で差し替える（既定は汎用文言）。
// 呼び出し側: const parsed = await parseBody(req, Schema); if (parsed instanceof NextResponse) return parsed;
export async function parseBody<TSchema extends v.GenericSchema>(
  req: Request,
  schema: TSchema,
  errorMessage = "入力が不正です",
): Promise<v.InferOutput<TSchema> | NextResponse> {
  try {
    return v.parse(schema, await req.json()) as v.InferOutput<TSchema>;
  } catch {
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
