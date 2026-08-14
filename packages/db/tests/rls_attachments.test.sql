-- attachments RLS の pgTAP（app_user 接続）。seed（member1 回答 / interviewer1=viewer / member2=無関係 / admin）に依存。
-- フィクスチャ: admin が (1) member1 の面談(interview) と (2) あるアンケート(survey) に添付を作る。
-- フィクスチャ INSERT が通ること自体が admin の書込 RLS の検証も兼ねる。
BEGIN;
SELECT plan(6);

SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
-- (1) interview 添付（entity_id = member1 の回答）
INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
SELECT 'interview',
       (SELECT a.id FROM public.answers a
          JOIN public.users u ON u.id = a.respondent_id
         WHERE u.gotrue_id = '00000000-0000-0000-0000-0000000a11ce' LIMIT 1),
       'wanonwan', 'interviews/fixture/obj-1', 'memo.pdf', 'application/pdf', app.uid();
-- (2) survey 添付（説明資料）
INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
SELECT 'survey', (SELECT id FROM public.surveys LIMIT 1),
       'wanonwan', 'surveys/fixture/obj-1', 'guide.pdf', 'application/pdf', app.uid();
SELECT ok((SELECT count(*) FROM public.attachments) >= 2, 'admin は全添付を読める（admin write も成功）');

-- member2: 無関係 → interview は見えない
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.attachments WHERE entity_type = 'interview'),
  0,
  'member2 は無関係の面談添付を読めない');
-- member2: 認証済み → survey 資料は見える
SELECT ok(
  (SELECT count(*) FROM public.attachments WHERE entity_type = 'survey') >= 1,
  'member2 も survey 資料は読める（認証済み）');

-- interviewer1: 閲覧者 → interview が見える
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT ok(
  (SELECT count(*) FROM public.attachments WHERE entity_type = 'interview') >= 1,
  'interviewer1 は閲覧者として面談添付を読める');

-- member2 は他人の面談へ添付を書けない（WITH CHECK 違反は 42501）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT throws_ok($$
  INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
  VALUES ('interview', 1, 'wanonwan', 'interviews/evil/obj', 'evil.pdf', 'application/pdf', app.uid())
$$, '42501', NULL, 'member2 は他人の面談へ添付を作成できない（書込は面談者/admin 限定）');

-- 未設定: fail-closed
SET LOCAL app.user_id = '';
SELECT is((SELECT count(*)::int FROM public.attachments), 0, '未設定では読めない (fail-closed)');

SELECT * FROM finish();
ROLLBACK;
