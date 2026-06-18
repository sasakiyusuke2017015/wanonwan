-- attachments RLS の pgTAP（app_user 接続）。seed（alice 回答 / bob=viewer / carol=無関係 / admin）に依存。
-- フィクスチャ: admin が (1) alice の面談(interview) と (2) あるアンケート(survey) に添付を作る。
-- フィクスチャ INSERT が通ること自体が admin の書込 RLS の検証も兼ねる。
BEGIN;
SELECT plan(6);

SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
-- (1) interview 添付（entity_id = alice の回答）
INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
SELECT 'interview',
       (SELECT a.id FROM public.answers a
          JOIN public.users u ON u.id = a.respondent_id
         WHERE u.gotrue_id = '00000000-0000-0000-0000-0000000a11ce' LIMIT 1),
       'waoon', 'interviews/fixture/obj-1', 'memo.pdf', 'application/pdf', app.uid();
-- (2) survey 添付（説明資料）
INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
SELECT 'survey', (SELECT id FROM public.surveys LIMIT 1),
       'waoon', 'surveys/fixture/obj-1', 'guide.pdf', 'application/pdf', app.uid();
SELECT ok((SELECT count(*) FROM public.attachments) >= 2, 'admin は全添付を読める（admin write も成功）');

-- carol: 無関係 → interview は見えない
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.attachments WHERE entity_type = 'interview'),
  0,
  'carol は無関係の面談添付を読めない');
-- carol: 認証済み → survey 資料は見える
SELECT ok(
  (SELECT count(*) FROM public.attachments WHERE entity_type = 'survey') >= 1,
  'carol も survey 資料は読める（認証済み）');

-- bob: 閲覧者 → interview が見える
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT ok(
  (SELECT count(*) FROM public.attachments WHERE entity_type = 'interview') >= 1,
  'bob は閲覧者として面談添付を読める');

-- carol は他人の面談へ添付を書けない（WITH CHECK 違反は 42501）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT throws_ok($$
  INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
  VALUES ('interview', 1, 'waoon', 'interviews/evil/obj', 'evil.pdf', 'application/pdf', app.uid())
$$, '42501', NULL, 'carol は他人の面談へ添付を作成できない（書込は面談者/admin 限定）');

-- 未設定: fail-closed
SET LOCAL app.user_id = '';
SELECT is((SELECT count(*)::int FROM public.attachments), 0, '未設定では読めない (fail-closed)');

SELECT * FROM finish();
ROLLBACK;
