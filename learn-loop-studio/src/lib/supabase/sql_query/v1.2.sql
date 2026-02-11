-- ============================================================
-- v1.2: クイズ取込 Batch API 対応
-- ============================================================
-- 実行前提: v1.1.sql が適用済みであること
-- 実行方法: Supabase SQL Editor で手動実行
-- ============================================================

-- 1. 未運用の quiz_generation_batches を DROP (v1.0.sql で作成されたが実コード参照なし)
DROP TABLE IF EXISTS public.quiz_generation_batches;

-- 2. クイズ生成バッチリクエスト管理テーブル
CREATE TABLE public.quiz_batch_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',   -- 'pending' | 'processing' | 'completed' | 'failed'
  source_name text NOT NULL,                -- ファイル名 (例: docker.md)
  source_content text NOT NULL,             -- Markdown 全文
  batch_id text,                            -- OpenAI Batch ID
  error_message text,                       -- 失敗時のエラー詳細
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.quiz_batch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own batch requests"
  ON public.quiz_batch_requests FOR ALL
  USING ( auth.uid() = user_id );

-- 4. Updated At Trigger
-- moddatetime extension は v1.0.sql で有効化済み
CREATE TRIGGER handle_updated_at_quiz_batch_requests
  BEFORE UPDATE ON public.quiz_batch_requests
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 5. Indexes
CREATE INDEX idx_quiz_batch_requests_user_id ON public.quiz_batch_requests(user_id);
CREATE INDEX idx_quiz_batch_requests_status ON public.quiz_batch_requests(status);
CREATE INDEX idx_quiz_batch_requests_batch_id ON public.quiz_batch_requests(batch_id);
