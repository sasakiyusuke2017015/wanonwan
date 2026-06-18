"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVAL_ITEMS, HEALTH_STATUSES, INTERVIEW_METHODS } from "@waoon/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { TextArea } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError, apiSend } from "@/lib/api/client";
import { FormActions } from "@/components/admin/FormActions";
import { AttachmentsPanel } from "@/components/admin/AttachmentsPanel";
import { InterviewSummary } from "@/components/admin/InterviewSummary";
import { jstInputToUtcIso, utcIsoToJstInput } from "@/lib/datetime";

type Initial = {
  interviewAt: string | null;
  interviewMethod: number | null;
  healthStatus: number | null;
  evaluation: Record<string, number> | null;
  interviewMemo: string | null;
  nextAction: string | null;
};

const METHOD_OPTIONS = INTERVIEW_METHODS.map((m) => ({ value: String(m.value), label: m.label }));
const HEALTH_OPTIONS = HEALTH_STATUSES.map((h) => ({ value: String(h.value), label: h.label }));

export function InterviewForm({ answerId, initial }: { answerId: string; initial: Initial }) {
  const router = useRouter();
  const { shapes } = useTheme();
  const [f, setF] = useState({
    interviewAt: utcIsoToJstInput(initial.interviewAt),
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
        interviewAt: jstInputToUtcIso(f.interviewAt),
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
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <ContentBlock title="面談">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="面談日時">
            <Input
              type="datetime-local"
              value={f.interviewAt}
              onChange={(e) => setF((s) => ({ ...s, interviewAt: e.target.value }))}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="面談方式">
            <Select
              options={METHOD_OPTIONS}
              value={f.interviewMethod || undefined}
              onChange={(v) => setF((s) => ({ ...s, interviewMethod: v == null ? "" : String(v) }))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="健康状態">
            <Select
              options={HEALTH_OPTIONS}
              value={f.healthStatus || undefined}
              onChange={(v) => setF((s) => ({ ...s, healthStatus: v == null ? "" : String(v) }))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
        </div>
      </ContentBlock>

      <ContentBlock title="評価（0〜5）">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {EVAL_ITEMS.map((it) => (
            <FormField key={it.key} label={it.label}>
              <Input
                type="number"
                min={0}
                max={5}
                step={1}
                value={f.evaluation[it.key] == null ? "" : String(f.evaluation[it.key])}
                onChange={(e) =>
                  setF((s) => ({ ...s, evaluation: { ...s.evaluation, [it.key]: e.target.value } }))
                }
                borderRadius={shapes.inputRadius}
              />
            </FormField>
          ))}
        </div>
      </ContentBlock>

      <ContentBlock title="記録">
        <div className="space-y-4">
          <FormField label="面談メモ">
            <TextArea
              value={f.interviewMemo}
              onChange={(e) => setF((s) => ({ ...s, interviewMemo: e.target.value }))}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="次回までのアクション">
            <TextArea
              value={f.nextAction}
              onChange={(e) => setF((s) => ({ ...s, nextAction: e.target.value }))}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
        </div>
      </ContentBlock>

      <InterviewSummary answerId={answerId} />

      <AttachmentsPanel entityType="interview" entityId={Number(answerId)} title="面談の添付資料" />
      <AttachmentsPanel entityType="answer" entityId={Number(answerId)} title="回答の添付ファイル" />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-600">面談を記録しました（完了）。</p>}

      <FormActions submitLabel="面談を記録（完了にする）" pendingLabel="保存中..." pending={busy} />
    </form>
  );
}
