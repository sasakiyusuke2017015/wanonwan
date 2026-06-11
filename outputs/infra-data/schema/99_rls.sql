-- =====================================================================
-- RLS（最終ガード）。主認可は API 層、ここは「本人 / admin / 明示 viewer」の最小ガード。
-- 組織階層（課長=同課 等）の絞り込みは API 層が担う（計画レビュー §3.3 確定）。
-- postgres(superuser) は BYPASSRLS、app_user のみ RLS 対象。
-- 冪等化のため各ポリシーは DROP IF EXISTS → CREATE。
-- =====================================================================

-- app_user へ DML 付与（行の可視性は RLS が決める）
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- RLS 有効化
ALTER TABLE public.divisions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interview_candidates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_targets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_publications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_interview_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_viewers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules                  ENABLE ROW LEVEL SECURITY;

-- 認証済み判定の短縮
-- （関数化せず式で書く: app.current_user_id() IS NOT NULL）

-- ---- マスタ系: 認証済みは読める / 書きは admin のみ -------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'divisions','departments','sections','positions',
    'surveys','questions','survey_questions','survey_targets','survey_publications'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write  ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT USING (app.current_user_id() IS NOT NULL)', t, t);
    EXECUTE format(
      'CREATE POLICY %I_write ON public.%I FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())', t, t);
  END LOOP;
END $$;

-- ---- users: 認証済みは読める（ディレクトリ。階層絞りは API）/ 書きは admin ----
DROP POLICY IF EXISTS users_select ON public.users;
DROP POLICY IF EXISTS users_write  ON public.users;
CREATE POLICY users_select ON public.users FOR SELECT USING (app.current_user_id() IS NOT NULL);
CREATE POLICY users_write  ON public.users FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

-- ---- user_interview_candidates: 本人 or admin --------------------------
DROP POLICY IF EXISTS uic_select ON public.user_interview_candidates;
DROP POLICY IF EXISTS uic_write  ON public.user_interview_candidates;
CREATE POLICY uic_select ON public.user_interview_candidates FOR SELECT
  USING (app.is_admin() OR user_id = app.uid());
CREATE POLICY uic_write ON public.user_interview_candidates FOR ALL
  USING (app.is_admin()) WITH CHECK (app.is_admin());

-- ---- answers: 本人 / 面談者 / viewer / admin ---------------------------
DROP POLICY IF EXISTS answers_select ON public.answers;
DROP POLICY IF EXISTS answers_insert ON public.answers;
DROP POLICY IF EXISTS answers_update ON public.answers;
DROP POLICY IF EXISTS answers_delete ON public.answers;
CREATE POLICY answers_select ON public.answers FOR SELECT USING (
  app.is_admin()
  OR respondent_id  = app.uid()
  OR interviewer_id = app.uid()
  OR app.is_answer_viewer(answers.id)   -- SECURITY DEFINER で再帰回避
);
CREATE POLICY answers_insert ON public.answers FOR INSERT WITH CHECK (
  app.is_admin() OR respondent_id = app.uid()
);
CREATE POLICY answers_update ON public.answers FOR UPDATE USING (
  app.is_admin() OR respondent_id = app.uid() OR interviewer_id = app.uid()
) WITH CHECK (
  app.is_admin() OR respondent_id = app.uid() OR interviewer_id = app.uid()
);
CREATE POLICY answers_delete ON public.answers FOR DELETE USING (app.is_admin());

-- ---- answer_viewers / answer_interview_candidates: 当該 answer に紐づく ----
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['answer_viewers','answer_interview_candidates']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write  ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_select ON public.%I FOR SELECT USING (
        app.is_admin() OR app.owns_or_interviews_answer(%I.answer_id)
      )$f$, t, t, t);
    EXECUTE format($f$
      CREATE POLICY %I_write ON public.%I FOR ALL USING (
        app.is_admin() OR app.interviews_answer(%I.answer_id)
      ) WITH CHECK (
        app.is_admin() OR app.interviews_answer(%I.answer_id)
      )$f$, t, t, t, t);
  END LOOP;
END $$;

-- ---- schedules: 認証済みは読める / 書きは作成者 or admin ----------------
DROP POLICY IF EXISTS schedules_select ON public.schedules;
DROP POLICY IF EXISTS schedules_write  ON public.schedules;
CREATE POLICY schedules_select ON public.schedules FOR SELECT USING (app.current_user_id() IS NOT NULL);
CREATE POLICY schedules_write  ON public.schedules FOR ALL
  USING (app.is_admin() OR created_by = app.uid())
  WITH CHECK (app.is_admin() OR created_by = app.uid());
