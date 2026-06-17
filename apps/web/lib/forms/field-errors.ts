import * as v from "valibot";

// valibot スキーマで value を検証し、フィールド名 → 先頭エラーメッセージのマップを返す。
// 検証成功なら空オブジェクト。フォーム submit 時の field 単位エラー表示に使う。
// メッセージはスキーマ側（@waoon/domain）で日本語化したものをそのまま出す。
export function fieldErrorsOf<TSchema extends v.GenericSchema>(
  schema: TSchema,
  value: unknown,
): Record<string, string> {
  const result = v.safeParse(schema, value);
  if (result.success) return {};

  const nested = v.flatten(result.issues).nested ?? {};
  const errors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(nested)) {
    if (messages && messages.length > 0) errors[field] = messages[0];
  }
  return errors;
}
