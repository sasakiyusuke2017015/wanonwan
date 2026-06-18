"use client";

import { useState } from "react";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { ApiError, apiSend } from "@/lib/api/client";

// AI メンター提案（補助）。対象面談 + 過去の類似面談（pgvector）を文脈に Claude が提案する。
// ANTHROPIC_API_KEY / EMBEDDINGS_URL 未設定の環境では 503 が返り、その旨を表示する。
export function InterviewMentor({ answerId }: { answerId: string }) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [referenced, setReferenced] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSuggest() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await apiSend<{ data: { suggestion: string; referencedCount: number } }>(
        `/api/v1/answers/${answerId}/mentor`,
        "POST",
      );
      setSuggestion(data.suggestion);
      setReferenced(data.referencedCount);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AI 提案に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ContentBlock title="AI メンター提案（補助）">
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          対象の面談と、過去の類似面談を踏まえて次アクション/論点を AI が提案します。提案は補助で、最終判断は人が行います。
        </p>
        <button
          type="button"
          onClick={onSuggest}
          disabled={busy}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {busy ? "生成中..." : "メンター提案を生成"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {suggestion && (
          <>
            <p className="text-xs text-gray-400">参考にした過去面談: {referenced} 件</p>
            <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">{suggestion}</pre>
          </>
        )}
      </div>
    </ContentBlock>
  );
}
