-- Fix infinite recursion on SELECT organization_members: the previous policy used
-- EXISTS (SELECT ... FROM organization_members ...) which re-evaluated the same policy.
-- Users only need to read their own membership rows for org-scoped workspace RLS joins.

DROP POLICY IF EXISTS "organization_members_select" ON public.organization_members;

CREATE POLICY "organization_members_select"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
