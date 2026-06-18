import { anthropic, AI_MODEL } from "./client";

const SYSTEM_PROMPT =
  "あなたは 1on1 面談の振り返りを支援するアシスタントです。" +
  "面談記録を読み、(1) 要約、(2) 気になる点・課題、(3) 次にとるべきアクション を" +
  "日本語の簡潔な箇条書きでまとめてください。提案は補助であり、最終判断は人が行います。";

// 面談本文から要約プロンプトを組む（純関数）。
export function buildSummaryPrompt(text: string): string {
  return `次の面談記録を要約してください。\n\n---\n${text}\n---`;
}

// Claude レスポンスの content から text ブロックのみ連結する（純関数）。
export function extractText(blocks: Array<{ type: string; text?: string }>): string {
  return blocks
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text as string)
    .join("\n");
}

// 面談記録を要約する。client を使う薄いラッパ（外部送信が発生する箇所）。
export async function summarizeInterview(text: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildSummaryPrompt(text) }],
  });
  return extractText(message.content);
}
