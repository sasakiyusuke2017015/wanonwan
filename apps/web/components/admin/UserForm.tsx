"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { FormField, Input, Select, Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";
import { FormActions } from "@/components/admin/FormActions";

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
};

const EMPTY = {
  code: "",
  name: "",
  email: "",
  positionId: "",
  divisionId: "",
  departmentId: "",
  sectionId: "",
};

const toOptions = (items?: OrgItem[]) =>
  (items ?? []).map((it) => ({ value: it.id, label: it.name }));

// 作成時は initialPassword を含む。更新時は無し。
type SaveResult = { data: unknown; initialPassword?: string };

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { shapes } = useTheme();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  // 作成成功時、サーバ生成の初期パスワードを一度だけ表示するための状態。
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

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
    setForm({
      code: u.code,
      name: u.name,
      email: u.email,
      positionId: u.positionId ?? "",
      divisionId: u.divisionId ?? "",
      departmentId: u.departmentId ?? "",
      sectionId: u.sectionId ?? "",
    });
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        code: form.code,
        name: form.name,
        email: form.email,
      };
      for (const key of ["positionId", "divisionId", "departmentId", "sectionId"] as const) {
        if (form[key]) payload[key] = Number(form[key]);
      }
      return userId
        ? apiSend<SaveResult>(`/api/v1/users/${userId}`, "PUT", payload)
        : apiSend<SaveResult>("/api/v1/users", "POST", payload);
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      // 新規作成時は初期パスワードを一度だけ表示する（遷移しない）。
      if (!userId && result.initialPassword) {
        setCreated({ email: form.email, password: result.initialPassword });
        return;
      }
      router.push("/admin/users");
      router.refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "保存に失敗しました"),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // 作成完了：初期パスワードを一度だけ提示する。再表示できないので控えてもらう。
  if (created) {
    return (
      <div className="max-w-2xl">
        <ContentBlock title="ユーザーを作成しました">
          <div className="space-y-3">
            <p className="text-sm">
              下の初期パスワードは<strong>この画面でしか表示されません</strong>
              。控えてから本人へ共有してください。
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
        if (!form.code.trim() || !form.name.trim() || !form.email.trim()) {
          setError("ユーザーコード・名前・メールアドレスは必須です");
          return;
        }
        setError(null);
        mutation.mutate();
      }}
      className="max-w-2xl space-y-4"
    >
      <ContentBlock title="基本情報">
        <div className="space-y-4">
          <FormField label="ユーザーコード" required>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="名前" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
          <FormField label="メールアドレス" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              borderRadius={shapes.inputRadius}
            />
          </FormField>
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <FormActions
        submitLabel="保存"
        pending={mutation.isPending}
        onCancel={() => router.push("/admin/users")}
      />
    </form>
  );
}
