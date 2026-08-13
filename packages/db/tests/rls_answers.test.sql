-- RLS の pgTAP テスト。app_user 接続で実行する（test:db ランナーが -U app_user で流す）。
-- フィクスチャは seed（member1 回答 / interviewer1=viewer / member2=無関係）に依存する。
BEGIN;
SELECT plan(6);

-- member1: 自分の回答が見える
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
SELECT ok((SELECT count(*) FROM public.answers) >= 1, 'member1 は自分の回答を読める');

-- member2: 無関係 → 見えない
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000ca201';
SELECT is((SELECT count(*)::int FROM public.answers), 0, 'member2 は無関係の回答を読めない');

-- interviewer1: 閲覧者 → 見える
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000b0b00';
SELECT ok((SELECT count(*) FROM public.answers) >= 1, 'interviewer1 は閲覧者として読める');

-- admin: 全件見える
SET LOCAL app.user_id = 'cb427b54-eaef-47df-916b-626321d23dc9';
SELECT ok((SELECT count(*) FROM public.answers) >= 1, 'admin は全回答を読める');

-- 未設定: fail-closed
SET LOCAL app.user_id = '';
SELECT is((SELECT count(*)::int FROM public.answers), 0, '未設定では読めない (fail-closed)');

-- users 書込は admin 限定（member1 の UPDATE は RLS で 0 行 → interviewer1 の名前は不変）
SET LOCAL app.user_id = '00000000-0000-0000-0000-0000000a11ce';
UPDATE public.users SET name = 'HACKED' WHERE email = 'interviewer1@example.com';
SELECT isnt(
  (SELECT name FROM public.users WHERE email = 'interviewer1@example.com'),
  'HACKED',
  'member1(一般) は他ユーザーを更新できない（書込は admin 限定）'
);

SELECT * FROM finish();
ROLLBACK;
