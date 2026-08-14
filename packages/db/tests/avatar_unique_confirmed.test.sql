-- アバター unique index が「確定済み(status=200)のみ 1 ユーザー 1 枚」であることの pgTAP（app_user 接続）。
-- admin 文脈で自分の avatar を操作する（RLS write は self/admin）。BEGIN/ROLLBACK で副作用を残さない。
BEGIN;
SELECT plan(3);

SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9'; -- admin

-- 決定性のため、対象ユーザー(admin 自身)の既存 avatar を消してから始める。
DELETE FROM public.attachments
WHERE entity_type = 'user_avatar'
  AND entity_id = (SELECT id FROM public.users WHERE gotrue_id = 'cb427b54-eaef-47df-916b-626321d23dc9');

-- 確定済み avatar(200) を 1 枚作成。
INSERT INTO public.attachments
  (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by, status)
SELECT 'user_avatar',
       (SELECT id FROM public.users WHERE gotrue_id = 'cb427b54-eaef-47df-916b-626321d23dc9'),
       'wanonwan', 'avatars/fixture/confirmed', 'a.png', 'image/png', app.uid(), 200;
SELECT ok(true, '確定済み avatar(200) を作成できる');

-- 同じユーザーに pending(100) を追加 → index は status=200 のみ対象なので共存できる。
SELECT lives_ok($$
  INSERT INTO public.attachments
    (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by, status)
  SELECT 'user_avatar',
         (SELECT id FROM public.users WHERE gotrue_id = 'cb427b54-eaef-47df-916b-626321d23dc9'),
         'wanonwan', 'avatars/fixture/pending', 'b.png', 'image/png', app.uid(), 100
$$, 'pending(100) は confirmed と共存できる');

-- 2 枚目の確定済み(200) → unique 違反(23505)。
SELECT throws_ok($$
  INSERT INTO public.attachments
    (entity_type, entity_id, bucket, object_key, filename, content_type, uploaded_by, status)
  SELECT 'user_avatar',
         (SELECT id FROM public.users WHERE gotrue_id = 'cb427b54-eaef-47df-916b-626321d23dc9'),
         'wanonwan', 'avatars/fixture/confirmed2', 'c.png', 'image/png', app.uid(), 200
$$, '23505', NULL, '確定済み(200) は 1 ユーザー 1 枚（2 枚目は unique 違反）');

SELECT * FROM finish();
ROLLBACK;
