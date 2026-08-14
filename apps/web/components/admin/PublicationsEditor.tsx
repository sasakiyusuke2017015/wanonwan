"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@ui-catalog/core/organisms";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { useConfirm } from "@ui-catalog/core/hooks/ui";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { useAppToast } from "@ui-catalog/core/providers";
import { PUBLICATION_STATUSES, publicationStatusLabel } from "@wanonwan/domain";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { formatJstDateTime, jstInputToUtcIso, utcIsoToJstInput } from "@/lib/datetime";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { FormActions } from "@/components/admin/FormActions";

type Publication = {
  id: string;
  title: string | null;
  body: string | null;
  status: number;
  startAt: string | null;
  endAt: string | null;
};

type Draft = {
  title: string;
  status: number;
  startAt: string;
  endAt: string;
};

const EMPTY: Draft = { title: "", status: 100, startAt: "", endAt: "" };
// datetime-local(JST 壁時計) は保存時に UTC ISO へ変換する（[lib/datetime] 参照）。
const draftToPayload = (d: Draft) => ({
  title: d.title || null,
  status: d.status,
  startAt: jstInputToUtcIso(d.startAt),
  endAt: jstInputToUtcIso(d.endAt),
});

export function PublicationsEditor({ surveyId }: { surveyId: string }) {
  const qc = useQueryClient();
  const key = ["survey-publications", surveyId];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => apiGet<{ data: Publication[] }>(`/api/v1/surveys/${surveyId}/publications`),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast } = useAppToast();
  const { confirmState, showConfirm, handleConfirm, handleCancel } = useConfirm();

  const remove = useMutation({
    mutationFn: (id: string) => apiSend(`/api/v1/publications/${id}`, "DELETE"),
    onSuccess: () => {
      invalidate();
      showToast("削除しました", { type: "success" });
    },
    onError: (err) =>
      showToast(err instanceof ApiError ? err.message : "削除に失敗しました", { type: "error" }),
  });

  const publications = data?.data ?? [];

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">掲載設定</h2>
      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}

      <ul className="space-y-2">
        {publications.map((p) => (
          <li key={p.id} className="rounded border border-gray-200 p-3">
            {editingId === p.id ? (
              <PublicationForm
                initial={{
                  title: p.title ?? "",
                  status: p.status,
                  startAt: utcIsoToJstInput(p.startAt),
                  endAt: utcIsoToJstInput(p.endAt),
                }}
                submitLabel="更新"
                onCancel={() => setEditingId(null)}
                onSubmit={async (d) => {
                  await apiSend(`/api/v1/publications/${p.id}`, "PUT", draftToPayload(d));
                  setEditingId(null);
                  invalidate();
                  showToast("保存しました", { type: "success" });
                }}
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {p.title || "（無題）"}{" "}
                    <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      {publicationStatusLabel(p.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatJstDateTime(p.startAt) || "—"} 〜 {formatJstDateTime(p.endAt) || "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => setEditingId(p.id)} className="text-blue-600">
                    編集
                  </button>
                  <button
                    onClick={() =>
                      showConfirm(`掲載「${p.title || "（無題）"}」を削除しますか？`, {
                        title: "掲載の削除",
                        type: "danger",
                        confirmText: "削除",
                        onConfirm: () => remove.mutate(p.id),
                      })
                    }
                    className="text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {publications.length === 0 && !isLoading && (
          <li className="rounded border border-dashed p-4 text-center text-sm text-gray-400">
            掲載がありません
          </li>
        )}
      </ul>

      <div className="mt-4 rounded border border-gray-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">掲載を追加</h3>
        <PublicationForm
          initial={EMPTY}
          submitLabel="追加"
          onSubmit={async (d) => {
            await apiSend(`/api/v1/surveys/${surveyId}/publications`, "POST", draftToPayload(d));
            invalidate();
            showToast("保存しました", { type: "success" });
          }}
        />
      </div>

      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </section>
  );
}

function PublicationForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => Promise<void>;
  onCancel?: () => void;
}) {
  const { shapes } = useTheme();
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useUnsavedChangesGuard(isDirtyPayload(draft, initial));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
          await onSubmit(draft);
          if (!onCancel) setDraft(initial);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "保存に失敗しました");
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-3"
    >
      <FormField label="掲載タイトル（任意）">
        <Input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          borderRadius={shapes.inputRadius}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="状態">
          <Select
            options={PUBLICATION_STATUSES.map((s) => ({ value: String(s.value), label: s.label }))}
            value={String(draft.status)}
            onChange={(v) => setDraft((d) => ({ ...d, status: v == null ? d.status : Number(v) }))}
            borderRadius={shapes.inputRadius}
          />
        </FormField>
        <FormField label="開始">
          <Input
            type="datetime-local"
            value={draft.startAt}
            onChange={(e) => setDraft((d) => ({ ...d, startAt: e.target.value }))}
            borderRadius={shapes.inputRadius}
          />
        </FormField>
        <FormField label="終了">
          <Input
            type="datetime-local"
            value={draft.endAt}
            onChange={(e) => setDraft((d) => ({ ...d, endAt: e.target.value }))}
            borderRadius={shapes.inputRadius}
          />
        </FormField>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <FormActions submitLabel={submitLabel} pending={busy} onCancel={onCancel} />
    </form>
  );
}
