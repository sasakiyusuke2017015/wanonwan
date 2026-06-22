-- ユーザー（Pleasanter ユーザーマスタ 27924 由来）。
-- 認証は GoTrue。業務ユーザーと GoTrue identity を gotrue_id で紐付ける（provisioning は管理画面で）。
-- パスワード/ロック/失敗回数は GoTrue 側が持つため列に持たない。

CREATE TABLE IF NOT EXISTS public.users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gotrue_id     uuid   UNIQUE,              -- GoTrue user id（未 provisioning は NULL）
  code          text   UNIQUE NOT NULL,     -- ユーザーコード
  name          text   NOT NULL,
  email         text   UNIQUE NOT NULL,
  position_id   bigint REFERENCES public.positions(id),
  division_id   bigint REFERENCES public.divisions(id),
  department_id bigint REFERENCES public.departments(id),
  section_id    bigint REFERENCES public.sections(id),
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 追加面談候補（多値 ClassH を正規化）
CREATE TABLE IF NOT EXISTS public.user_interview_candidates (
  user_id           bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, candidate_user_id)
);
