import { buildMarkdownDraftDocxBuffer, buildMarkdownDraftPdfBuffer } from '@/lib/markdown-draft-export'

export { paragraphsFromMarkdown } from '@/lib/markdown-draft-export'

export async function exportOnDemandDraftDocx(title: string, markdownBody: string): Promise<Blob> {
  const buf = await buildMarkdownDraftDocxBuffer(title, markdownBody)
  const u8 = new Uint8Array(buf.byteLength)
  u8.set(buf)
  return new Blob([u8], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export async function exportOnDemandDraftPdf(title: string, markdownBody: string): Promise<Blob> {
  const buf = await buildMarkdownDraftPdfBuffer(title, markdownBody)
  const u8 = new Uint8Array(buf.byteLength)
  u8.set(buf)
  return new Blob([u8], { type: 'application/pdf' })
}
