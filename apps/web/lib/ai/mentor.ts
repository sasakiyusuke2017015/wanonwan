import { anthropic, AI_MODEL } from "./client";
import { extractText } from "./summarize";

const SYSTEM_PROMPT =
  "あなたは 1on1 面談を支援するメンターアシスタントです。" +
  "対象の面談内容と、参考として渡される過去の類似面談を踏まえ、" +
  "面談者（上司）が次に取るとよいアクションと、話すとよい論点を日本語の簡潔な箇条書きで提案してください。" +
  "提案は補助であり、最終判断は人が行います。断定や人事評価の自動化はしないでください。";

// メンター提案プロンプトを組む（純関数）。similars は参考の過去面談メモ。
export function buildMentorPrompt(target: string, similars: string[]): string {
  const refs =
    similars.length > 0
      ? similars.map((s, i) => `# 参考 過去面談 ${i + 1}\n${s}`).join("\n\n")
      : "（参考にできる過去の類似面談はありません）";
  return `# 対象の面談\n${target}\n\n${refs}`;
}

// メンター提案を生成する（Claude へ送信＝外部送信）。
export async function suggestMentorActions(target: string, similars: string[]): Promise<string> {
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildMentorPrompt(target, similars) }],
  });
  return extractText(message.content);
}
