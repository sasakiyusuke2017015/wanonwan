-- 緊急度マスタ（urgency_levels）。高 / 中 / 低 などの段階を表す業務マスタ。
-- surveys / answers から urgency_id で参照される（参照側の列追加は 40_surveys / 60_answers 内）。
-- 役職と無関係な純粋業務マスタ。RLS は 99_rls.sql のマスタ系（認証済み select / admin write）。
-- FK 順のため surveys(40) / answers(60) より前の番号で作成する。

CREATE TABLE IF NOT EXISTS public.urgency_levels (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code int    UNIQUE NOT NULL,   -- 並び順兼一意キー（例 1=低 / 2=中 / 3=高）
  name text   NOT NULL
);
