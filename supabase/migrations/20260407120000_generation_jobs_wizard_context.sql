-- On-demand document wizard: structured answers per job

ALTER TABLE public.generation_jobs
  ADD COLUMN IF NOT EXISTS wizard_context jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.generation_jobs.wizard_context IS 'Per-document-type wizard field answers (JSON object)';
