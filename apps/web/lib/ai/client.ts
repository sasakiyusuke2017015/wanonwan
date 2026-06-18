import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Claude クライアント（サーバ専用）。ANTHROPIC_API_KEY が未設定なら AI 機能は無効。
// キーを env に入れる行為 = 組織が「面談データの外部送信」を有効化する判断（Plan §3.1）。
const apiKey = process.env.ANTHROPIC_API_KEY;

// AI 機能が利用可能か（キーが設定されているか）。
export const aiEnabled = Boolean(apiKey && apiKey.trim());

// 既定は Sonnet 4.6（要約に十分・低コスト）。AI_MODEL で上書き可。
export const AI_MODEL = process.env.AI_MODEL ?? "claude-sonnet-4-6";

export const anthropic = new Anthropic({ apiKey });
