-- RLS テスト兼デモ用フィクスチャ（冪等）。
-- alice を回答者とするサンプル回答を作り、bob を面談内容閲覧者にする。
-- carol は無関係（否定テスト）。

-- サンプルアンケート + 掲載
INSERT INTO public.surveys (title)
  SELECT 'サンプル面談アンケート'
  WHERE NOT EXISTS (SELECT 1 FROM public.surveys WHERE title = 'サンプル面談アンケート');

INSERT INTO public.survey_publications (survey_id, status)
  SELECT s.id, 200 FROM public.surveys s
  WHERE s.title = 'サンプル面談アンケート'
    AND NOT EXISTS (SELECT 1 FROM public.survey_publications p WHERE p.survey_id = s.id);

-- alice の回答
INSERT INTO public.answers (publication_id, respondent_id, status)
  SELECT p.id, (SELECT id FROM public.users WHERE email = 'alice@example.com'), 200
  FROM public.survey_publications p
  JOIN public.surveys s ON s.id = p.survey_id
  WHERE s.title = 'サンプル面談アンケート'
    AND NOT EXISTS (
      SELECT 1 FROM public.answers a
      WHERE a.publication_id = p.id
        AND a.respondent_id = (SELECT id FROM public.users WHERE email = 'alice@example.com')
    );

-- bob を閲覧者に
INSERT INTO public.answer_viewers (answer_id, user_id)
  SELECT a.id, (SELECT id FROM public.users WHERE email = 'bob@example.com')
  FROM public.answers a
  JOIN public.survey_publications p ON p.id = a.publication_id
  JOIN public.surveys s ON s.id = p.survey_id
  WHERE s.title = 'サンプル面談アンケート'
    AND a.respondent_id = (SELECT id FROM public.users WHERE email = 'alice@example.com')
  ON CONFLICT DO NOTHING;
