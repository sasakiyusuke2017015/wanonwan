"use client";

import { useState } from "react";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { ApiError, apiSend } from "@/lib/api/client";

// 面談記録の AI 要約（補助）。面談メモ + 次アクションを Claude が要約する。
// ANTHROPIC_API_KEY 未設定の環境では 503 が返り、その旨を表示する。
export function InterviewSummary({ answerId }: { answerId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSummarize() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await apiSend<{ data: { summary: string } }>(
        `/api/v1/answers/${answerId}/summary`,
        "POST",
      );
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "AI 要約に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ContentBlock title="AI 要約（補助）">
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          面談メモと次アクションを AI が要約します。提案は補助で、最終判断は人が行います。
        </p>
        <button
          type="button"
          onClick={onSummarize}
          disabled={busy}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {busy ? "要約中..." : "AI 要約を生成"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {summary && (
          <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">{summary}</pre>
        )}
      </div>
    </ContentBlock>
  );
}
