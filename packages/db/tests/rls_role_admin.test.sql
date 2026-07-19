-- 権限ロール（user_roles）の pgTAP（app_user 接続）。
-- (1) app.is_admin() / app.has_role() が user_roles を源にすること、(2) 最後の admin 行を
-- 失わせる UPDATE/DELETE（users DELETE の CASCADE 含む）がトリガーで拒否されること、
-- (3) 正常系（唯一 admin の他ロール編集など）を過剰拒否しないこと、
-- (4) user_roles の RLS（自己昇格不可 / SELECT は自分の行のみ）を検証する。
-- フィクスチャ: seed の admin=admin;interviewer, bob=interviewer, alice/carol=上位ロールなし(member)。
BEGIN;
SELECT plan(14);

-- fixture: bob=interviewer / admin=admin+interviewer を tx 内で保証する
-- （fresh seed では冪等、旧 users.role から移行した DB では不足行を補う）。ROLLBACK で戻る。
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'interviewer' FROM public.users WHERE email IN ('admin@example.com', 'bob@example.com')
  ON CONFLICT DO NOTHING;

-- 前提アサート: admin ロール行は 1 行のみ（「最後の admin」前提）
SELECT is(
  (SELECT count(*)::int FROM public.user_roles WHERE role = 'admin'), 1,
  '前提: admin ロール保有者は 1 名'
);

-- 1) 上位ロールなし（member のみ）は is_admin false
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT ok(NOT (SELECT app.is_admin()), '上位ロールなし(member) は is_admin() が false');

-- 2) interviewer 保有は has_role true / is_admin false
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT ok(
  (SELECT app.has_role('interviewer')) AND NOT (SELECT app.is_admin()),
  'interviewer 保有は has_role(interviewer)=true / is_admin=false'
);

-- 3) 複合保有（admin+interviewer）でも is_admin true
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT ok((SELECT app.is_admin()), '複合保有(admin+interviewer)でも is_admin() が true');

-- 4) CHECK: member は user_roles に格納できない（暗黙保有のため行を持たない）
SELECT throws_ok(
  $$ INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'member' FROM public.users WHERE email = 'alice@example.com' $$,
  '23514', NULL, 'user_roles に member は格納できない（CHECK）'
);

-- 5) RLS: 非 admin は自分に admin 行を INSERT できない（自己昇格不可）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT throws_ok(
  $$ INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'admin' FROM public.users WHERE email = 'alice@example.com' $$,
  '42501', NULL, '非 admin は user_roles へ INSERT できない（自己昇格不可）'
);

-- 6) RLS: 非 admin の SELECT は自分の行のみ（admin/interviewer の名簿を晒さない）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT is(
  (SELECT count(*)::int FROM public.user_roles), 1,
  '非 admin は自分の user_roles 行だけ見える'
);

-- 7) 最後の admin 行を DELETE できない（トリガー P0001）
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT throws_ok(
  $$ DELETE FROM public.user_roles ur USING public.users u
     WHERE ur.user_id = u.id AND u.email = 'admin@example.com' AND ur.role = 'admin' $$,
  'P0001', NULL, '最後の admin ロール行は削除できない'
);

-- 8) UPDATE による降格もすり抜けない（PK 列でも UPDATE は可能なため明示ガード）
SELECT throws_ok(
  $$ UPDATE public.user_roles ur SET role = 'interviewer'
     FROM public.users u
     WHERE ur.user_id = u.id AND u.email = 'admin@example.com' AND ur.role = 'admin' $$,
  'P0001', NULL, '最後の admin は UPDATE 経由でも降格できない'
);

-- 9) users 行の DELETE（CASCADE）経由でも最後の admin を失えない
SELECT throws_ok(
  $$ DELETE FROM public.users WHERE email = 'admin@example.com' $$,
  'P0001', NULL, '最後の admin ユーザーは削除できない（CASCADE でもトリガーが発火）'
);

-- 10) 正常系: 唯一の admin が admin を維持したまま interviewer 行を外せる（差分適用が誤爆しない）
SELECT lives_ok(
  $$ DELETE FROM public.user_roles ur USING public.users u
     WHERE ur.user_id = u.id AND u.email = 'admin@example.com' AND ur.role = 'interviewer' $$,
  '唯一の admin でも interviewer 行の付け外しは許可される（過剰拒否しない）'
);

-- 11) 正常系: interviewer 行を付け直せる
SELECT lives_ok(
  $$ INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'interviewer' FROM public.users WHERE email = 'admin@example.com' $$,
  'admin は interviewer 行を付与できる'
);

-- 12) 正常系: admin が別ユーザーへ admin 行を付与できる
SELECT lives_ok(
  $$ INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'admin' FROM public.users WHERE email = 'alice@example.com' $$,
  'admin は他ユーザーを admin に昇格できる'
);

-- 13) 正常系: admin が 2 名いれば 1 名の admin 行を削除できる
SELECT lives_ok(
  $$ DELETE FROM public.user_roles ur USING public.users u
     WHERE ur.user_id = u.id AND u.email = 'admin@example.com' AND ur.role = 'admin' $$,
  'admin が 2 名以上なら 1 名を降格できる'
);

SELECT * FROM finish();
ROLLBACK;
