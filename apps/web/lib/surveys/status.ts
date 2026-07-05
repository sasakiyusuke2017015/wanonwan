// 公開一覧・回答画面の表示用: 締切の強調と回答状態の 3 値判定。

export type DeadlineInfo = { label: string; color: "red" | "orange" | "gray" };

const DAY_MS = 24 * 60 * 60 * 1000;
const EMPHASIS_DAYS = 3;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// 日付粒度で締切訴求ラベルを返す。締切が遠い / 未設定なら null。
// 「本日」の境界は実行環境（= 閲覧者のブラウザ）のローカル TZ で判定する。
export function deadlineInfo(endAt: string | null, now: Date = new Date()): DeadlineInfo | null {
  if (!endAt) return null;
  const days = Math.round((startOfDay(new Date(endAt)).getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (days < 0) return { label: "締切超過", color: "gray" };
  if (days === 0) return { label: "本日締切", color: "red" };
  if (days <= EMPHASIS_DAYS) return { label: `あと${days}日`, color: "orange" };
  return null;
}

export type AnswerState = "none" | "draft" | "submitted";

// answers.status は 200 以上（回答済/面談調整済/完了）で提出扱い。
// レコードはあるが 200 未満（100=未回答）は下書き = 「続きから回答」導線を出す。
export function answerState(answerId: string | null, answerStatus: number | null): AnswerState {
  if (!answerId) return "none";
  return answerStatus != null && answerStatus >= 200 ? "submitted" : "draft";
}
