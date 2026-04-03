import type { SupabaseClient } from '@supabase/supabase-js'

export function baseSlugFromName(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return s || 'folder'
}

/** Resolves a unique slug for this user under the given parent (null = root). */
export async function uniqueFolderSlug(
  supabase: SupabaseClient,
  userId: string,
  parentId: string | null,
  name: string
): Promise<string> {
  const base = baseSlugFromName(name)
  for (let i = 0; i < 80; i++) {
    const slug = i === 0 ? base : `${base}-${i}`
    let q = supabase.from('workspace_folders').select('id').eq('user_id', userId).eq('slug', slug)
    q = parentId === null ? q.is('parent_id', null) : q.eq('parent_id', parentId)
    const { data } = await q.maybeSingle()
    if (!data) return slug
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}
