-- 権限ロール（users.role）の pgTAP（app_user 接続）。
-- (1) app.is_admin() が users.role='admin' を源にすること、(2) 最後の admin を降格/削除する
-- 操作がトリガーで拒否されること（全員ロックアウト防止）を検証する。
-- フィクスチャ: seed の admin=role'admin'（1 名のみ）, alice=role'member'。
BEGIN;
SELECT plan(4);

-- 1) role='admin' は is_admin true
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT ok((SELECT app.is_admin()), 'role=admin は is_admin() が true');

-- 2) role='member' は is_admin false
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT ok(NOT (SELECT app.is_admin()), 'role=member は is_admin() が false');

-- 3) 最後の admin を降格できない（トリガー P0001）。dev seed の admin は 1 名のみ。
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT throws_ok(
  $$ UPDATE public.users SET role = 'member' WHERE email = 'admin@example.com' $$,
  'P0001', NULL, '最後の admin は降格できない（ロックアウト防止）'
);

-- 4) 最後の admin を削除できない（トリガー P0001）
SELECT throws_ok(
  $$ DELETE FROM public.users WHERE email = 'admin@example.com' $$,
  'P0001', NULL, '最後の admin は削除できない（ロックアウト防止）'
);

SELECT * FROM finish();
ROLLBACK;
