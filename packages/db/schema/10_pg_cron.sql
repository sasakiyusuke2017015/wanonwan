-- pg_cron は shared_preload_libraries に登録済み（Dockerfile.db）。
-- サーバ完全起動後でないと有効化できないため、initdb.d ではなく db:migrate で作成する。
-- cron.database_name = waoon（Dockerfile.db）。
CREATE EXTENSION IF NOT EXISTS pg_cron;
