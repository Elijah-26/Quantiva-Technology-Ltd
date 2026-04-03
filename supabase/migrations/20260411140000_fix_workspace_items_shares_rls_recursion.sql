-- Break RLS cycle: workspace_items_select references workspace_item_shares, while
-- workspace_item_shares_* referenced workspace_items in EXISTS → infinite recursion.
-- Owner checks on shares use a SECURITY DEFINER helper (bypasses RLS on workspace_items).

CREATE OR REPLACE FUNCTION public.workspace_item_is_owner(p_item_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_items wi
    WHERE wi.id = p_item_id AND wi.user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.workspace_item_is_owner(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.workspace_item_is_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.workspace_item_is_owner(uuid, uuid) TO service_role;

DROP POLICY IF EXISTS "workspace_item_shares_select" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_select"
  ON public.workspace_item_shares FOR SELECT
  TO authenticated
  USING (
    shared_with_user_id = auth.uid()
    OR public.workspace_item_is_owner(workspace_item_shares.workspace_item_id, auth.uid())
  );

DROP POLICY IF EXISTS "workspace_item_shares_insert" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_insert"
  ON public.workspace_item_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    public.workspace_item_is_owner(workspace_item_id, auth.uid())
    AND shared_with_user_id IS DISTINCT FROM auth.uid()
  );

DROP POLICY IF EXISTS "workspace_item_shares_delete" ON public.workspace_item_shares;
CREATE POLICY "workspace_item_shares_delete"
  ON public.workspace_item_shares FOR DELETE
  TO authenticated
  USING (
    public.workspace_item_is_owner(workspace_item_id, auth.uid())
    OR shared_with_user_id = auth.uid()
  );
