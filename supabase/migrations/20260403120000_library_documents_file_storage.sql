-- Optional file attachments for library_documents (admin uploads → user library)

ALTER TABLE public.library_documents
  ADD COLUMN IF NOT EXISTS file_storage_path text,
  ADD COLUMN IF NOT EXISTS file_mime_type text,
  ADD COLUMN IF NOT EXISTS original_filename text;

COMMENT ON COLUMN public.library_documents.file_storage_path IS 'Supabase Storage path within bucket library-documents';
COMMENT ON COLUMN public.library_documents.file_mime_type IS 'MIME type of uploaded original file';
COMMENT ON COLUMN public.library_documents.original_filename IS 'Original client filename for download';

-- Private bucket; reads go through API (service role) or signed URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'library-documents',
  'library-documents',
  false,
  52428800,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit;
