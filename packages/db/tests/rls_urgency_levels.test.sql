-- 緊急度マスタ（urgency_levels）RLS の pgTAP（app_user 接続）。
-- 純粋な業務マスタ。admin は CRUD でき、非 admin は書けない、認証済みは読める、を検証する。
BEGIN;
SELECT plan(4);

-- admin（role='admin'）として実行
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';

-- テスト対象行を明示投入し seed 非依存にする（admin なので RLS write を通過）。
INSERT INTO public.urgency_levels (code, name)
VALUES (1, '低'), (3, '高') ON CONFLICT (code) DO NOTHING;

-- 1) admin は緊急度を作成できる
SELECT lives_ok(
  $$ INSERT INTO public.urgency_levels (code, name) VALUES (90, '緊急') $$,
  'admin は緊急度を作成できる'
);

-- 2) admin は既存の緊急度を更新できる（seed の code=3 '高'）
SELECT lives_ok(
  $$ UPDATE public.urgency_levels SET name = '高（改）' WHERE code = 3 $$,
  'admin は緊急度を更新できる'
);

-- 3) 非 admin（alice = role 'member'）は読める（認証済み select）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT isnt_empty(
  $$ SELECT 1 FROM public.urgency_levels WHERE code = 1 $$,
  '非 admin も緊急度を読める'
);

-- 4) 非 admin は作成できない（RLS 42501）
SELECT throws_ok(
  $$ INSERT INTO public.urgency_levels (code, name) VALUES (91, 'x') $$,
  '42501', NULL, '非 admin は緊急度を作成できない'
);

SELECT * FROM finish();
ROLLBACK;
