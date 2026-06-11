"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SURVEY_STATUSES } from "@waoon/domain";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

type SurveyDetail = {
  id: string;
  title: string;
  status: string;
  capacity: number | null;
  requiresAuth: boolean;
  usesAi: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  active: "公開",
  closed: "終了",
};

export function SurveyForm({ surveyId }: { surveyId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    status: "draft",
    capacity: "",
    requiresAuth: true,
    usesAi: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { data: existing } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => apiGet<{ data: SurveyDetail }>(`/api/v1/surveys/${surveyId}`),
    enabled: Boolean(surveyId),
  });

  useEffect(() => {
    if (!existing?.data) return;
    const s = existing.data;
    setForm({
      title: s.title,
      status: s.status,
      capacity: s.capacity == null ? "" : String(s.capacity),
      requiresAuth: s.requiresAuth,
      usesAi: s.usesAi,
    });
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        title: form.title,
        status: form.status,
        requiresAuth: form.requiresAuth,
        usesAi: form.usesAi,
      };
      if (form.capacity) payload.capacity = Number(form.capacity);
      return surveyId
        ? apiSend(`/api/v1/surveys/${surveyId}`, "PUT", payload)
        : apiSend("/api/v1/surveys", "POST", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["surveys"] });
      router.push("/admin/surveys");
      router.refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "保存に失敗しました"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="max-w-lg space-y-4"
    >
      <label className="block">
        <span className="text-sm text-gray-600">
          タイトル<span className="ml-1 text-red-500">*</span>
        </span>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">状態</span>
        <select
          className={inputCls}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          {SURVEY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s] ?? s}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">定員（任意）</span>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.requiresAuth}
          onChange={(e) => setForm((f) => ({ ...f, requiresAuth: e.target.checked }))}
        />
        <span className="text-sm">認証を必須にする</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.usesAi}
          onChange={(e) => setForm((f) => ({ ...f, usesAi: e.target.checked }))}
        />
        <span className="text-sm">AI 機能を使う（Phase 2）</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {mutation.isPending ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/surveys")}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

const inputCls = "mt-1 w-full rounded border border-gray-300 px-3 py-2";
