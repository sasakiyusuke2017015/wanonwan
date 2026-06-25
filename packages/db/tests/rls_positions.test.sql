-- positions の admin 帯（990-999）昇格防止 RLS の pgTAP（app_user 接続）。
-- app.is_admin() の源が positions.code 990-999 のため、アプリ経由でこの帯を作成/変更/削除
-- できないことを検証する（admin であっても不可）。フィクスチャは seed のマスタに依存。
BEGIN;
SELECT plan(6);

-- admin として実行
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';

-- 1) admin: 通常役職（code < 990）は作成できる
SELECT lives_ok(
  $$ INSERT INTO public.positions (code, name) VALUES (410, '主任') $$,
  'admin は通常役職を作成できる'
);

-- 2) admin でも管理者帯（990-999）は作成できない（WITH CHECK 違反 = 42501）
SELECT throws_ok(
  $$ INSERT INTO public.positions (code, name) VALUES (995, '偽admin') $$,
  '42501', NULL, 'admin でも管理者帯(990-999)は作成できない'
);

-- 3) admin でも通常役職を管理者帯へ変更できない（WITH CHECK 違反）
SELECT throws_ok(
  $$ UPDATE public.positions SET code = 996 WHERE code = 300 $$,
  '42501', NULL, 'admin でも役職コードを管理者帯へ変更できない'
);

-- 4) 管理者役職（999）はアプリから削除できない（USING で不可視 → 0 行・行は残る）
DELETE FROM public.positions WHERE code = 999;
SELECT is(
  (SELECT count(*)::int FROM public.positions WHERE code = 999), 1,
  '管理者役職(999)はアプリから削除できない'
);

-- 5) 管理者役職（999）の変更もできない（USING で不可視 → name 不変）
UPDATE public.positions SET name = 'changed' WHERE code = 999;
SELECT is(
  (SELECT name FROM public.positions WHERE code = 999), '管理者',
  '管理者役職(999)はアプリから変更できない'
);

-- 6) 非 admin（alice）は役職を作成できない（is_admin false → 42501）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT throws_ok(
  $$ INSERT INTO public.positions (code, name) VALUES (420, 'x') $$,
  '42501', NULL, '非 admin は役職を作成できない'
);

SELECT * FROM finish();
ROLLBACK;
