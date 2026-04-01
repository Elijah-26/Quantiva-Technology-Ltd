-- Persona / enterprise: workspace body text, organizations, audit log, org-scoped folder visibility

-- ---------------------------------------------------------------------------
-- workspace_items: store generated snapshot + link to job
-- ---------------------------------------------------------------------------
ALTER TABLE public.workspace_items
  ADD COLUMN IF NOT EXISTS content_text text,
  ADD COLUMN IF NOT EXISTS generation_job_id uuid REFERENCES public.generation_jobs (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workspace_items_generation_job_idx ON public.workspace_items (generation_job_id);

-- ---------------------------------------------------------------------------
-- organizations & members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_members_user_idx ON public.organization_members (user_id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_member_select" ON public.organizations;
CREATE POLICY "organizations_member_select"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organizations.id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "organization_members_select" ON public.organization_members;
CREATE POLICY "organization_members_select"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = organization_members.organization_id AND m.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- workspace_folders: optional org (shared folder); items in that folder readable by org members
-- ---------------------------------------------------------------------------
ALTER TABLE public.workspace_folders
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workspace_folders_org_idx ON public.workspace_folders (organization_id);

DROP POLICY IF EXISTS "workspace_folders_own" ON public.workspace_folders;
CREATE POLICY "workspace_folders_select"
  ON public.workspace_folders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = workspace_folders.organization_id
          AND om.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "workspace_folders_insert"
  ON public.workspace_folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_folders_update"
  ON public.workspace_folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_folders_delete"
  ON public.workspace_folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- workspace_items: own rows + read via org-linked folder
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "workspace_items_own" ON public.workspace_items;

CREATE POLICY "workspace_items_select"
  ON public.workspace_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      folder_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.workspace_folders f
        JOIN public.organization_members om
          ON om.organization_id = f.organization_id AND om.user_id = auth.uid()
        WHERE f.id = workspace_items.folder_id
          AND f.organization_id IS NOT NULL
      )
    )
  );

CREATE POLICY "workspace_items_insert"
  ON public.workspace_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_items_update"
  ON public.workspace_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_items_delete"
  ON public.workspace_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- audit_events (append-only via service role in app; users read own rows)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL,
  actor_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_actor_created_idx ON public.audit_events (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_org_created_idx ON public.audit_events (organization_id, created_at DESC);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_events_select_own" ON public.audit_events;
CREATE POLICY "audit_events_select_own"
  ON public.audit_events FOR SELECT
  TO authenticated
  USING (actor_user_id = auth.uid());
