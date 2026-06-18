-- attachments RLS の pgTAP（app_user 接続）。seed（alice 回答 / bob=viewer / carol=無関係 / admin）に依存。
-- フィクスチャ: admin が alice の回答（=面談記録 interview）に添付を 1 件作る。
-- このフィクスチャ INSERT が通ること自体が admin の書込 RLS の検証も兼ねる。
BEGIN;
SELECT plan(4);

-- admin: フィクスチャ添付を作成（interview = alice の回答に紐づく）。admin write が通る前提。
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
INSERT INTO public.attachments (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by)
SELECT 'interview',
       (SELECT a.id FROM public.answers a
          JOIN public.users u ON u.id = a.respondent_id
         WHERE u.gotrue_id = '00000000-0000-0000-0000-0000000a11ce'
         LIMIT 1),
       'waoon', 'interviews/fixture/obj-1', 'memo.pdf', 'application/pdf', app.uid();
SELECT ok((SELECT count(*) FROM public.attachments) >= 1, 'admin は添付を読める（admin write も成功）');

-- carol: 無関係 → 見えない
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is((SELECT count(*)::int FROM public.attachments), 0, 'carol は無関係の添付を読めない');

-- bob: 閲覧者 → 見える
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT ok((SELECT count(*) FROM public.attachments) >= 1, 'bob は閲覧者として添付を読める');

-- 未設定: fail-closed
SET LOCAL app.user_id = '';
SELECT is((SELECT count(*)::int FROM public.attachments), 0, '未設定では読めない (fail-closed)');

SELECT * FROM finish();
ROLLBACK;
