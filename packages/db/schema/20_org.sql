-- 組織マスタ（本部 / 部 / 課 / 役職）。Pleasanter 区分マスタ(Wikis)由来。
-- 純粋な HR マスタ。権限ロールとは別軸で、認可は user_roles が源（30_users.sql）。

CREATE TABLE IF NOT EXISTS public.divisions (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text   UNIQUE NOT NULL,
  name text   NOT NULL
);

CREATE TABLE IF NOT EXISTS public.departments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text   UNIQUE NOT NULL,
  name        text   NOT NULL,
  division_id bigint REFERENCES public.divisions(id)
);

CREATE TABLE IF NOT EXISTS public.sections (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text   UNIQUE NOT NULL,
  name          text   NOT NULL,
  department_id bigint REFERENCES public.departments(id)
);

CREATE TABLE IF NOT EXISTS public.positions (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code int    UNIQUE NOT NULL,   -- HR 上の序列コード（権限ロールとは無関係）
  name text   NOT NULL
);
