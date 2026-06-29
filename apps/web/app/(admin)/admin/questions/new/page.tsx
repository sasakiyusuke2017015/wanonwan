"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiSend } from "@/lib/api/client";
import {
  QuestionForm,
  EMPTY_QUESTION,
  questionDraftToPayload,
} from "@/components/admin/QuestionForm";

export default function NewQuestionPage() {
  const router = useRouter();
  const qc = useQueryClient();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">設問マスタ 新規作成</h1>
      <QuestionForm
        initial={EMPTY_QUESTION}
        submitLabel="作成"
        onCancel={() => router.push("/admin/questions")}
        onSubmit={async (draft) => {
          await apiSend("/api/v1/questions", "POST", questionDraftToPayload(draft));
          qc.invalidateQueries({ queryKey: ["questions"] });
          router.push("/admin/questions");
        }}
      />
    </div>
  );
}
