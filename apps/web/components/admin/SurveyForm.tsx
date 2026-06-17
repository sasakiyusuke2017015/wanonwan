"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateSurveySchema, SURVEY_STATUSES, UpdateSurveySchema } from "@waoon/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { Checkbox } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { fieldErrorsOf } from "@/lib/forms/field-errors";
import { FormActions } from "@/components/admin/FormActions";

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

const STATUS_OPTIONS = SURVEY_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] ?? s }));

export function SurveyForm({ surveyId }: { surveyId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { shapes } = useTheme();
  const [form, setForm] = useState({
    title: "",
    status: "draft",
    capacity: "",
    requiresAuth: true,
    usesAi: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  // 送信用 payload を組む。フィールド検証と mutation の両方で同じ payload を使う。
  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      title: form.title,
      status: form.status,
      requiresAuth: form.requiresAuth,
      usesAi: form.usesAi,
    };
    if (form.capacity) payload.capacity = Number(form.capacity);
    return payload;
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
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
        const errs = fieldErrorsOf(surveyId ? UpdateSurveySchema : CreateSurveySchema, buildPayload());
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
          setError(null);
          return;
        }
        setError(null);
        mutation.mutate();
      }}
      className="max-w-2xl space-y-4"
    >
      <ContentBlock title="アンケート設定">
        <div className="space-y-4">
          <FormField label="タイトル" required error={fieldErrors.title}>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="状態">
              <Select
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(v) =>
                  setForm((f) => ({ ...f, status: v == null ? "draft" : String(v) }))
                }
                borderRadius={shapes.inputRadius}
              />
            </FormField>
            <FormField label="定員（任意）">
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                borderRadius={shapes.inputRadius}
              />
            </FormField>
          </div>
        </div>
      </ContentBlock>

      <ContentBlock title="オプション">
        <div className="space-y-3">
          <Checkbox
            label="認証を必須にする"
            checked={form.requiresAuth}
            onChange={(e) => setForm((f) => ({ ...f, requiresAuth: e.target.checked }))}
          />
          <Checkbox
            label="AI 機能を使う（Phase 2）"
            checked={form.usesAi}
            onChange={(e) => setForm((f) => ({ ...f, usesAi: e.target.checked }))}
          />
        </div>
      </ContentBlock>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions
        submitLabel="保存"
        pending={mutation.isPending}
        onCancel={() => router.push("/admin/surveys")}
      />
    </form>
  );
}
