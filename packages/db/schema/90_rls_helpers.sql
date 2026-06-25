-- RLS ヘルパ。current_user_id()(gotrue uuid) から業務ユーザーへ解決する。
-- users/positions を読むため SECURITY DEFINER で RLS をバイパス（search_path 固定で hijack 防止）。

-- 現在の業務ユーザー id（gotrue_id → users.id）
CREATE OR REPLACE FUNCTION app.uid() RETURNS bigint
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT u.id FROM public.users u WHERE u.gotrue_id = app.current_user_id() $$;

-- 管理者判定（認可ロール）。権限は役職(position)と別軸で users.role が源（30_users.sql）。
CREATE OR REPLACE FUNCTION app.is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.gotrue_id = app.current_user_id()
        AND u.role = 'admin'
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
GRANT EXECUTE ON FUNCTION app.is_answer_viewer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.owns_or_interviews_answer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.interviews_answer(bigint) TO app_user;
