-- Generated references appendix (separate from outline sections)

ALTER TABLE public.academic_research_sessions
  ADD COLUMN IF NOT EXISTS references_text text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.academic_research_sessions.references_text IS 'LLM-generated References section with URLs; appended after section bodies';
