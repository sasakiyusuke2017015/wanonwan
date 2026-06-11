-- 掲載設定（27918, Issues）。アンケートの公開・期間・状況。
-- status: 100 未掲載 / 150 予約 / 160 処理中 / 200 実施中 / 900 完了 / 910 保留 / 990 エラー
-- 回答受付は status=200（実施中）のときのみ（業務ルールは API 層で担保）。

CREATE TABLE IF NOT EXISTS public.survey_publications (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id  bigint NOT NULL REFERENCES public.surveys(id),
  title      text,
  body       text,
  status     int    NOT NULL DEFAULT 100,
  start_at   timestamptz,
  end_at     timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_survey ON public.survey_publications(survey_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON public.survey_publications(status);
