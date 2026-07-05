"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type AnswerType } from "@waoon/domain";
import { useAppToast } from "@ui-catalog/core/providers";
import { apiGet, apiSend } from "@/lib/api/client";
import {
  QuestionForm,
  questionDraftToPayload,
  type QuestionDraft,
} from "@/components/admin/QuestionForm";

type MasterQuestion = {
  id: string;
  body: string;
  answerType: AnswerType;
  choices: string[];
  required: boolean;
  evalItem: string | null;
};

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useAppToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["question", id],
    queryFn: () => apiGet<{ data: MasterQuestion }>(`/api/v1/questions/${id}`),
  });

  const remove = useMutation({
    mutationFn: () => apiSend(`/api/v1/questions/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      router.push("/admin/questions");
    },
  });

  if (isLoading) return <p className="text-sm text-gray-500">読み込み中...</p>;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{(error as Error)?.message ?? "読み込みに失敗しました"}</p>;
  }

  const q = data.data;
  const initial: QuestionDraft = {
    body: q.body,
    answerType: q.answerType,
    choicesText: q.choices.join("\n"),
    required: q.required,
    evalItem: q.evalItem ?? "",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">設問マスタ 編集</h1>
      <p className="mb-4 text-xs text-gray-500">
        この設問を使う全アンケートに反映されます。削除すると、使用中のアンケートからも外れます。
      </p>
      <QuestionForm
        initial={initial}
        submitLabel="更新"
        onCancel={() => router.push("/admin/questions")}
        onSubmit={async (draft) => {
          await apiSend(`/api/v1/questions/${id}`, "PUT", questionDraftToPayload(draft));
          qc.invalidateQueries({ queryKey: ["questions"] });
          qc.invalidateQueries({ queryKey: ["question", id] });
          showToast("保存しました", { type: "success" });
          router.push("/admin/questions");
        }}
      />

      <div className="mt-8 border-t pt-4">
        <button
          type="button"
          onClick={() => {
            if (confirm("この設問をマスタから削除します（使用中のアンケートからも外れます）。よろしいですか？")) {
              remove.mutate();
            }
          }}
          disabled={remove.isPending}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
        >
          マスタから削除
        </button>
      </div>
    </div>
  );
}
