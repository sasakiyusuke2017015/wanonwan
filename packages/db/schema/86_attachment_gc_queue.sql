-- 添付 GC の非同期キュー（pgmq）。attachments の行が削除されたら MinIO の本体も消す必要があるが、
-- pg_cron/SQL は外部(MinIO)に届かない。そこで「削除時に bucket/object_key をキューへ積む」→
-- 専用 Node worker(apps/worker) がドレインして DeleteObject、という形にする。
-- 行削除すべて（Phase 1 GC・ユーザー削除・avatar 置換）をトリガで一律に捕捉する。
-- 詳細: outputs/plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md（Phase 2）

-- キューを冪等作成（migrate 再実行で重複させない）。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pgmq.list_queues() WHERE queue_name = 'attachment_gc') THEN
    PERFORM pgmq.create('attachment_gc');
  END IF;
END $$;

-- 削除された添付の object_key をキューへ積む（SECURITY DEFINER=postgres で pgmq へ書く）。
-- app_user の削除でも postgres 権限で enqueue される。search_path='' + 全識別子修飾。
CREATE OR REPLACE FUNCTION app.enqueue_attachment_gc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pgmq.send(
    'attachment_gc',
    jsonb_build_object('bucket', OLD.bucket, 'object_key', OLD.object_key)
  );
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION app.enqueue_attachment_gc() FROM PUBLIC;

DROP TRIGGER IF EXISTS attachments_gc_enqueue ON public.attachments;
CREATE TRIGGER attachments_gc_enqueue
  AFTER DELETE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION app.enqueue_attachment_gc();
