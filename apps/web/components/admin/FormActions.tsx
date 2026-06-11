"use client";

import { Button } from "@ui-catalog/core/molecules";
import { useTheme } from "@ui-catalog/core/infra/theme";

type Props = {
  submitLabel: string;
  pendingLabel?: string;
  pending?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
};

// 管理フォーム共通の保存/キャンセルボタン列。テーマの buttonRadius を適用する。
// （管理画面は (admin) ガード配下でクライアント描画のみ＝SSR されないため mounted ゲートは不要。）
export function FormActions({
  submitLabel,
  pendingLabel = "保存中...",
  pending = false,
  onCancel,
  cancelLabel = "キャンセル",
}: Props) {
  const { shapes } = useTheme();
  return (
    <div className="flex gap-2">
      <Button type="submit" loading={pending} disabled={pending} borderRadius={shapes.buttonRadius}>
        {pending ? pendingLabel : submitLabel}
      </Button>
      {onCancel && (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          borderRadius={shapes.buttonRadius}
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  );
}
