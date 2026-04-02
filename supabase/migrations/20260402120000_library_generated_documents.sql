-- Generated library rows: curated vs scheduled vs on_demand; full body storage

ALTER TABLE public.library_documents
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'curated'
    CHECK (source IN ('curated', 'scheduled', 'on_demand')),
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS full_content text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS library_documents_source_idx ON public.library_documents (source);

COMMENT ON COLUMN public.library_documents.source IS 'curated = seeded/admin; scheduled = cron; on_demand = user-generated into library';
COMMENT ON COLUMN public.library_documents.full_content IS 'Full generated body; preview remains short excerpt';
