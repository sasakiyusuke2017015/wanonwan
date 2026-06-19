import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Claude クライアント（サーバ専用）。面談データの外部送信は二重 gate で守る:
//   (1) ANTHROPIC_API_KEY が設定されている
//   (2) AI_EXTERNAL_PROCESSING_APPROVED=true（組織が外部送信を承認した明示フラグ）
// key だけでは有効化しない（テスト目的で key が env に紛れても送信されない fail-safe）。Plan §3.1。
const apiKey = process.env.ANTHROPIC_API_KEY;
const externalProcessingApproved = process.env.AI_EXTERNAL_PROCESSING_APPROVED === "true";

// AI 機能が利用可能か（キー設定 かつ 外部送信が組織承認済み）。
export const aiEnabled = Boolean(apiKey && apiKey.trim()) && externalProcessingApproved;

// 既定は Sonnet 4.6（要約に十分・低コスト）。AI_MODEL で上書き可。
export const AI_MODEL = process.env.AI_MODEL ?? "claude-sonnet-4-6";

export const anthropic = new Anthropic({ apiKey });
