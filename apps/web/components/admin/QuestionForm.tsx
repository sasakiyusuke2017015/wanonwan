"use client";

import { useState } from "react";
import { CHOICE_TYPES, EVAL_ITEMS, QUESTION_TYPES, type AnswerType } from "@waoon/domain";
import { ApiError } from "@/lib/api/client";

export type QuestionDraft = {
  body: string;
  answerType: AnswerType;
  choicesText: string;
  required: boolean;
  evalItem: string; // "" = 評価項目なし
};

export const EMPTY_QUESTION: QuestionDraft = {
  body: "",
  answerType: "text",
  choicesText: "",
  required: false,
  evalItem: "",
};

// Draft を API ペイロード（CreateQuestionSchema）へ。choice 系以外は choices を空配列にする。
// evalItem は未選択("")なら送らず、API 側で null になる。
export function questionDraftToPayload(d: QuestionDraft) {
  const choices = CHOICE_TYPES.includes(d.answerType)
    ? d.choicesText.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    body: d.body,
    answerType: d.answerType,
    choices,
    required: d.required,
    evalItem: d.evalItem || undefined,
  };
}

const cls = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

// 設問の作成 / 編集フォーム。設問マスタ画面とアンケート編集内の双方で使う共通部品。
export function QuestionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: QuestionDraft;
  submitLabel: string;
  onSubmit: (draft: QuestionDraft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<QuestionDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needChoices = CHOICE_TYPES.includes(draft.answerType);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
          await onSubmit(draft);
          if (!onCancel) setDraft(initial); // 追加フォームはクリア
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "保存に失敗しました");
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-2"
    >
      <input
        className={cls}
        placeholder="質問文"
        value={draft.body}
        onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
        required
      />
      <div className="flex flex-wrap gap-2">
        <select
          className={cls + " sm:w-auto"}
          value={draft.answerType}
          onChange={(e) => setDraft((d) => ({ ...d, answerType: e.target.value as AnswerType }))}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={cls + " sm:w-auto"}
          value={draft.evalItem}
          onChange={(e) => setDraft((d) => ({ ...d, evalItem: e.target.value }))}
          aria-label="評価項目"
        >
          <option value="">評価項目なし</option>
          {EVAL_ITEMS.map((it) => (
            <option key={it.key} value={it.key}>{it.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
          />
          必須
        </label>
      </div>
      {needChoices && (
        <textarea
          className={cls}
          rows={3}
          placeholder="選択肢（1 行に 1 つ）"
          value={draft.choicesText}
          onChange={(e) => setDraft((d) => ({ ...d, choicesText: e.target.value }))}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50">
          {busy ? "..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded border px-3 py-1.5 text-sm">
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
