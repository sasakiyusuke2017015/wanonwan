-- 添付ファイルのメタデータ。本体は MinIO（presigned URL 経由でブラウザ直 up/down）。
-- entity_type/entity_id で対象へ polymorphic に紐づく:
--   answer       … アンケート回答の添付（entity_id = answers.id）
--   interview    … 面談記録の添付（entity_id = answers.id。面談データは answers 上）
--   user_avatar  … ユーザーのアバター（entity_id = users.id、1 ユーザー 1 枚）
--   survey       … アンケートの説明資料（entity_id = surveys.id）
-- 可視性は entity_type ごとに親の RLS へ委譲する（99_rls.sql）。
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

-- アバターは 1 ユーザー 1 枚。新規アップロード前に既存を削除する運用（UI）を DB でも担保。
CREATE UNIQUE INDEX IF NOT EXISTS attachments_one_avatar_per_user
  ON public.attachments (entity_id) WHERE entity_type = 'user_avatar';
