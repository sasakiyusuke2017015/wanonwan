"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVAL_ITEMS, HEALTH_STATUSES, INTERVIEW_METHODS } from "@waoon/domain";
import { ApiError, apiSend } from "@/lib/api/client";

type Initial = {
  interviewAt: string | null;
  interviewMethod: number | null;
  healthStatus: number | null;
  evaluation: Record<string, number> | null;
  interviewMemo: string | null;
  nextAction: string | null;
};

const toLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

export function InterviewForm({ answerId, initial }: { answerId: string; initial: Initial }) {
  const router = useRouter();
  const [f, setF] = useState({
    interviewAt: toLocal(initial.interviewAt),
    interviewMethod: initial.interviewMethod == null ? "" : String(initial.interviewMethod),
    healthStatus: initial.healthStatus == null ? "" : String(initial.healthStatus),
    evaluation: { ...(initial.evaluation ?? {}) } as Record<string, number | string>,
    interviewMemo: initial.interviewMemo ?? "",
    nextAction: initial.nextAction ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setBusy(true);
    const evaluation: Record<string, number> = {};
    for (const it of EVAL_ITEMS) {
      const val = f.evaluation[it.key];
      if (val !== "" && val != null) evaluation[it.key] = Number(val);
    }
    try {
      await apiSend(`/api/v1/answers/${answerId}/interview`, "PUT", {
        interviewAt: f.interviewAt || null,
        interviewMethod: f.interviewMethod ? Number(f.interviewMethod) : null,
        healthStatus: f.healthStatus ? Number(f.healthStatus) : null,
        evaluation,
        interviewMemo: f.interviewMemo || null,
        nextAction: f.nextAction || null,
        status: 900,
      });
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-gray-600">
          面談日時
          <input type="datetime-local" className={cls} value={f.interviewAt} onChange={(e) => setF((s) => ({ ...s, interviewAt: e.target.value }))} />
        </label>
        <label className="text-sm text-gray-600">
          面談方式
          <select className={cls} value={f.interviewMethod} onChange={(e) => setF((s) => ({ ...s, interviewMethod: e.target.value }))}>
            <option value="">（未選択）</option>
            {INTERVIEW_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <label className="text-sm text-gray-600">
          健康状態
          <select className={cls} value={f.healthStatus} onChange={(e) => setF((s) => ({ ...s, healthStatus: e.target.value }))}>
            <option value="">（未選択）</option>
            {HEALTH_STATUSES.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm text-gray-600">評価（0〜5）</legend>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EVAL_ITEMS.map((it) => (
            <label key={it.key} className="text-xs text-gray-500">
              {it.label}
              <input
                type="number"
                min={0}
                max={5}
                className={cls}
                value={f.evaluation[it.key] ?? ""}
                onChange={(e) => setF((s) => ({ ...s, evaluation: { ...s.evaluation, [it.key]: e.target.value } }))}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm text-gray-600">
        面談メモ
        <textarea className={cls} rows={3} value={f.interviewMemo} onChange={(e) => setF((s) => ({ ...s, interviewMemo: e.target.value }))} />
      </label>
      <label className="block text-sm text-gray-600">
        次回までのアクション
        <textarea className={cls} rows={2} value={f.nextAction} onChange={(e) => setF((s) => ({ ...s, nextAction: e.target.value }))} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-600">面談を記録しました（完了）。</p>}
      <button type="submit" disabled={busy} className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
        {busy ? "保存中..." : "面談を記録（完了にする）"}
      </button>
    </form>
  );
}

const cls = "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm";
