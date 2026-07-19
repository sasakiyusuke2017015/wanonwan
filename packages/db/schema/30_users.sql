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

-- 認可ロール。役職(position)とは別軸: 役職は HR の肩書き、role はシステム権限。
-- member は全ユーザーが暗黙保有（行なし = member のみ）。上位ロールだけを行として持つため、
-- 「ロール 0 個のユーザー」という不正状態が構造的に存在しない。
-- 認可はこの保有集合(union)で判定する。UI のアクティブロール切替は表示状態であり認可には使わない。
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role    text   NOT NULL CHECK (role IN ('admin', 'interviewer')),
  PRIMARY KEY (user_id, role)
);

-- 既存環境向け: 旧 users.role 単一列から user_roles へ移行して列を落とす。
-- schema は再適用されるため、列が残っている環境でのみ実行（冪等）。
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
      SELECT id, 'admin' FROM public.users WHERE role = 'admin'
      ON CONFLICT DO NOTHING;
    ALTER TABLE public.users DROP COLUMN role;
  END IF;
END $$;

-- 追加面談候補（多値 ClassH を正規化）
CREATE TABLE IF NOT EXISTS public.user_interview_candidates (
  user_id           bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, candidate_user_id)
);
