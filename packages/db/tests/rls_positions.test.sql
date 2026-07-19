-- positions マスタ RLS の pgTAP（app_user 接続）。
-- 権限は user_roles が持つ別軸のため、positions は admin 帯(990-999)の特別扱いを持たない
-- 純粋な HR マスタ。admin は全役職を CRUD でき、非 admin は書けない、を検証する。
BEGIN;
SELECT plan(3);

-- admin ロール保有者として実行
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';

-- 1) admin は役職を作成できる（コード帯の制限なし）
SELECT lives_ok(
  $$ INSERT INTO public.positions (code, name) VALUES (410, '主任') $$,
  'admin は役職を作成できる'
);

-- 2) admin は既存役職を更新できる
SELECT lives_ok(
  $$ UPDATE public.positions SET name = '一般社員（改）' WHERE code = 300 $$,
  'admin は役職を更新できる'
);

-- 3) 非 admin（alice = 上位ロールなし）は役職を作成できない（RLS 42501）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT throws_ok(
  $$ INSERT INTO public.positions (code, name) VALUES (420, 'x') $$,
  '42501', NULL, '非 admin は役職を作成できない'
);

SELECT * FROM finish();
ROLLBACK;
