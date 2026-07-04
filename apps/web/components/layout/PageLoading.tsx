import { Spinner } from "@ui-catalog/core/atoms";

// ルートセグメントの loading.tsx から使う共通ローディング表示。
export function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="読み込み中">
      <Spinner size="lg" />
    </div>
  );
}
