// force-change フラグの単一定義。create / reset / change-password / jwt 抽出の
// 4 箇所で同じキーを使うため、文字列リテラルの散在を禁じてここに集約する。
export const MUST_CHANGE_PASSWORD_KEY = "must_change_password";

// GoTrue の app_metadata に渡すフラグオブジェクトを組み立てる（service_role のみ設定可）。
export function mustChangeAppMetadata(flag: boolean): Record<string, boolean> {
  return { [MUST_CHANGE_PASSWORD_KEY]: flag };
}

// app_metadata（unknown 由来）から force-change フラグを strict に読む。
// 文字列 "false" や欠落を誤って真にしないよう、=== true のみを真とする。
export function readMustChangePassword(appMetadata: unknown): boolean {
  if (typeof appMetadata !== "object" || appMetadata === null) return false;
  return (appMetadata as Record<string, unknown>)[MUST_CHANGE_PASSWORD_KEY] === true;
}
