"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

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

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const { data: org } = useQuery({ queryKey: ["org"], queryFn: () => apiGet<{ data: Org }>("/api/v1/org") });
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
        ? apiSend(`/api/v1/users/${userId}`, "PUT", payload)
        : apiSend("/api/v1/users", "POST", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      router.push("/admin/users");
      router.refresh();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "保存に失敗しました"),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="max-w-lg space-y-4"
    >
      <Field label="ユーザーコード" required>
        <input className={inputCls} value={form.code} onChange={(e) => set("code", e.target.value)} required />
      </Field>
      <Field label="名前" required>
        <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </Field>
      <Field label="メールアドレス" required>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </Field>
      <Field label="役職">
        <Select value={form.positionId} onChange={(v) => set("positionId", v)} items={org?.data.positions} />
      </Field>
      <Field label="所属本部">
        <Select value={form.divisionId} onChange={(v) => set("divisionId", v)} items={org?.data.divisions} />
      </Field>
      <Field label="所属部">
        <Select value={form.departmentId} onChange={(v) => set("departmentId", v)} items={org?.data.departments} />
      </Field>
      <Field label="所属課">
        <Select value={form.sectionId} onChange={(v) => set("sectionId", v)} items={org?.data.sections} />
      </Field>

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
          onClick={() => router.push("/admin/users")}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

const inputCls = "mt-1 w-full rounded border border-gray-300 px-3 py-2";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items?: OrgItem[];
}) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">（未選択）</option>
      {items?.map((it) => (
        <option key={it.id} value={it.id}>
          {it.name}
        </option>
      ))}
    </select>
  );
}
