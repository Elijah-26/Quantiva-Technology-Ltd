/** Supabase list selects for library_documents — file columns require migration 20260403120000_library_documents_file_storage.sql */

export const LIBRARY_DOCUMENTS_SELECT_LIST_WITH_FILES =
  'id, title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions, related_ids, created_at, updated_at, source, created_by_user_id, file_storage_path, original_filename' as const

export const LIBRARY_DOCUMENTS_SELECT_LIST_LEGACY =
  'id, title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions, related_ids, created_at, updated_at, source, created_by_user_id' as const

export const ADMIN_LIBRARY_DOCUMENTS_SELECT_WITH_FILES =
  'id, title, description, category, jurisdiction, access_level, word_count, download_count, rating, preview, source, created_at, updated_at, complexity, read_minutes, file_storage_path, original_filename' as const

export const ADMIN_LIBRARY_DOCUMENTS_SELECT_LEGACY =
  'id, title, description, category, jurisdiction, access_level, word_count, download_count, rating, preview, source, created_at, updated_at, complexity, read_minutes' as const

/** True when PostgREST reports missing file-attachment columns (DB not migrated yet). */
export function missingLibraryFileAttachmentColumnsError(message: string): boolean {
  const m = message.toLowerCase()
  if (!m.includes('does not exist')) return false
  return (
    m.includes('file_storage_path') ||
    m.includes('original_filename') ||
    m.includes('file_mime_type')
  )
}
