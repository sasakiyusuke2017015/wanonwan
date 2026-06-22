-- 非同期/定期ジョブ。pg_cron(10_pg_cron.sql で作成)で SQL を定期実行する土台。
-- 最初の実ジョブ: 添付の孤児掃除（presigned 発行のみで upload 未完了= status 100 の古い行を削除）。
-- 外部(MinIO 本体)には触れない純 SQL。MinIO オブジェクト本体の掃除は後続(pgmq + app worker)。
-- 詳細・段階分け: outputs/plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md

-- 孤児判定（純関数・副作用なし）。status=100(仮) のまま older_than を超えた添付を孤児とみなす。
-- now() を使うため STABLE。app_user にも安全に公開（テスト/参照用）。
CREATE OR REPLACE FUNCTION app.is_stale_attachment(
  status int,
  created_at timestamptz,
  older_than interval DEFAULT interval '1 day'
) RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT status = 100 AND created_at < now() - older_than $$;

GRANT EXECUTE ON FUNCTION app.is_stale_attachment(int, timestamptz, interval) TO app_user;

-- 孤児を削除し件数を返す。SECURITY DEFINER(owner=postgres) で RLS を跨ぐ全件掃除。
-- pg_cron(=postgres) のみが呼ぶ前提。search_path='' + 全識別子修飾でハイジャック対策。
CREATE OR REPLACE FUNCTION app.gc_stale_attachments(older_than interval DEFAULT interval '1 day')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted integer;
BEGIN
  DELETE FROM public.attachments
  WHERE app.is_stale_attachment(status, created_at, older_than);
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- app からは呼ばせない（pg_cron=postgres のみ）。
REVOKE ALL ON FUNCTION app.gc_stale_attachments(interval) FROM PUBLIC;

-- pg_cron 登録。同名 jobname なので migrate 再実行で冪等更新（重複登録されない）。30 分毎。
SELECT cron.schedule('gc-stale-attachments', '*/30 * * * *', $$ SELECT app.gc_stale_attachments() $$);
