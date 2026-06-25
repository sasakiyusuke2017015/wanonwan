-- ユーザー（Pleasanter ユーザーマスタ 27924 由来）。
-- 認証は GoTrue。業務ユーザーと GoTrue identity を gotrue_id で紐付ける（provisioning は管理画面で）。
-- パスワード/ロック/失敗回数は GoTrue 側が持つため列に持たない。

CREATE TABLE IF NOT EXISTS public.users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gotrue_id     uuid   UNIQUE,              -- GoTrue user id（未 provisioning は NULL）
  code          text   UNIQUE NOT NULL,     -- ユーザーコード
  name          text   NOT NULL,
  email         text   UNIQUE NOT NULL,
  -- 認可ロール。役職(position)とは別軸: 役職は HR の肩書き、role はシステム権限。
  -- app.is_admin() の唯一の源（90_rls_helpers.sql）。
  role          text   NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  position_id   bigint REFERENCES public.positions(id),
  division_id   bigint REFERENCES public.divisions(id),
  department_id bigint REFERENCES public.departments(id),
  section_id    bigint REFERENCES public.sections(id),
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 既存環境向け（CREATE TABLE IF NOT EXISTS は列を追加しないため）。pre-prod 前提・冪等。
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'member'));
  END IF;
END $$;

-- 追加面談候補（多値 ClassH を正規化）
CREATE TABLE IF NOT EXISTS public.user_interview_candidates (
  user_id           bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, candidate_user_id)
);
