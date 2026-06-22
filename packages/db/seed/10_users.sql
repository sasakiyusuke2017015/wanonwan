-- サンプルユーザ seed（冪等）。RLS 検証用に gotrue_id を実テストユーザに紐付ける。
-- admin の gotrue_id は dev で作成した GoTrue ユーザ(admin@example.com)の id。
-- 別 GoTrue ユーザを作る場合は provisioning（Phase 2 管理画面）で gotrue_id を更新する。

INSERT INTO public.users (gotrue_id, code, name, email, position_id, division_id, department_id, section_id)
SELECT
  'cb427b54-eaef-47df-916b-626321d23dc9'::uuid, 'admin', '管理者', 'admin@example.com',
  (SELECT id FROM public.positions   WHERE code = 999),
  (SELECT id FROM public.divisions   WHERE code = 'HQ'),
  (SELECT id FROM public.departments WHERE code = 'DEPT1'),
  (SELECT id FROM public.sections    WHERE code = 'SEC1')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (gotrue_id, code, name, email, position_id, section_id)
SELECT
  '00000000-0000-0000-0000-0000000a11ce'::uuid, 'alice', 'アリス', 'alice@example.com',
  (SELECT id FROM public.positions WHERE code = 300),
  (SELECT id FROM public.sections  WHERE code = 'SEC1')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (gotrue_id, code, name, email, position_id, section_id)
SELECT
  '00000000-0000-0000-0000-0000000b0b00'::uuid, 'bob', 'ボブ', 'bob@example.com',
  (SELECT id FROM public.positions WHERE code = 300),
  (SELECT id FROM public.sections  WHERE code = 'SEC1')
ON CONFLICT (email) DO NOTHING;

-- carol: どの回答にも無関係（RLS 否定テスト用）
INSERT INTO public.users (gotrue_id, code, name, email, position_id, section_id)
SELECT
  '00000000-0000-0000-0000-0000000ca201'::uuid, 'carol', 'キャロル', 'carol@example.com',
  (SELECT id FROM public.positions WHERE code = 300),
  (SELECT id FROM public.sections  WHERE code = 'SEC1')
ON CONFLICT (email) DO NOTHING;
