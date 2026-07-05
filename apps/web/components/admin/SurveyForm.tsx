"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateSurveySchema, SURVEY_STATUSES, UpdateSurveySchema } from "@waoon/domain";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { Checkbox } from "@ui-catalog/core/atoms";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { useAppToast } from "@ui-catalog/core/providers";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { fieldErrorsOf } from "@/lib/forms/field-errors";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { FormActions } from "@/components/admin/FormActions";
import { AttachmentsPanel } from "@/components/admin/AttachmentsPanel";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";

type SurveyDetail = {
  id: string;
  title: string;
  status: string;
  capacity: number | null;
  requiresAuth: boolean;
  usesAi: boolean;
  urgencyId: number | null;
};

type UrgencyLevel = { id: string; code: number; name: string };

const STATUS_LABEL: Record<string, string> = {
  draft: "下書き",
  active: "公開",
  closed: "終了",
};

const STATUS_OPTIONS = SURVEY_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] ?? s }));

const EMPTY_FORM = {
  title: "",
  status: "draft",
  capacity: "",
  requiresAuth: true,
  usesAi: false,
  urgencyId: "",
};

export function SurveyForm({ surveyId }: { surveyId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const guardedNavigate = useGuardedNavigate();
  const { shapes } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { showToast } = useAppToast();

  useUnsavedChangesGuard(isDirtyPayload(form, initialForm));

  const { data: existing } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => apiGet<{ data: SurveyDetail }>(`/api/v1/surveys/${surveyId}`),
    enabled: Boolean(surveyId),
  });

  // 緊急度セレクタの選択肢（マスタ）。
  const { data: urgencies } = useQuery({
    queryKey: ["urgencies"],
    queryFn: () => apiGet<{ data: UrgencyLevel[] }>("/api/v1/urgencies"),
  });
  // 空 option は入れない（未ロード時 options.length===0 にして Select の自動フォールバックを避ける）。
  // 「なし」は allowEmpty + placeholder で表現する。
  const urgencyOptions = (urgencies?.data ?? []).map((u) => ({ value: String(u.id), label: u.name }));

  useEffect(() => {
    if (!existing?.data) return;
    const s = existing.data;
    const next = {
      title: s.title,
      status: s.status,
      capacity: s.capacity == null ? "" : String(s.capacity),
      requiresAuth: s.requiresAuth,
      usesAi: s.usesAi,
      urgencyId: s.urgencyId == null ? "" : String(s.urgencyId),
    };
    setForm(next);
    setInitialForm(next);
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
    payload.urgencyId = form.urgencyId ? Number(form.urgencyId) : null;
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
      setInitialForm(form); // 保存成功で baseline をリセット（離脱ガードが暴発しないように）
      // Toast は Providers 直下の ToastProvider が表示主体のため、遷移後も表示され続ける。
      showToast("保存しました", { type: "success" });
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <FormField label="定員（任意）" error={fieldErrors.capacity}>
              <Input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                borderRadius={shapes.inputRadius}
              />
            </FormField>
            <FormField label="緊急度（任意）">
              <Select
                options={urgencyOptions}
                value={form.urgencyId || undefined}
                onChange={(v) => setForm((f) => ({ ...f, urgencyId: v == null ? "" : String(v) }))}
                allowEmpty
                placeholder="（なし）"
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

      {surveyId && (
        <AttachmentsPanel entityType="survey" entityId={Number(surveyId)} title="説明資料" />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions
        submitLabel="保存"
        pending={mutation.isPending}
        onCancel={() => guardedNavigate("/admin/surveys")}
      />
    </form>
  );
}
