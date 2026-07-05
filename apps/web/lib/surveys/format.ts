// 公開一覧・回答画面の日付表示（閲覧者のローカル TZ・日本語表記）。

export const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) : "未設定";

export const fmtPeriod = (start: string | null, end: string | null) =>
  `${fmtDate(start)} 〜 ${fmtDate(end)}`;
