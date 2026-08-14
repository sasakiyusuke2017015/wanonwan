"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { Checkbox } from "@ui-catalog/core/atoms";
import { FormField, Input, Select, Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { useAppToast } from "@ui-catalog/core/providers";
import { CreateUserSchema, UpdateUserSchema, type ElevatedRole } from "@wanonwan/domain";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { fieldErrorsOf } from "@/lib/forms/field-errors";
import { isDirtyPayload } from "@/lib/forms/dirty";
import { FormActions } from "@/components/admin/FormActions";
import { AttachmentsPanel } from "@/components/admin/AttachmentsPanel";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useGuardedNavigate } from "@/hooks/useGuardedNavigate";

type OrgItem = { id: string; code: string; name: string };
type Org = {
  positions: OrgItem[];
  divisions: OrgItem[];
  departments: OrgItem[];
  sections: OrgItem[];
};
type UserDetail = {
  id: string;
  code: string;
  name: string;
  email: string;
  positionId: string | null;
  divisionId: string | null;
  departmentId: string | null;
  sectionId: string | null;
  roles: ElevatedRole[];
};

const EMPTY = {
  code: "",
  name: "",
  email: "",
  roles: [] as ElevatedRole[],
  positionId: "",
  divisionId: "",
  departmentId: "",
  sectionId: "",
};

// member は全員が暗黙保有のため選択肢に出さない（付け外しできるのは上位ロールのみ）。
const ELEVATED_ROLE_OPTIONS: { value: ElevatedRole; label: string }[] = [
  { value: "admin", label: "管理者" },
  { value: "interviewer", label: "面談担当" },
];

const toOptions = (items?: OrgItem[]) =>
  (items ?? []).map((it) => ({ value: it.id, label: it.name }));

// 作成時は initialPassword を含む。更新時は無し。
type SaveResult = { data: unknown; initialPassword?: string };

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const guardedNavigate = useGuardedNavigate();
  const { shapes } = useTheme();
  const { showToast } = useAppToast();
  const [form, setForm] = useState(EMPTY);
  const [initialForm, setInitialForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useUnsavedChangesGuard(isDirtyPayload(form, initialForm));
  // 作成 / リセット成功時、サーバ生成の初期パスワードを一度だけ表示するための状態。
  const [created, setCreated] = useState<{
    email: string;
    password: string;
    kind: "created" | "reset";
  } | null>(null);

  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: () => apiGet<{ data: Org }>("/api/v1/org"),
  });
  const { data: existing } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiGet<{ data: UserDetail }>(`/api/v1/users/${userId}`),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!existing?.data) return;
    const u = existing.data;
    const next = {
      code: u.code,
      name: u.name,
      email: u.email,
      roles: [...(u.roles ?? [])].sort(),
      positionId: u.positionId ?? "",
      divisionId: u.divisionId ?? "",
      departmentId: u.departmentId ?? "",
      sectionId: u.sectionId ?? "",
    };
    setForm(next);
    setInitialForm(next);
  }, [existing]);

  // 送信用 payload を組む。org フィールドは未選択なら省略、選択時のみ Number 化。
  // フィールド検証（fieldErrorsOf）と mutation の両方で同じ payload を使う。
  function buildPayload(): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      code: form.code,
      name: form.name,
      email: form.email,
      roles: form.roles,
    };
    for (const key of ["positionId", "divisionId", "departmentId", "sectionId"] as const) {
      if (form[key]) payload[key] = Number(form[key]);
    }
    return payload;
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      return userId
        ? apiSend<SaveResult>(`/api/v1/users/${userId}`, "PUT", payload)
        : apiSend<SaveResult>("/api/v1/users", "POST", payload);
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setInitialForm(form); // 保存成功で baseline をリセット（作成後のパネル表示でも離脱ガードが残らないように）
      showToast("保存しました", { type: "success" });
      // 新規作成時は初期パスワードを一度だけ表示する（遷移しない）。
      if (!userId && result.initialPassword) {
        setCreated({ email: form.email, password: result.initialPassword, kind: "created" });
        return;
      }
      router.push("/admin/users");
      router.refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "保存に失敗しました"),
  });

  // 編集時のみ: パスワードをリセットしてサーバ生成 PW を一度だけ表示する。
  const resetMutation = useMutation({
    mutationFn: () =>
      apiSend<{ initialPassword: string }>(`/api/v1/users/${userId}/reset-password`, "POST"),
    onSuccess: (result) => {
      setCreated({ email: form.email, password: result.initialPassword, kind: "reset" });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "パスワードのリセットに失敗しました"),
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // 並び順を固定して dirty 判定（isDirtyPayload）のブレを防ぐ。
  function toggleRole(role: ElevatedRole, checked: boolean) {
    setForm((f) => ({
      ...f,
      roles: (checked ? [...f.roles, role] : f.roles.filter((r) => r !== role)).sort(),
    }));
  }

  // 作成 / リセット完了：初期パスワードを一度だけ提示する。再表示できないので控えてもらう。
  if (created) {
    const title = created.kind === "created" ? "ユーザーを作成しました" : "パスワードをリセットしました";
    return (
      <div className="max-w-2xl">
        <ContentBlock title={title}>
          <div className="space-y-3">
            <p className="text-sm">
              下の初期パスワードは<strong>この画面でしか表示されません</strong>
              。控えてから本人へ共有してください。本人は次回ログイン後にパスワードの変更を求められます。
            </p>
            <div className="text-sm">
              メール: <span className="font-medium">{created.email}</span>
            </div>
            <div className="text-sm">
              初期パスワード:{" "}
              <code className="select-all rounded bg-gray-100 px-2 py-1 font-mono">
                {created.password}
              </code>
            </div>
            <Button
              onClick={() => {
                router.push("/admin/users");
                router.refresh();
              }}
              borderRadius={shapes.buttonRadius}
            >
              ユーザー一覧へ
            </Button>
          </div>
        </ContentBlock>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const errs = fieldErrorsOf(userId ? UpdateUserSchema : CreateUserSchema, buildPayload());
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
      <ContentBlock title="基本情報">
        <div className="space-y-4">
          <FormField label="ユーザーコード" required error={fieldErrors.code}>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="名前" required error={fieldErrors.name}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="メールアドレス" required error={fieldErrors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
        </div>
      </ContentBlock>

      <ContentBlock title="権限">
        <div className="space-y-2">
          {ELEVATED_ROLE_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.value}
              label={opt.label}
              checked={form.roles.includes(opt.value)}
              onChange={(e) => toggleRole(opt.value, e.target.checked)}
            />
          ))}
          {fieldErrors.roles && <p className="text-sm text-red-600">{fieldErrors.roles}</p>}
          <p className="mt-1 text-xs text-gray-500">
            メンバー機能は全員が利用できます。管理者はユーザー・マスタ・アンケートの管理、
            面談担当は割り当てられた回答の面談記録ができます（役職とは別軸の権限。複数選択可）。
          </p>
        </div>
      </ContentBlock>

      <ContentBlock title="所属">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="役職">
            <Select
              options={toOptions(org?.data.positions)}
              value={form.positionId || undefined}
              onChange={(v) => set("positionId", v == null ? "" : String(v))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="所属本部">
            <Select
              options={toOptions(org?.data.divisions)}
              value={form.divisionId || undefined}
              onChange={(v) => set("divisionId", v == null ? "" : String(v))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="所属部">
            <Select
              options={toOptions(org?.data.departments)}
              value={form.departmentId || undefined}
              onChange={(v) => set("departmentId", v == null ? "" : String(v))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="所属課">
            <Select
              options={toOptions(org?.data.sections)}
              value={form.sectionId || undefined}
              onChange={(v) => set("sectionId", v == null ? "" : String(v))}
              allowEmpty
              placeholder="（未選択）"
              borderRadius={shapes.inputRadius}
            />
          </FormField>
        </div>
      </ContentBlock>

      {userId && (
        <ContentBlock title="パスワード">
          <div className="space-y-3">
            <p className="text-sm">
              新しい初期パスワードを発行します。発行後は本人が次回ログイン時に変更を求められます。
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                resetMutation.mutate();
              }}
              loading={resetMutation.isPending}
              borderRadius={shapes.buttonRadius}
            >
              パスワードをリセット
            </Button>
          </div>
        </ContentBlock>
      )}

      {userId && (
        <AttachmentsPanel entityType="user_avatar" entityId={Number(userId)} title="アバター" />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions
        submitLabel="保存"
        pending={mutation.isPending}
        onCancel={() => guardedNavigate("/admin/users")}
      />
    </form>
  );
}
