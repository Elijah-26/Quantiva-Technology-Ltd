import type { SupabaseClient } from '@supabase/supabase-js'

/** True if assigning newParentId to folderId would create a cycle. */
export async function folderMoveWouldCycle(
  supabase: SupabaseClient,
  folderId: string,
  newParentId: string | null
): Promise<boolean> {
  if (newParentId === null) return false
  if (newParentId === folderId) return true
  let walk: string | null = newParentId
  const seen = new Set<string>()
  for (let depth = 0; depth < 64 && walk; depth++) {
    if (walk === folderId) return true
    if (seen.has(walk)) return true
    seen.add(walk)
    const res = await supabase
      .from('workspace_folders')
      .select('parent_id')
      .eq('id', walk)
      .maybeSingle()
    const row = res.data as { parent_id: string | null } | null
    walk = row?.parent_id ?? null
  }
  return false
}
