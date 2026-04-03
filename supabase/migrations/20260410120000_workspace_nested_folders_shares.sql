-- Nested workspace folders (parent_id) and per-document sharing (workspace_item_shares).

-- ---------------------------------------------------------------------------
-- workspace_folders: hierarchy
-- ---------------------------------------------------------------------------
ALTER TABLE public.workspace_folders
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.workspace_folders (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS workspace_folders_parent_idx ON public.workspace_folders (parent_id);

ALTER TABLE public.workspace_folders
  DROP CONSTRAINT IF EXISTS workspace_folders_user_id_slug_key;

-- One slug per (owner, parent); NULL parent = root level. Requires Postgres 15+ (NULLS NOT DISTINCT).
CREATE UNIQUE INDEX IF NOT EXISTS workspace_folders_user_parent_slug_uidx
  ON public.workspace_folders (user_id, parent_id, slug) NULLS NOT DISTINCT;

-- ---------------------------------------------------------------------------
-- workspace_item_shares: grant read access to another user
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_item_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_item_id uuid NOT NULL REFERENCES public.workspace_items (id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_item_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS workspace_item_shares_shared_with_idx
  ON public.workspace_item_shares (shared_with_user_id);

ALTER TABLE public.workspace_item_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_item_shares_select" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_select"
  ON public.workspace_item_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_items wi
      WHERE wi.id = workspace_item_shares.workspace_item_id AND wi.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workspace_item_shares_insert" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_insert"
  ON public.workspace_item_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_items wi
      WHERE wi.id = workspace_item_id AND wi.user_id = auth.uid()
    )
    AND shared_with_user_id IS DISTINCT FROM auth.uid()
  );

DROP POLICY IF EXISTS "workspace_item_shares_delete" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_delete"
  ON public.workspace_item_shares FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_items wi
      WHERE wi.id = workspace_item_id AND wi.user_id = auth.uid()
    )
    OR shared_with_user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- workspace_items: readers also see rows shared explicitly
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "workspace_items_select" ON public.workspace_items;

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
    OR EXISTS (
      SELECT 1 FROM public.workspace_item_shares s
      WHERE s.workspace_item_id = workspace_items.id
        AND s.shared_with_user_id = auth.uid()
    )
  );
