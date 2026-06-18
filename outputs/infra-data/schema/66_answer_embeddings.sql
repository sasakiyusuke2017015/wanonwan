-- AI メンター提案（RAG）用の面談ベクトル。自前ホスト埋め込み（e5-small=384次元）を保存する。
-- lazy 生成（必要時にアプリが UPDATE）。RLS は answers のポリシーをそのまま継承する
-- （列追加のみ・行可視性は既存の answers_select/insert/update/delete が決める）。
-- 次元はモデル依存（EMBEDDINGS_DIM と一致させる）。モデル変更時は列を作り直す。
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 近傍検索用 index（コサイン距離）。hnsw は pgvector 0.5+。
CREATE INDEX IF NOT EXISTS answers_embedding_idx
  ON public.answers USING hnsw (embedding vector_cosine_ops);
