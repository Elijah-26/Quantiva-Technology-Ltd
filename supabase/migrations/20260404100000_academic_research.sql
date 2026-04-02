-- Academic research wizard: persisted sessions and generated sections

CREATE TABLE IF NOT EXISTS public.academic_research_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  template_type text NOT NULL CHECK (template_type IN (
    'dissertation_thesis',
    'literature_review',
    'case_study',
    'research_proposal',
    'research_paper'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'researching',
    'generating',
    'completed',
    'failed'
  )),
  title text NOT NULL DEFAULT '',
  citation_style text NOT NULL DEFAULT '',
  word_target_band text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  scraped_context jsonb NOT NULL DEFAULT '[]'::jsonb,
  outline jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academic_research_sessions_user_idx
  ON public.academic_research_sessions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.academic_research_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.academic_research_sessions (id) ON DELETE CASCADE,
  section_slug text NOT NULL,
  heading text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, section_slug)
);

CREATE INDEX IF NOT EXISTS academic_research_sections_session_idx
  ON public.academic_research_sections (session_id, sort_order);

ALTER TABLE public.academic_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_research_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academic_research_sessions_own"
  ON public.academic_research_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "academic_research_sections_via_session"
  ON public.academic_research_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academic_research_sessions s
      WHERE s.id = academic_research_sections.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academic_research_sessions s
      WHERE s.id = academic_research_sections.session_id AND s.user_id = auth.uid()
    )
  );
