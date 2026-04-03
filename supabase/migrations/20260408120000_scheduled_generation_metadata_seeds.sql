-- Scheduled generation: rich metadata on library rows + custom wizard seeds (service role only)

ALTER TABLE public.library_documents
  ADD COLUMN IF NOT EXISTS generation_metadata jsonb;

COMMENT ON COLUMN public.library_documents.generation_metadata IS
  'Cron/on-demand provenance: pipeline, wizardContext snapshot, academic template, etc.';

CREATE INDEX IF NOT EXISTS library_documents_generation_metadata_idx
  ON public.library_documents USING gin (generation_metadata)
  WHERE generation_metadata IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.custom_generation_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  wizard_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  document_title text,
  context_hash text
);

CREATE UNIQUE INDEX IF NOT EXISTS custom_generation_seeds_context_hash_uidx
  ON public.custom_generation_seeds (context_hash)
  WHERE context_hash IS NOT NULL;

COMMENT ON TABLE public.custom_generation_seeds IS
  'Sanitized custom on-demand wizard answers; used to diversify scheduled generation; admin/service role only';

ALTER TABLE public.custom_generation_seeds ENABLE ROW LEVEL SECURITY;
