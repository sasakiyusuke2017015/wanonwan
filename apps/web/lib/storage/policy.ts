// 添付の server-side ポリシー（許可 MIME と最大サイズ）。presign 前の検証と
// complete 時の HeadObject 検証の両方で使う純関数。クライアント申告は信用しない。

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 20MB

export const ALLOWED_CONTENT_TYPES: ReadonlySet<string> = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// MIME は大文字小文字を区別しない。前後空白・charset 等のパラメータは無視して型/サブ型で判定する。
export function isAllowedContentType(contentType: string): boolean {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return ALLOWED_CONTENT_TYPES.has(base);
}

export function isWithinMaxSize(bytes: number): boolean {
  return Number.isFinite(bytes) && bytes >= 0 && bytes <= MAX_ATTACHMENT_BYTES;
}
