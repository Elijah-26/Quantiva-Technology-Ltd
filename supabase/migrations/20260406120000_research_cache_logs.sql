-- Scholarly research: per-user query cache (24h) and API call logs

CREATE TABLE IF NOT EXISTS public.research_query_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  query_hash text NOT NULL,
  response_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, query_hash)
);

CREATE INDEX IF NOT EXISTS research_query_cache_expires_idx
  ON public.research_query_cache (expires_at);

ALTER TABLE public.research_query_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_query_cache_own"
  ON public.research_query_cache FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.research_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  query text NOT NULL DEFAULT '',
  source_api text NOT NULL CHECK (source_api IN (
    'openalex',
    'semantic_scholar',
    'firecrawl',
    'orchestrator'
  )),
  papers_returned int NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS research_logs_user_created_idx
  ON public.research_logs (user_id, created_at DESC);

ALTER TABLE public.research_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_logs_own"
  ON public.research_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
