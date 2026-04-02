-- Link library rows created from AI Generate wizard to generation_jobs (quota: count job once, not job + library)

ALTER TABLE public.library_documents
  ADD COLUMN IF NOT EXISTS generation_job_id uuid REFERENCES public.generation_jobs (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS library_documents_generation_job_id_idx
  ON public.library_documents (generation_job_id)
  WHERE generation_job_id IS NOT NULL;

COMMENT ON COLUMN public.library_documents.generation_job_id IS 'When set, this library row was saved from AI Generate; excluded from standalone on_demand quota tally';
