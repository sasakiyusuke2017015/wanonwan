// アプリは日本語のみ・単一タイムゾーン（JST, +09:00, DST 無し）前提。
//
// `<input type="datetime-local">` の値にはタイムゾーン情報が無い。これを「JST の
// 壁時計」として解釈し、DB(timestamptz)へは**絶対時刻(UTC ISO)**で渡す。表示・編集
// 時は逆変換して JST の壁時計に戻す。これをしないと datetime-local の値が UTC として
// 保存され、実際の掲載開始/終了の瞬間が 9 時間ずれる。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

// datetime-local("YYYY-MM-DDTHH:mm" = JST 壁時計) → UTC の ISO 文字列。空/無効は null。
export function jstInputToUtcIso(local: string | null | undefined): string | null {
  if (!local) return null;
  // 秒以下が付いていても分まで丸めて JST として解釈する。
  const d = new Date(`${local.slice(0, 16)}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// UTC ISO → datetime-local 用の JST 壁時計("YYYY-MM-DDTHH:mm")。空/無効は ""。
export function utcIsoToJstInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  // 瞬間を +9h ずらすと、その UTC 表現が JST の壁時計と一致する。
  return new Date(t + JST_OFFSET_MS).toISOString().slice(0, 16);
}

// 表示用: UTC ISO → "YYYY-MM-DD HH:mm"（JST）。空/無効は ""。
export function formatJstDateTime(iso: string | null | undefined): string {
  const local = utcIsoToJstInput(iso);
  return local ? local.replace("T", " ") : "";
}
