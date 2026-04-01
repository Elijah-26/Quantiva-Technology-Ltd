-- Core product tables: reference data, library, workspace, generation jobs, moderation.
-- Run in Supabase SQL editor or via CLI. Idempotent where possible.

-- ---------------------------------------------------------------------------
-- reference_options: market categories, geographies (no static UI lists)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reference_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, value)
);

CREATE INDEX IF NOT EXISTS reference_options_kind_idx ON public.reference_options (kind, sort_order);

ALTER TABLE public.reference_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reference_options_select_auth" ON public.reference_options;
CREATE POLICY "reference_options_select_auth"
  ON public.reference_options FOR SELECT
  TO authenticated
  USING (true);

-- Seed categories & geographies (idempotent)
INSERT INTO public.reference_options (kind, value, label, sort_order) VALUES
  ('market_category', 'technology-software', 'Technology & Software', 10),
  ('market_category', 'healthcare-pharma', 'Healthcare & Pharmaceuticals', 20),
  ('market_category', 'financial-services', 'Financial Services', 30),
  ('market_category', 'ecommerce-retail', 'E-commerce & Retail', 40),
  ('market_category', 'manufacturing', 'Manufacturing & Industrial', 50),
  ('market_category', 'food-beverage', 'Food & Beverage', 60),
  ('market_category', 'real-estate', 'Real Estate', 70),
  ('market_category', 'education', 'Education & E-learning', 80),
  ('market_category', 'entertainment', 'Entertainment & Media', 90),
  ('market_category', 'automotive', 'Automotive', 100),
  ('market_category', 'energy', 'Energy & Utilities', 110),
  ('market_category', 'telecom', 'Telecommunications', 120),
  ('geography', 'global', 'Global', 10),
  ('geography', 'north-america', 'North America', 20),
  ('geography', 'europe', 'Europe', 30),
  ('geography', 'asia-pacific', 'Asia Pacific (APAC)', 40),
  ('geography', 'uk', 'United Kingdom (UK)', 50),
  ('geography', 'usa', 'United States (USA)', 60),
  ('geography', 'eu', 'European Union', 70),
  ('geography', 'mena', 'Middle East & North Africa (MENA)', 80)
ON CONFLICT (kind, value) DO NOTHING;

-- ---------------------------------------------------------------------------
-- library_documents: template library (replaces static mock list)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.library_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  jurisdiction text NOT NULL DEFAULT '',
  access_level text NOT NULL DEFAULT 'free',
  word_count int NOT NULL DEFAULT 0,
  download_count int NOT NULL DEFAULT 0,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  last_updated date,
  preview text NOT NULL DEFAULT '',
  read_minutes int NOT NULL DEFAULT 0,
  complexity text NOT NULL DEFAULT 'Moderate' CHECK (complexity IN ('Low', 'Moderate', 'High')),
  versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS library_documents_category_idx ON public.library_documents (category);

ALTER TABLE public.library_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_documents_select_auth" ON public.library_documents;
CREATE POLICY "library_documents_select_auth"
  ON public.library_documents FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO public.library_documents (title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions)
SELECT 'GDPR Privacy Policy Template',
  'Comprehensive privacy policy compliant with GDPR regulations',
  'privacy', 'eu', 'free', 2500, 0, 4.8, '2024-03-15'::date,
  'This Privacy Policy describes how [Company Name] collects, uses, and protects personal data in accordance with the General Data Protection Regulation (GDPR).',
  12, 'Moderate', '[{"version":"2.1","date":"2024-03-15","note":"Cookie section updated"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.library_documents d WHERE d.title = 'GDPR Privacy Policy Template');

INSERT INTO public.library_documents (title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions)
SELECT 'Employment Contract Template',
  'Standard employment contract with customizable clauses',
  'hr', 'uk', 'pro', 3200, 0, 4.7, '2024-03-10'::date,
  'EMPLOYMENT AGREEMENT between [Employer] and [Employee] on [Date].',
  15, 'High', '[{"version":"1.4","date":"2024-03-10","note":"IR35 clause optional block"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.library_documents d WHERE d.title = 'Employment Contract Template');

INSERT INTO public.library_documents (title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions)
SELECT 'Non-Disclosure Agreement',
  'Mutual NDA template for business partnerships',
  'contracts', 'us', 'free', 1800, 0, 4.9, '2024-03-12'::date,
  'MUTUAL NON-DISCLOSURE AGREEMENT. Each party agrees to hold confidential information in strict confidence.',
  8, 'Low', '[{"version":"1.2","date":"2024-03-12","note":"Mutual reciprocity clarified"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.library_documents d WHERE d.title = 'Non-Disclosure Agreement');

-- ---------------------------------------------------------------------------
-- workspace_folders / workspace_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  icon_emoji text NOT NULL DEFAULT '📁',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

CREATE TABLE IF NOT EXISTS public.workspace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.workspace_folders (id) ON DELETE SET NULL,
  title text NOT NULL,
  doc_type text,
  status text NOT NULL DEFAULT 'completed',
  is_favorite boolean NOT NULL DEFAULT false,
  library_document_id uuid REFERENCES public.library_documents (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_folders_user_idx ON public.workspace_folders (user_id);
CREATE INDEX IF NOT EXISTS workspace_items_user_idx ON public.workspace_items (user_id);

ALTER TABLE public.workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_folders_own" ON public.workspace_folders;
CREATE POLICY "workspace_folders_own"
  ON public.workspace_folders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_items_own" ON public.workspace_items;
CREATE POLICY "workspace_items_own"
  ON public.workspace_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- generation_jobs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  document_type text,
  industry text,
  jurisdiction text,
  company_name text,
  website text,
  description text,
  additional_requirements text,
  result_text text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generation_jobs_user_created_idx ON public.generation_jobs (user_id, created_at DESC);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "generation_jobs_own" ON public.generation_jobs;
CREATE POLICY "generation_jobs_own"
  ON public.generation_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- moderation_items (admin APIs use service role + server-side admin check)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_email text,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'pending',
  snippet text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_items ENABLE ROW LEVEL SECURITY;

-- Admins (public.users.role) can manage queue
DROP POLICY IF EXISTS "moderation_items_admin_all" ON public.moderation_items;
CREATE POLICY "moderation_items_admin_all"
  ON public.moderation_items FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

INSERT INTO public.moderation_items (submitter_email, title, category, status, snippet, submitted_at)
SELECT 'jane@example.com', 'Client suitability statement — draft', 'Compliance', 'pending',
  'We believe this product is suitable for all retail investors seeking growth...', now() - interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.moderation_items m WHERE m.title = 'Client suitability statement — draft');

INSERT INTO public.moderation_items (submitter_email, title, category, status, snippet, submitted_at)
SELECT 'marketing@example.com', 'LinkedIn post — Q1 outlook', 'Marketing', 'pending',
  'Guaranteed upside in volatile markets — act now...', now() - interval '3 days'
WHERE NOT EXISTS (SELECT 1 FROM public.moderation_items m WHERE m.title = 'LinkedIn post — Q1 outlook');

INSERT INTO public.moderation_items (submitter_email, title, category, status, snippet, submitted_at)
SELECT 'newsletter@example.com', 'Newsletter — tax wrapper promo', 'Communications', 'pending',
  'HMRC-approved structure with zero risk to capital...', now() - interval '4 days'
WHERE NOT EXISTS (SELECT 1 FROM public.moderation_items m WHERE m.title = 'Newsletter — tax wrapper promo');
