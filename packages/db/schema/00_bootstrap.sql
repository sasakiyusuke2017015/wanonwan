-- waoon DB ブートストラップ（dev）。
-- initdb.d で初回起動時に postgres(superuser) として waoon DB に対して実行される。
-- これにより GoTrue が接続できる状態（auth スキーマ + supabase_auth_admin ロール）を先に作る。
-- 本番(stg/prod)のパスワードは env 由来へ差し替える（Phase 6）。dev 専用の固定値。

-- ロール分離（技術選定メモ「DB ユーザの権限分離」）:
--   supabase_auth_admin … GoTrue 用、auth スキーマのみ
--   app_user            … apps/web 用、public スキーマのみ（auth に触らない）
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin LOGIN PASSWORD 'authadmin' NOINHERIT CREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'app';
  END IF;
END
$$;

-- スキーマ
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
CREATE SCHEMA IF NOT EXISTS app;   -- RLS ヘルパ等を置く

-- 拡張（pg_cron は shared_preload_libraries の関係で別ファイル 10_pg_cron.sql / db:migrate で作成）
CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector
CREATE EXTENSION IF NOT EXISTS pgtap;
CREATE EXTENSION IF NOT EXISTS pgmq;     -- pgmq は自前で pgmq スキーマを作る

-- 権限分離の徹底
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
REVOKE ALL ON SCHEMA auth FROM app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA app TO app_user;

-- =====================================================================
-- RLS ユーザーコンテキスト（計画レビュー BLOCKER① 対応）
-- API/Server Action は DB トランザクション開始時に
--   SET LOCAL app.user_id = '<gotrue の sub(uuid)>'
-- を注入する。未設定なら NULL を返し、RLS は何も通さない（fail-closed）。
-- GUC 名は予約語 current_user と衝突しないよう app.user_id にする。
-- =====================================================================
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT NULLIF(current_setting('app.user_id', true), '')::uuid $$;

-- 管理者判定。users / user_roles テーブルは後続スキーマで作成するため、現段階は常に false。
-- 90_rls_helpers.sql が user_roles（保有ロール）を参照する実装へ差し替える。
CREATE OR REPLACE FUNCTION app.is_admin() RETURNS boolean
  LANGUAGE sql STABLE
  AS $$ SELECT FALSE $$;

GRANT EXECUTE ON FUNCTION app.current_user_id() TO app_user;
GRANT EXECUTE ON FUNCTION app.is_admin() TO app_user;
