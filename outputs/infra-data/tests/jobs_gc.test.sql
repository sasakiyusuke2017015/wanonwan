-- 添付孤児掃除の判定ロジック（app.is_stale_attachment）の pgTAP（app_user 接続・純関数）。
-- 削除本体 app.gc_stale_attachments は特権(SECURITY DEFINER)のため runtime 検証（Plan §4）。
BEGIN;
SELECT plan(5);

-- 仮(100) かつ古い → 孤児
SELECT ok(
  app.is_stale_attachment(100, now() - interval '2 days'),
  'status=100 で 2 日前は孤児');

-- 仮(100) だが直近 → 孤児でない
SELECT ok(
  NOT app.is_stale_attachment(100, now()),
  'status=100 でも直近は孤児でない');

-- 確定(200) は古くても孤児でない
SELECT ok(
  NOT app.is_stale_attachment(200, now() - interval '30 days'),
  'status=200(確定) は古くても孤児でない');

-- 閾値を渡す: older_than=1h なら 2h 前の 100 は孤児
SELECT ok(
  app.is_stale_attachment(100, now() - interval '2 hours', interval '1 hour'),
  'older_than=1h なら 2h 前の status=100 は孤児');

-- 閾値ちょうど未満は孤児でない（境界: 30 分前 < 1h 閾値）
SELECT ok(
  NOT app.is_stale_attachment(100, now() - interval '30 minutes', interval '1 hour'),
  'older_than=1h なら 30 分前の status=100 は孤児でない');

SELECT * FROM finish();
ROLLBACK;
