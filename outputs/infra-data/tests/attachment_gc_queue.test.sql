-- 添付削除→pgmq enqueue の配線が存在することの pgTAP（app_user 接続）。
-- enqueue の実値検証（pgmq 内部表の読み取り）は app_user 権限外のため runtime（笹木さん）。
-- ここでは「DELETE トリガが attachments に張られている」ことを catalog で確認する回帰ガード。
BEGIN;
SELECT plan(2);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'attachments_gc_enqueue'
      AND tgrelid = 'public.attachments'::regclass
      AND NOT tgisinternal
  ),
  'attachments に DELETE enqueue トリガが存在する');

SELECT ok(
  (SELECT tgtype & 8 = 8 FROM pg_trigger WHERE tgname = 'attachments_gc_enqueue'),
  'トリガは DELETE で発火する（tgtype の DELETE ビット）');

SELECT * FROM finish();
ROLLBACK;
