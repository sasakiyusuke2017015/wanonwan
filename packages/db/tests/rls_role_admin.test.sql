-- 権限ロール（users.role）の pgTAP（app_user 接続）。
-- (1) app.is_admin() が users.role='admin' を源にすること、(2) 最後の admin を降格/削除する
-- 操作がトリガーで拒否されること、(3) 正常系（過剰拒否しないこと）を検証する。
-- フィクスチャ: seed の admin=role'admin'（1 名のみ）, alice/bob=role'member'。
BEGIN;
SELECT plan(7);

-- 前提アサート: admin は 1 名のみ（テスト 3/4 の「最後の admin」前提）
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT is((SELECT count(*)::int FROM public.users WHERE role = 'admin'), 1, '前提: admin は 1 名');

-- 1) role='member' は is_admin false
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT ok(NOT (SELECT app.is_admin()), 'role=member は is_admin() が false');

-- 2) 最後の admin を降格できない（トリガー P0001）
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT throws_ok(
  $$ UPDATE public.users SET role = 'member' WHERE email = 'admin@example.com' $$,
  'P0001', NULL, '最後の admin は降格できない'
);

-- 3) 最後の admin を削除できない（トリガー P0001）
SELECT throws_ok(
  $$ DELETE FROM public.users WHERE email = 'admin@example.com' $$,
  'P0001', NULL, '最後の admin は削除できない'
);

-- 4) 正常系: admin が自分の name を更新（admin→admin 遷移なし）は素通り
SELECT lives_ok(
  $$ UPDATE public.users SET name = '管理者（改）' WHERE email = 'admin@example.com' $$,
  'admin の非ロール更新は許可される（過剰拒否しない）'
);

-- 5) 正常系: admin が member を admin に昇格できる
SELECT lives_ok(
  $$ UPDATE public.users SET role = 'admin' WHERE email = 'alice@example.com' $$,
  'admin は member を admin に昇格できる'
);

-- 6) 正常系: admin が 2 名いれば 1 名を降格できる（alice 昇格済み → admin を降格）
SELECT lives_ok(
  $$ UPDATE public.users SET role = 'member' WHERE email = 'admin@example.com' $$,
  'admin が 2 名以上なら 1 名を降格できる'
);

SELECT * FROM finish();
ROLLBACK;
