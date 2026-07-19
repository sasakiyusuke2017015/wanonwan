-- RLS ヘルパ。current_user_id()(gotrue uuid) から業務ユーザーへ解決する。
-- users/positions を読むため SECURITY DEFINER で RLS をバイパス（search_path 固定で hijack 防止）。

-- 現在の業務ユーザー id（gotrue_id → users.id）
CREATE OR REPLACE FUNCTION app.uid() RETURNS bigint
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT u.id FROM public.users u WHERE u.gotrue_id = app.current_user_id() $$;

-- 管理者判定（認可ロール）。権限は役職(position)と別軸で user_roles が源（30_users.sql）。
-- 認可は保有ロールの集合(union)で判定する。UI のアクティブロール切替は表示状態であり、ここでは見ない。
CREATE OR REPLACE FUNCTION app.is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = 'admin'
    )
  $$;

-- 上位ロール保有判定（API 層の capability ゲート用。例: has_role('interviewer')）。
-- member は暗黙保有（user_roles に行を持たない）ため、引数は上位ロールのみ意味を持つ。
CREATE OR REPLACE FUNCTION app.has_role(p_role text) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = p_role
    )
  $$;

-- answers ⇄ answer_viewers/candidates の相互参照で RLS が無限再帰しないよう、
-- 横参照は SECURITY DEFINER 関数（RLS バイパス）で判定する。
CREATE OR REPLACE FUNCTION app.is_answer_viewer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answer_viewers v WHERE v.answer_id = p_answer_id AND v.user_id = app.uid()
  ) $$;

CREATE OR REPLACE FUNCTION app.owns_or_interviews_answer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a
    WHERE a.id = p_answer_id AND (a.respondent_id = app.uid() OR a.interviewer_id = app.uid())
  ) $$;

CREATE OR REPLACE FUNCTION app.interviews_answer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a WHERE a.id = p_answer_id AND a.interviewer_id = app.uid()
  ) $$;

GRANT EXECUTE ON FUNCTION app.uid() TO app_user;
GRANT EXECUTE ON FUNCTION app.is_admin() TO app_user;
GRANT EXECUTE ON FUNCTION app.has_role(text) TO app_user;
GRANT EXECUTE ON FUNCTION app.is_answer_viewer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.owns_or_interviews_answer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.interviews_answer(bigint) TO app_user;
