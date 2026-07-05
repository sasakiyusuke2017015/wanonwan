"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select } from "@ui-catalog/core/molecules";
import { useAppToast } from "@ui-catalog/core/providers";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { fieldErrorsOf } from "@/lib/forms/field-errors";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { FormActions } from "@/components/admin/FormActions";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";
import type { MasterConfig } from "@/lib/admin/master-config";

type ParentItem = { id: string; code: string; name: string };
type Detail = Record<string, unknown>;

// マスタ作成/編集の汎用フォーム。config.fields（text/number）と任意の parent select を描画する。
export function MasterForm({ config, id }: { config: MasterConfig; id?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useAppToast();
  const guardedNavigate = useGuardedNavigate();
  const { shapes } = useTheme();
  const [form, setForm] = useState<Record<string, string>>({});
  const [initialForm, setInitialForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useUnsavedChangesGuard(isDirtyPayload(form, initialForm));

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // 親一覧（部/課のみ）。
  const parent = config.parent;
  const { data: parentData } = useQuery({
    queryKey: [parent?.queryKey ?? "none"],
    queryFn: () => apiGet<{ data: ParentItem[] }>(parent!.endpoint),
    enabled: Boolean(parent),
  });
  const parentOptions = useMemo(
    () => (parentData?.data ?? []).map((p) => ({ value: p.id, label: `${p.code} ${p.name}` })),
    [parentData],
  );

  // 編集時は既存値をロード。
  const { data: existing } = useQuery({
    queryKey: [config.key, id],
    queryFn: () => apiGet<{ data: Detail }>(`${config.endpoint}/${id}`),
    enabled: Boolean(id),
  });
  useEffect(() => {
    if (!existing?.data) return;
    const next: Record<string, string> = {};
    for (const f of config.fields) {
      const v = existing.data[f.key];
      next[f.key] = v == null ? "" : String(v);
    }
    if (parent) {
      const v = existing.data[parent.key];
      next[parent.key] = v == null ? "" : String(v);
    }
    setForm(next);
    setInitialForm(next);
  }, [existing, config.fields, parent]);

  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = form[f.key] ?? "";
      payload[f.key] = f.type === "number" ? (raw === "" ? undefined : Number(raw)) : raw;
    }
    if (parent) {
      const raw = form[parent.key] ?? "";
      payload[parent.key] = raw === "" ? undefined : Number(raw);
    }
    return payload;
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      return id
        ? apiSend(`${config.endpoint}/${id}`, "PUT", payload)
        : apiSend(config.endpoint, "POST", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [config.key] });
      setInitialForm(form); // 保存成功で baseline をリセット（離脱ガードが暴発しないように）
      showToast("保存しました", { type: "success" });
      router.push(config.listPath);
      router.refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "保存に失敗しました"),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const errs = fieldErrorsOf(id ? config.updateSchema : config.createSchema, buildPayload());
        setFieldErrors(errs);
        setError(null);
        if (Object.keys(errs).length > 0) return;
        mutation.mutate();
      }}
      className="max-w-2xl space-y-4"
    >
      <ContentBlock title={`${config.title}情報`}>
        <div className="space-y-4">
          {config.fields.map((f) => (
            <FormField key={f.key} label={f.label} required error={fieldErrors[f.key]}>
              <Input
                type={f.type === "number" ? "number" : "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                borderRadius={shapes.inputRadius}
              />
            </FormField>
          ))}
          {parent && (
            <FormField label={parent.label} required error={fieldErrors[parent.key]}>
              <Select
                options={parentOptions}
                value={form[parent.key] || undefined}
                onChange={(v) => set(parent.key, v == null ? "" : String(v))}
                allowEmpty
                placeholder="（未選択）"
                borderRadius={shapes.inputRadius}
              />
            </FormField>
          )}
        </div>
      </ContentBlock>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions
        submitLabel="保存"
        pending={mutation.isPending}
        onCancel={() => guardedNavigate(config.listPath)}
      />
    </form>
  );
}
