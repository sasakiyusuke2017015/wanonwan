-- 組織マスタ（本部 / 部 / 課 / 役職）。Pleasanter 区分マスタ(Wikis)由来。
-- 役職コード(positions.code)が権限ロールを決める（300-499 employee … 990-999 admin）。

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
  code int    UNIQUE NOT NULL,   -- ロール判定の源（範囲で employee..admin）
  name text   NOT NULL
);
