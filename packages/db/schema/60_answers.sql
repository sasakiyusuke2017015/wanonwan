-- 回答結果（27919）。1on1 の中核（機微情報: 健康状態・評価・面談メモ）。
-- status: 100 未回答 / 200 回答済 / 400 面談調整済 / 900 完了
-- 多値（面談候補 ClassG / 面談内容閲覧者 ClassH）は中間テーブルへ正規化。閲覧者は RLS の可視範囲に直結。

CREATE TABLE IF NOT EXISTS public.answers (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  publication_id   bigint NOT NULL REFERENCES public.survey_publications(id),
  respondent_id    bigint NOT NULL REFERENCES public.users(id),
  status           int    NOT NULL DEFAULT 100,
  answer_json      jsonb  NOT NULL DEFAULT '{}'::jsonb,   -- 設問回答
  evaluation       jsonb,                                 -- 満足度/業務負荷/職場環境/人間関係/ストレス
  health_status    int,                                   -- 100-999
  interview_method int    CHECK (interview_method IN (1,2,3)),  -- 1 対面 / 2 Web / 3 電話
  interviewer_id   bigint REFERENCES public.users(id),
  answered_at      timestamptz,
  interview_at     timestamptz,
  interview_memo   text,
  next_action      text,
  -- AI 生成（保持のみ・Phase 2）
  supporter_prompt text,
  supporter_answer text,
  user_prompt      text,
  user_answer      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_publication ON public.answers(publication_id);
CREATE INDEX IF NOT EXISTS idx_answers_respondent  ON public.answers(respondent_id);
CREATE INDEX IF NOT EXISTS idx_answers_interviewer ON public.answers(interviewer_id);

-- 面談候補（多値）
CREATE TABLE IF NOT EXISTS public.answer_interview_candidates (
  answer_id bigint NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  PRIMARY KEY (answer_id, user_id)
);

-- 面談内容閲覧者（多値）。RLS の閲覧許可に使う。
CREATE TABLE IF NOT EXISTS public.answer_viewers (
  answer_id bigint NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  PRIMARY KEY (answer_id, user_id)
);
