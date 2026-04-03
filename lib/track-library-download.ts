/** Fire-and-forget: increments library_documents.download_count (authenticated). */
export function trackLibraryDocumentDownload(libraryDocumentId: string): void {
  if (!libraryDocumentId) return
  void fetch(`/api/library-documents/${encodeURIComponent(libraryDocumentId)}/download`, {
    method: 'POST',
    credentials: 'include',
  })
}
