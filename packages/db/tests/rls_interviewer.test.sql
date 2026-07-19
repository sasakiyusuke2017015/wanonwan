-- 面談担当（answers.interviewer_id）と interviewer ロールの pgTAP（app_user 接続）。
-- interviewer ロールは capability ゲートであり、回答の可視性は per-answer の
-- interviewer_id 割り当てだけが決める（blanket 可視化しない）ことを検証する。
-- フィクスチャ: seed の alice の回答（サンプル面談アンケート）。carol は上位ロールなし・無関係。
-- carol への interviewer ロール付与と担当割り当てはこの tx 内で行い、ROLLBACK で戻す。
BEGIN;
SELECT plan(6);

-- fixture: carol へ interviewer ロールを付与（admin として）
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'interviewer' FROM public.users WHERE email = 'carol@example.com';

-- 1) interviewer ロール保有だけでは他人の回答は見えない（per-answer 判定の維持）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.answers), 0,
  'interviewer ロールだけでは回答は見えない（割り当てが必要）'
);

-- fixture: admin が alice の回答へ carol を担当に割り当てる
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
UPDATE public.answers a SET interviewer_id =
    (SELECT id FROM public.users WHERE email = 'carol@example.com')
  WHERE a.respondent_id = (SELECT id FROM public.users WHERE email = 'alice@example.com');
SELECT is(
  (SELECT count(*)::int FROM public.answers
   WHERE interviewer_id = (SELECT id FROM public.users WHERE email = 'carol@example.com')),
  1, 'admin は面談担当を割り当てられる'
);

-- 2) 割り当て済み interviewer は担当回答を読める
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.answers), 1,
  '割り当てられた担当は当該回答を読める'
);

-- 3) 割り当て済み interviewer は面談記録（UPDATE）ができる
UPDATE public.answers SET interview_memo = 'pgTAP 面談メモ' WHERE interviewer_id = app.uid();
SELECT is(
  (SELECT count(*)::int FROM public.answers WHERE interview_memo = 'pgTAP 面談メモ'),
  1, '割り当てられた担当は面談記録を更新できる'
);

-- fixture: carol の interviewer ロールを剥奪（admin として）
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
DELETE FROM public.user_roles ur USING public.users u
  WHERE ur.user_id = u.id AND u.email = 'carol@example.com' AND ur.role = 'interviewer';

-- 4) ロール剥奪後も担当割り当てが残る間は読める（残留仕様。Plan 判断ログ参照）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.answers), 1,
  'ロール剥奪後も interviewer_id が残る回答は読める（残留仕様）'
);

-- 5) 担当解除（interviewer_id = NULL）で見えなくなる
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
UPDATE public.answers SET interviewer_id = NULL
  WHERE interviewer_id = (SELECT id FROM public.users WHERE email = 'carol@example.com');
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is(
  (SELECT count(*)::int FROM public.answers), 0,
  '担当解除後は読めない'
);

SELECT * FROM finish();
ROLLBACK;
