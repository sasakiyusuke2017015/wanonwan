-- アンケート（27917）/ 質問（27916）/ 使用質問 M:N（ClassA）/ 配信対象（ClassB/E/H/I）。
-- AI プロンプト列は保持のみ（使用は Phase 2 機能。MVP は Coming Soon）。

CREATE TABLE IF NOT EXISTS public.surveys (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             text   NOT NULL,
  status            text   NOT NULL DEFAULT 'draft',  -- 利用状況
  capacity          int,                              -- 定員
  requires_auth     boolean NOT NULL DEFAULT true,
  uses_ai           boolean NOT NULL DEFAULT false,
  base_prompt       text,
  instruction_set   text,
  grounding_context text,
  user_prompt       text,
  supporter_prompt  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 緊急度（urgency_levels, 35_urgency.sql）への参照。nullable。既存 DB へは冪等 ALTER で追加。
ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);

CREATE TABLE IF NOT EXISTS public.questions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  body            text   NOT NULL,                       -- 質問内容
  answer_type     text   NOT NULL,                       -- ラジオ/セレクト/チェック/テキスト/テキストエリア/電話/郵便
  choices         jsonb  NOT NULL DEFAULT '[]'::jsonb,    -- 選択肢
  sort_order      int    NOT NULL DEFAULT 0,
  required        boolean NOT NULL DEFAULT false,
  has_extra_field boolean NOT NULL DEFAULT false,
  eval_item       text,                                  -- 評価項目（満足度/業務負荷/職場環境/人間関係/ストレス）
  weight          numeric,
  tags            text[],
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
  survey_id   bigint NOT NULL REFERENCES public.surveys(id)   ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order  int    NOT NULL DEFAULT 0,
  PRIMARY KEY (survey_id, question_id)
);

-- 配信対象（役職/本部/部/課 の区分指定）
CREATE TABLE IF NOT EXISTS public.survey_targets (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id   bigint NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  target_type text   NOT NULL CHECK (target_type IN ('position','division','department','section')),
  target_code text   NOT NULL
);
