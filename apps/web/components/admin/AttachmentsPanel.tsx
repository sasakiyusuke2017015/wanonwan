"use client";

import { useEffect, useState } from "react";
import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { ConfirmDialog } from "@ui-catalog/core/organisms";
import { useConfirm } from "@ui-catalog/core/hooks/ui";
import { useAppToast } from "@ui-catalog/core/providers";
import { ApiError, apiGet, apiSend } from "@/lib/api/client";

export type AttachmentEntity = "answer" | "interview" | "user_avatar" | "survey";

type Attachment = {
  id: number;
  filename: string;
  contentType: string;
  sizeBytes: number | null;
  status: number;
};

// 添付パネル（presigned URL で MinIO へ直接 up/down）。entityType/entityId で対象に紐づく。
// 1) POST で presigned PUT URL 取得 → 2) ブラウザが MinIO へ PUT → 3) PATCH で確定。
export function AttachmentsPanel({
  entityType,
  entityId,
  title = "添付資料",
}: {
  entityType: AttachmentEntity;
  entityId: number;
  title?: string;
}) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useAppToast();
  const { confirmState, showConfirm, handleConfirm, handleCancel } = useConfirm();

  async function reload() {
    const res = await apiGet<{ data: Attachment[] }>(
      `/api/v1/attachments?entityType=${entityType}&entityId=${entityId}`,
    );
    setItems(res.data);
  }

  useEffect(() => {
    reload().catch(() => setError("添付の取得に失敗しました"));
  }, [entityType, entityId]);

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
        { entityType, entityId, filename: file.name, contentType },
      );
      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });
      if (!put.ok) throw new Error("MinIO へのアップロードに失敗しました");
      // 確定はサーバが MinIO の実オブジェクトを検証して size を確定する（client 申告は送らない）。
      await apiSend(`/api/v1/attachments/${data.id}`, "PATCH");
      await reload();
      showToast("アップロードしました", { type: "success" });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "アップロードに失敗しました";
      setError(message);
      showToast(message, { type: "error" });
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
      showToast("削除しました", { type: "success" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "削除に失敗しました";
      setError(message);
      showToast(message, { type: "error" });
    }
  }

  return (
    <ContentBlock title={title}>
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
              <button
                type="button"
                className="text-red-600"
                onClick={() =>
                  showConfirm(`添付「${a.filename}」を削除しますか？`, {
                    title: "添付の削除",
                    type: "danger",
                    confirmText: "削除",
                    onConfirm: () => void onDelete(a.id),
                  })
                }
              >
                削除
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="text-gray-400">添付はありません</li>}
        </ul>
      </div>
      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ContentBlock>
  );
}
