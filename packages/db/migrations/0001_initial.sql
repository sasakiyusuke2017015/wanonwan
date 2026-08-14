-- 0001_initial — 初期スキーマ（app 層 DDL 一式）。
-- app テーブル・RLS・関数を 1 本に統合している。ロール/スキーマ/拡張(vector/pgtap/pgmq)は
-- 00_bootstrap.sql（initdb.d）が先に作る前提。ここは app テーブル・RLS・関数のみ。
-- 変更は本ファイルではなく後続 migration（0002_ 以降）で足す。

-- ===== 拡張: pg_cron =====
-- pg_cron は shared_preload_libraries に登録済み（Dockerfile.db）。
-- サーバ完全起動後でないと有効化できないため、initdb.d ではなく db:migrate で作成する。
-- cron.database_name = wanonwan（Dockerfile.db）。
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ===== 組織マスタ（本部 / 部 / 課 / 役職） =====
-- 組織マスタ（本部 / 部 / 課 / 役職）。Pleasanter 区分マスタ(Wikis)由来。
-- 純粋な HR マスタ。権限ロールとは別軸で、認可は user_roles が源（本ファイルの「ユーザー / 権限ロール」節）。

CREATE TABLE IF NOT EXISTS public.divisions (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text   UNIQUE NOT NULL,
  name text   NOT NULL
);

CREATE TABLE IF NOT EXISTS public.departments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        text   UNIQUE NOT NULL,
  name        text   NOT NULL,
  division_id bigint REFERENCES public.divisions(id)
);

CREATE TABLE IF NOT EXISTS public.sections (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          text   UNIQUE NOT NULL,
  name          text   NOT NULL,
  department_id bigint REFERENCES public.departments(id)
);

CREATE TABLE IF NOT EXISTS public.positions (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code int    UNIQUE NOT NULL,   -- HR 上の序列コード（権限ロールとは無関係）
  name text   NOT NULL
);

-- ===== ユーザー / 権限ロール =====
-- ユーザー（Pleasanter ユーザーマスタ 27924 由来）。
-- 認証は GoTrue。業務ユーザーと GoTrue identity を gotrue_id で紐付ける（provisioning は管理画面で）。
-- パスワード/ロック/失敗回数は GoTrue 側が持つため列に持たない。

CREATE TABLE IF NOT EXISTS public.users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  gotrue_id     uuid   UNIQUE,              -- GoTrue user id（未 provisioning は NULL）
  code          text   UNIQUE NOT NULL,     -- ユーザーコード
  name          text   NOT NULL,
  email         text   UNIQUE NOT NULL,
  position_id   bigint REFERENCES public.positions(id),
  division_id   bigint REFERENCES public.divisions(id),
  department_id bigint REFERENCES public.departments(id),
  section_id    bigint REFERENCES public.sections(id),
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 認可ロール。役職(position)とは別軸: 役職は HR の肩書き、role はシステム権限。
-- member は全ユーザーが暗黙保有（行なし = member のみ）。上位ロールだけを行として持つため、
-- 「ロール 0 個のユーザー」という不正状態が構造的に存在しない。
-- 認可はこの保有集合(union)で判定する。UI のアクティブロール切替は表示状態であり認可には使わない。
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role    text   NOT NULL CHECK (role IN ('admin', 'interviewer')),
  PRIMARY KEY (user_id, role)
);

-- 既存環境向け: 旧 users.role 単一列から user_roles へ移行して列を落とす。
-- schema は再適用されるため、列が残っている環境でのみ実行（冪等）。
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
      SELECT id, 'admin' FROM public.users WHERE role = 'admin'
      ON CONFLICT DO NOTHING;
    ALTER TABLE public.users DROP COLUMN role;
  END IF;
END $$;

-- 追加面談候補（多値 ClassH を正規化）
CREATE TABLE IF NOT EXISTS public.user_interview_candidates (
  user_id           bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_user_id bigint NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, candidate_user_id)
);

-- ===== 緊急度マスタ =====
-- 緊急度マスタ（urgency_levels）。高 / 中 / 低 などの段階を表す業務マスタ。
-- surveys / answers から urgency_id で参照される（参照側の列追加は 40_surveys / 60_answers 内）。
-- 役職と無関係な純粋業務マスタ。RLS は「RLS ポリシー」節のマスタ系（認証済み select / admin write）。
-- FK 順のため surveys(40) / answers(60) より前の番号で作成する。

CREATE TABLE IF NOT EXISTS public.urgency_levels (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code int    UNIQUE NOT NULL,   -- 並び順兼一意キー（例 1=低 / 2=中 / 3=高）
  name text   NOT NULL
);

-- ===== アンケート / 設問 =====
-- アンケート（27917）/ 質問（27916）/ 使用質問 M:N（ClassA）/ 配信対象（ClassB/E/H/I）。
-- AI プロンプト列は保持のみ（使用は Phase 2 機能。MVP は Coming Soon）。

CREATE TABLE IF NOT EXISTS public.surveys (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             text   NOT NULL,
  status            text   NOT NULL DEFAULT 'draft',  -- 利用状況
  capacity          int,                              -- 定員
  requires_auth     boolean NOT NULL DEFAULT true,
  uses_ai           boolean NOT NULL DEFAULT false,
  base_prompt       text,
  instruction_set   text,
  grounding_context text,
  user_prompt       text,
  supporter_prompt  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 緊急度（urgency_levels）への参照。nullable。既存 DB へは冪等 ALTER で追加。
ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);

CREATE TABLE IF NOT EXISTS public.questions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  body            text   NOT NULL,                       -- 質問内容
  answer_type     text   NOT NULL,                       -- ラジオ/セレクト/チェック/テキスト/テキストエリア/電話/郵便
  choices         jsonb  NOT NULL DEFAULT '[]'::jsonb,    -- 選択肢
  sort_order      int    NOT NULL DEFAULT 0,
  required        boolean NOT NULL DEFAULT false,
  has_extra_field boolean NOT NULL DEFAULT false,
  eval_item       text,                                  -- 評価項目（満足度/業務負荷/職場環境/人間関係/ストレス）
  weight          numeric,
  tags            text[],
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
  survey_id   bigint NOT NULL REFERENCES public.surveys(id)   ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order  int    NOT NULL DEFAULT 0,
  PRIMARY KEY (survey_id, question_id)
);

-- 配信対象（役職/本部/部/課 の区分指定）
CREATE TABLE IF NOT EXISTS public.survey_targets (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id   bigint NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  target_type text   NOT NULL CHECK (target_type IN ('position','division','department','section')),
  target_code text   NOT NULL
);

-- ===== アンケート掲載 =====
-- 掲載設定（27918, Issues）。アンケートの公開・期間・状況。
-- status: 100 未掲載 / 150 予約 / 160 処理中 / 200 実施中 / 900 完了 / 910 保留 / 990 エラー
-- 回答受付は status=200（実施中）のときのみ（業務ルールは API 層で担保）。

CREATE TABLE IF NOT EXISTS public.survey_publications (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  survey_id  bigint NOT NULL REFERENCES public.surveys(id),
  title      text,
  body       text,
  status     int    NOT NULL DEFAULT 100,
  start_at   timestamptz,
  end_at     timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_survey ON public.survey_publications(survey_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON public.survey_publications(status);

-- ===== 回答 / 面談記録 =====
-- 回答結果（27919）。1on1 の中核（機微情報: 健康状態・評価・面談メモ）。
-- status: 100 未回答 / 200 回答済 / 400 面談調整済 / 900 完了
-- 多値（面談候補 ClassG / 面談内容閲覧者 ClassH）は中間テーブルへ正規化。閲覧者は RLS の可視範囲に直結。

CREATE TABLE IF NOT EXISTS public.answers (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  publication_id   bigint NOT NULL REFERENCES public.survey_publications(id),
  respondent_id    bigint NOT NULL REFERENCES public.users(id),
  status           int    NOT NULL DEFAULT 100,
  answer_json      jsonb  NOT NULL DEFAULT '{}'::jsonb,   -- 設問回答
  evaluation       jsonb,                                 -- 満足度/業務負荷/職場環境/人間関係/ストレス
  health_status    int,                                   -- 100-999
  interview_method int    CHECK (interview_method IN (1,2,3)),  -- 1 対面 / 2 Web / 3 電話
  interviewer_id   bigint REFERENCES public.users(id),
  answered_at      timestamptz,
  interview_at     timestamptz,
  interview_memo   text,
  next_action      text,
  -- AI 生成（保持のみ・Phase 2）
  supporter_prompt text,
  supporter_answer text,
  user_prompt      text,
  user_answer      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 緊急度（urgency_levels）への参照。nullable。面談記録時に面談者 / admin が設定。
ALTER TABLE public.answers
  ADD COLUMN IF NOT EXISTS urgency_id bigint REFERENCES public.urgency_levels(id);

CREATE INDEX IF NOT EXISTS idx_answers_publication ON public.answers(publication_id);
CREATE INDEX IF NOT EXISTS idx_answers_respondent  ON public.answers(respondent_id);
CREATE INDEX IF NOT EXISTS idx_answers_interviewer ON public.answers(interviewer_id);

-- 面談候補（多値）
CREATE TABLE IF NOT EXISTS public.answer_interview_candidates (
  answer_id bigint NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  PRIMARY KEY (answer_id, user_id)
);

-- 面談内容閲覧者（多値）。RLS の閲覧許可に使う。
CREATE TABLE IF NOT EXISTS public.answer_viewers (
  answer_id bigint NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id   bigint NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  PRIMARY KEY (answer_id, user_id)
);

-- ===== 添付ファイル =====
-- 添付ファイルのメタデータ。本体は MinIO（presigned URL 経由でブラウザ直 up/down）。
-- entity_type/entity_id で対象へ polymorphic に紐づく:
--   answer       … アンケート回答の添付（entity_id = answers.id）
--   interview    … 面談記録の添付（entity_id = answers.id。面談データは answers 上）
--   user_avatar  … ユーザーのアバター（entity_id = users.id、1 ユーザー 1 枚）
--   survey       … アンケートの説明資料（entity_id = surveys.id）
-- 可視性は entity_type ごとに親の RLS へ委譲する（「RLS ポリシー」節）。
CREATE TABLE IF NOT EXISTS public.attachments (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type  text   NOT NULL CHECK (entity_type IN ('answer', 'interview', 'user_avatar', 'survey')),
  entity_id    bigint NOT NULL,
  bucket       text   NOT NULL,
  object_key   text   NOT NULL UNIQUE,
  filename     text   NOT NULL,
  content_type text   NOT NULL,
  size_bytes   bigint,                       -- 確定（complete）後に実測値を入れる
  status       int    NOT NULL DEFAULT 100,  -- 100 仮(presigned 発行済) / 200 確定(upload 完了)
  uploaded_by  bigint NOT NULL REFERENCES public.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attachments_entity_idx ON public.attachments (entity_type, entity_id);

-- アバターは「確定済み(status=200)」が 1 ユーザー 1 枚。pending(100) は複数あってよい
-- （新 upload を作っても、complete 成功時に旧 confirmed を置き換えるまで旧 avatar を残すため）。
-- 定義変更を既存 DB にも反映するため DROP+CREATE（CREATE IF NOT EXISTS は既存 index を更新しない）。
DROP INDEX IF EXISTS public.attachments_one_avatar_per_user;
CREATE UNIQUE INDEX attachments_one_avatar_per_user
  ON public.attachments (entity_id) WHERE entity_type = 'user_avatar' AND status = 200;

-- ===== 回答ベクトル（pgvector） =====
-- AI メンター提案（RAG）用の面談ベクトル。自前ホスト埋め込み（e5-small=384次元）を保存する。
-- lazy 生成（必要時にアプリが UPDATE）。RLS は answers のポリシーをそのまま継承する
-- （列追加のみ・行可視性は既存の answers_select/insert/update/delete が決める）。
-- 次元はモデル依存（EMBEDDINGS_DIM と一致させる）。モデル変更時は列を作り直す。
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 近傍検索用 index（コサイン距離）。hnsw は pgvector 0.5+。
CREATE INDEX IF NOT EXISTS answers_embedding_idx
  ON public.answers USING hnsw (embedding vector_cosine_ops);

-- ===== スケジュール =====
-- スケジュール（27929, Issues）。面談日時・イベント。
CREATE TABLE IF NOT EXISTS public.schedules (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      text,
  body       text,
  start_at   timestamptz,
  end_at     timestamptz,
  all_day    boolean NOT NULL DEFAULT false,
  color      text,
  icon       text,
  event_type text,
  created_by bigint REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedules_start ON public.schedules(start_at);

-- ===== 定期ジョブ（pg_cron） =====
-- 非同期/定期ジョブ。pg_cron（本ファイル冒頭で作成）で SQL を定期実行する土台。
-- 最初の実ジョブ: 添付の孤児掃除（presigned 発行のみで upload 未完了= status 100 の古い行を削除）。
-- 外部(MinIO 本体)には触れない純 SQL。MinIO オブジェクト本体の掃除は後続(pgmq + app worker)。
-- 詳細・段階分け: outputs/plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md

-- 孤児判定（純関数・副作用なし）。status=100(仮) のまま older_than を超えた添付を孤児とみなす。
-- now() を使うため STABLE。app_user にも安全に公開（テスト/参照用）。
CREATE OR REPLACE FUNCTION app.is_stale_attachment(
  status int,
  created_at timestamptz,
  older_than interval DEFAULT interval '1 day'
) RETURNS boolean
LANGUAGE sql
STABLE
AS $$ SELECT status = 100 AND created_at < now() - older_than $$;

GRANT EXECUTE ON FUNCTION app.is_stale_attachment(int, timestamptz, interval) TO app_user;

-- 孤児を削除し件数を返す。SECURITY DEFINER(owner=postgres) で RLS を跨ぐ全件掃除。
-- pg_cron(=postgres) のみが呼ぶ前提。search_path='' + 全識別子修飾でハイジャック対策。
CREATE OR REPLACE FUNCTION app.gc_stale_attachments(older_than interval DEFAULT interval '1 day')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted integer;
BEGIN
  DELETE FROM public.attachments
  WHERE app.is_stale_attachment(status, created_at, older_than);
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- app からは呼ばせない（pg_cron=postgres のみ）。
REVOKE ALL ON FUNCTION app.gc_stale_attachments(interval) FROM PUBLIC;

-- pg_cron 登録。同名 jobname なので migrate 再実行で冪等更新（重複登録されない）。30 分毎。
SELECT cron.schedule('gc-stale-attachments', '*/30 * * * *', $$ SELECT app.gc_stale_attachments() $$);

-- ===== 添付 GC キュー（pgmq） =====
-- 添付 GC の非同期キュー（pgmq）。attachments の行が削除されたら MinIO の本体も消す必要があるが、
-- pg_cron/SQL は外部(MinIO)に届かない。そこで「削除時に bucket/object_key をキューへ積む」→
-- 専用 Node worker(apps/worker) がドレインして DeleteObject、という形にする。
-- 行削除すべて（Phase 1 GC・ユーザー削除・avatar 置換）をトリガで一律に捕捉する。
-- 詳細: outputs/plans/2026-06-18-2030-async-jobs-pgmq-pgcron.md（Phase 2）

-- キューを冪等作成（migrate 再実行で重複させない）。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pgmq.list_queues() WHERE queue_name = 'attachment_gc') THEN
    PERFORM pgmq.create('attachment_gc');
  END IF;
END $$;

-- 削除された添付の object_key をキューへ積む（SECURITY DEFINER=postgres で pgmq へ書く）。
-- app_user の削除でも postgres 権限で enqueue される。search_path='' + 全識別子修飾。
CREATE OR REPLACE FUNCTION app.enqueue_attachment_gc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM pgmq.send(
    'attachment_gc',
    jsonb_build_object('bucket', OLD.bucket, 'object_key', OLD.object_key)
  );
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION app.enqueue_attachment_gc() FROM PUBLIC;

DROP TRIGGER IF EXISTS attachments_gc_enqueue ON public.attachments;
CREATE TRIGGER attachments_gc_enqueue
  AFTER DELETE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION app.enqueue_attachment_gc();

-- ===== RLS ヘルパ関数 =====
-- RLS ヘルパ。current_user_id()(gotrue uuid) から業務ユーザーへ解決する。
-- users/positions を読むため SECURITY DEFINER で RLS をバイパス（search_path 固定で hijack 防止）。

-- 現在の業務ユーザー id（gotrue_id → users.id）
CREATE OR REPLACE FUNCTION app.uid() RETURNS bigint
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT u.id FROM public.users u WHERE u.gotrue_id = app.current_user_id() $$;

-- 管理者判定（認可ロール）。権限は役職(position)と別軸で user_roles が源（「ユーザー / 権限ロール」節）。
-- 認可は保有ロールの集合(union)で判定する。UI のアクティブロール切替は表示状態であり、ここでは見ない。
CREATE OR REPLACE FUNCTION app.is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = 'admin'
    )
  $$;

-- 上位ロール保有判定（API 層の capability ゲート用。例: has_role('interviewer')）。
-- member は暗黙保有（user_roles に行を持たない）ため、引数は上位ロールのみ意味を持つ。
CREATE OR REPLACE FUNCTION app.has_role(p_role text) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$
    SELECT EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles ur ON ur.user_id = u.id
      WHERE u.gotrue_id = app.current_user_id()
        AND ur.role = p_role
    )
  $$;

-- answers ⇄ answer_viewers/candidates の相互参照で RLS が無限再帰しないよう、
-- 横参照は SECURITY DEFINER 関数（RLS バイパス）で判定する。
CREATE OR REPLACE FUNCTION app.is_answer_viewer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answer_viewers v WHERE v.answer_id = p_answer_id AND v.user_id = app.uid()
  ) $$;

CREATE OR REPLACE FUNCTION app.owns_or_interviews_answer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a
    WHERE a.id = p_answer_id AND (a.respondent_id = app.uid() OR a.interviewer_id = app.uid())
  ) $$;

CREATE OR REPLACE FUNCTION app.interviews_answer(p_answer_id bigint) RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app
  AS $$ SELECT EXISTS (
    SELECT 1 FROM public.answers a WHERE a.id = p_answer_id AND a.interviewer_id = app.uid()
  ) $$;

GRANT EXECUTE ON FUNCTION app.uid() TO app_user;
GRANT EXECUTE ON FUNCTION app.is_admin() TO app_user;
GRANT EXECUTE ON FUNCTION app.has_role(text) TO app_user;
GRANT EXECUTE ON FUNCTION app.is_answer_viewer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.owns_or_interviews_answer(bigint) TO app_user;
GRANT EXECUTE ON FUNCTION app.interviews_answer(bigint) TO app_user;

-- ===== RLS ポリシー =====
-- =====================================================================
-- RLS（最終ガード）。主認可は API 層、ここは「本人 / admin / 明示 viewer」の最小ガード。
-- 組織階層（課長=同課 等）の絞り込みは API 層が担う（計画レビュー §3.3 確定）。
-- postgres(superuser) は BYPASSRLS、app_user のみ RLS 対象。
-- 冪等化のため各ポリシーは DROP IF EXISTS → CREATE。
-- =====================================================================

-- app_user へ DML 付与（行の可視性は RLS が決める）
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- RLS 有効化
ALTER TABLE public.divisions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgency_levels             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interview_candidates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_targets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_publications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_interview_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_viewers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules                  ENABLE ROW LEVEL SECURITY;

-- 認証済み判定の短縮
-- （関数化せず式で書く: app.current_user_id() IS NOT NULL）

-- ---- マスタ系: 認証済みは読める / 書きは admin のみ -------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'divisions','departments','sections','positions','urgency_levels',
    'surveys','questions','survey_questions','survey_targets','survey_publications'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write  ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT USING (app.current_user_id() IS NOT NULL)', t, t);
    EXECUTE format(
      'CREATE POLICY %I_write ON public.%I FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin())', t, t);
  END LOOP;
END $$;

-- positions は権限と無関係な純粋 HR マスタ（admin 判定は user_roles が源）。
-- write は上のループ既定（admin のみ）で十分。code 帯による特別扱いはしない。

-- ---- users: 認証済みは読める（ディレクトリ。階層絞りは API）/ 書きは admin ----
DROP POLICY IF EXISTS users_select ON public.users;
DROP POLICY IF EXISTS users_write  ON public.users;
CREATE POLICY users_select ON public.users FOR SELECT USING (app.current_user_id() IS NOT NULL);
CREATE POLICY users_write  ON public.users FOR ALL USING (app.is_admin()) WITH CHECK (app.is_admin());

-- ---- user_roles: 保有ロール（認可の源）。SELECT = 自分の行 + admin 全件 / 書きは admin ----
-- 「誰が admin/interviewer か」の名簿を全認証ユーザーへ晒さない（切替メニューは自分の roles で足りる）。
DROP POLICY IF EXISTS user_roles_select ON public.user_roles;
DROP POLICY IF EXISTS user_roles_write  ON public.user_roles;
CREATE POLICY user_roles_select ON public.user_roles FOR SELECT
  USING (app.is_admin() OR user_id = app.uid());
CREATE POLICY user_roles_write ON public.user_roles FOR ALL
  USING (app.is_admin()) WITH CHECK (app.is_admin());

-- admin ロール行を 0 にする UPDATE/DELETE を拒否（全員ロックアウト防止）。
-- RLS の WITH CHECK では他行をカウントできないためトリガーで担保する。
-- SECURITY DEFINER 関数 + search_path 固定で RLS をバイパスして全 admin 行数を数える。
-- BEFORE UPDATE も張る: PK 列でも UPDATE は可能なため、DELETE のみだと
-- `UPDATE user_roles SET role='interviewer'` による降格がすり抜ける。
-- users 行 DELETE の CASCADE でも行トリガは発火する（最後の admin ユーザー削除も拒否される）。
CREATE OR REPLACE FUNCTION app.prevent_last_admin_removal() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app
  AS $$
  BEGIN
    -- この操作で admin 行が失われるときだけ検査（interviewer 行の操作は素通り）。
    IF OLD.role = 'admin' AND (TG_OP = 'DELETE' OR NEW.role <> 'admin') THEN
      IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin' AND user_id <> OLD.user_id) = 0 THEN
        RAISE EXCEPTION '最後の管理者は降格・削除できません（最低 1 名の admin が必要）';
      END IF;
    END IF;
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END;
  $$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON public.users;
DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON public.user_roles;
CREATE TRIGGER trg_prevent_last_admin_removal
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION app.prevent_last_admin_removal();

-- ---- user_interview_candidates: 本人 or admin --------------------------
DROP POLICY IF EXISTS uic_select ON public.user_interview_candidates;
DROP POLICY IF EXISTS uic_write  ON public.user_interview_candidates;
CREATE POLICY uic_select ON public.user_interview_candidates FOR SELECT
  USING (app.is_admin() OR user_id = app.uid());
CREATE POLICY uic_write ON public.user_interview_candidates FOR ALL
  USING (app.is_admin()) WITH CHECK (app.is_admin());

-- ---- answers: 本人 / 面談者 / viewer / admin ---------------------------
DROP POLICY IF EXISTS answers_select ON public.answers;
DROP POLICY IF EXISTS answers_insert ON public.answers;
DROP POLICY IF EXISTS answers_update ON public.answers;
DROP POLICY IF EXISTS answers_delete ON public.answers;
CREATE POLICY answers_select ON public.answers FOR SELECT USING (
  app.is_admin()
  OR respondent_id  = app.uid()
  OR interviewer_id = app.uid()
  OR app.is_answer_viewer(answers.id)   -- SECURITY DEFINER で再帰回避
);
CREATE POLICY answers_insert ON public.answers FOR INSERT WITH CHECK (
  app.is_admin() OR respondent_id = app.uid()
);
CREATE POLICY answers_update ON public.answers FOR UPDATE USING (
  app.is_admin() OR respondent_id = app.uid() OR interviewer_id = app.uid()
) WITH CHECK (
  app.is_admin() OR respondent_id = app.uid() OR interviewer_id = app.uid()
);
CREATE POLICY answers_delete ON public.answers FOR DELETE USING (app.is_admin());

-- ---- answer_viewers / answer_interview_candidates: 当該 answer に紐づく ----
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['answer_viewers','answer_interview_candidates']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_write  ON public.%I', t, t);
    EXECUTE format($f$
      CREATE POLICY %I_select ON public.%I FOR SELECT USING (
        app.is_admin() OR app.owns_or_interviews_answer(%I.answer_id)
      )$f$, t, t, t);
    EXECUTE format($f$
      CREATE POLICY %I_write ON public.%I FOR ALL USING (
        app.is_admin() OR app.interviews_answer(%I.answer_id)
      ) WITH CHECK (
        app.is_admin() OR app.interviews_answer(%I.answer_id)
      )$f$, t, t, t, t);
  END LOOP;
END $$;

-- ---- attachments: entity_type 別に親の可視性へ委譲 --------------------------
-- interview/answer: 面談記録・回答(answers.id)。閲覧=本人/面談者/閲覧者/admin。
--   書込 interview=面談者 or admin、answer=本人/面談者 or admin。
-- survey: アンケート資料。閲覧=認証済み、書込=admin。
-- user_avatar: アバター(users.id)。閲覧=認証済み（ディレクトリ表示）、書込=本人 or admin。
DROP POLICY IF EXISTS attachments_select ON public.attachments;
DROP POLICY IF EXISTS attachments_write  ON public.attachments;
CREATE POLICY attachments_select ON public.attachments FOR SELECT USING (
  app.is_admin()
  OR (entity_type IN ('interview', 'answer') AND (
        app.owns_or_interviews_answer(entity_id) OR app.is_answer_viewer(entity_id)
      ))
  OR (entity_type IN ('survey', 'user_avatar') AND app.current_user_id() IS NOT NULL)
);
CREATE POLICY attachments_write ON public.attachments FOR ALL USING (
  app.is_admin()
  OR (entity_type = 'interview'   AND app.interviews_answer(entity_id))
  OR (entity_type = 'answer'      AND app.owns_or_interviews_answer(entity_id))
  OR (entity_type = 'user_avatar' AND entity_id = app.uid())
) WITH CHECK (
  uploaded_by = app.uid()
  AND (
    app.is_admin()
    OR (entity_type = 'interview'   AND app.interviews_answer(entity_id))
    OR (entity_type = 'answer'      AND app.owns_or_interviews_answer(entity_id))
    OR (entity_type = 'user_avatar' AND entity_id = app.uid())
  )
);

-- ---- schedules: 認証済みは読める / 書きは作成者 or admin ----------------
DROP POLICY IF EXISTS schedules_select ON public.schedules;
DROP POLICY IF EXISTS schedules_write  ON public.schedules;
CREATE POLICY schedules_select ON public.schedules FOR SELECT USING (app.current_user_id() IS NOT NULL);
CREATE POLICY schedules_write  ON public.schedules FOR ALL
  USING (app.is_admin() OR created_by = app.uid())
  WITH CHECK (app.is_admin() OR created_by = app.uid());

