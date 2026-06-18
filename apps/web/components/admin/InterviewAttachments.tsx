"use client";

import { useEffect, useState } from "react";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

type Attachment = {
  id: number;
  filename: string;
  contentType: string;
  sizeBytes: number | null;
  status: number;
};

// 面談記録の添付。presigned URL で MinIO へ直接 up/down する。
// 1) POST で presigned PUT URL を取得 → 2) ブラウザが MinIO へ PUT → 3) PATCH で確定。
export function InterviewAttachments({ answerId }: { answerId: string }) {
  const entityId = Number(answerId);
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await apiGet<{ data: Attachment[] }>(
      `/api/v1/attachments?entityType=interview&entityId=${entityId}`,
    );
    setItems(res.data);
  }

  useEffect(() => {
    reload().catch(() => setError("添付の取得に失敗しました"));
  }, [entityId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const contentType = file.type || "application/octet-stream";
    try {
      const { data } = await apiSend<{ data: { id: number; uploadUrl: string } }>(
        "/api/v1/attachments",
        "POST",
        { entityType: "interview", entityId, filename: file.name, contentType },
      );
      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });
      if (!put.ok) throw new Error("MinIO へのアップロードに失敗しました");
      await apiSend(`/api/v1/attachments/${data.id}`, "PATCH", { sizeBytes: file.size });
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "アップロードに失敗しました",
      );
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onDownload(id: number) {
    try {
      const { data } = await apiGet<{ data: { downloadUrl: string } }>(`/api/v1/attachments/${id}`);
      window.open(data.downloadUrl, "_blank", "noopener");
    } catch {
      setError("ダウンロード URL の取得に失敗しました");
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await apiSend(`/api/v1/attachments/${id}`, "DELETE");
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "削除に失敗しました");
    }
  }

  return (
    <ContentBlock title="添付資料">
      <div className="space-y-3">
        <input type="file" onChange={onUpload} disabled={busy} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ul className="space-y-1 text-sm">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <button
                type="button"
                className="text-blue-700 underline"
                onClick={() => onDownload(a.id)}
              >
                {a.filename}
              </button>
              <button type="button" className="text-red-600" onClick={() => onDelete(a.id)}>
                削除
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="text-gray-400">添付はありません</li>}
        </ul>
      </div>
    </ContentBlock>
  );
}
