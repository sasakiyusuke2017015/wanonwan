"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { useAppToast } from "@ui-catalog/core/providers";
import type { ElevatedRole } from "@wanonwan/domain";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

type UserRow = { id: string; name: string; roles: ElevatedRole[] };

// 面談担当の指名/解除（admin 画面用。API は PUT /answers/[id]/interviewer で admin 限定）。
// 候補は面談担当(interviewer)か管理者(admin)の権限保有者のみ。roles は RLS により
// admin にしか全件見えないため、このパネルは admin 配下でのみ機能する。
export function InterviewerAssignPanel({
  answerId,
  interviewerId,
}: {
  answerId: string;
  interviewerId: string | null;
}) {
  const qc = useQueryClient();
  const { shapes } = useTheme();
  const { showToast } = useAppToast();

  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<{ data: UserRow[] }>("/api/v1/users"),
  });
  const candidates = (data?.data ?? []).filter((u) => u.roles.length > 0);

  const mutation = useMutation({
    mutationFn: (next: number | null) =>
      apiSend(`/api/v1/answers/${answerId}/interviewer`, "PUT", { interviewerId: next }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["answer", answerId] });
      showToast("面談担当を更新しました", { type: "success" });
    },
    onError: (e) =>
      showToast(e instanceof ApiError ? e.message : "面談担当の更新に失敗しました", {
        type: "error",
      }),
  });

  return (
    <div className="max-w-xs">
      <Select
        options={candidates.map((u) => ({ value: u.id, label: u.name }))}
        value={interviewerId ?? undefined}
        onChange={(v) => mutation.mutate(v == null ? null : Number(v))}
        allowEmpty
        placeholder="（未割り当て）"
        borderRadius={shapes.inputRadius}
      />
      <p className="mt-1 text-xs text-gray-500">
        担当者は自分が割り当てられた回答の面談を記録できます。未割り当ての間は管理者のみ記録できます。
      </p>
    </div>
  );
}
