import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'
import type { OutlineItem } from './types'
import type { SectionRow } from './assemble'

export type ExportPayload = {
  title: string
  outline: OutlineItem[]
  sections: SectionRow[]
  referencesText: string
}

function bodyToParagraphs(body: string): Paragraph[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para) => {
      const text = para.replace(/^#{1,6}\s+/gm, '').replace(/\n/g, ' ')
      return new Paragraph({ children: [new TextRun(text)] })
    })
}

export async function buildDocxBuffer(input: ExportPayload): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
    }),
  ]

  const outlineSorted = [...input.outline].sort((a, b) => a.sort_order - b.sort_order)
  const sortedSections = [...input.sections].sort((a, b) => a.sort_order - b.sort_order)

  for (let i = 0; i < outlineSorted.length; i++) {
    const o = outlineSorted[i]
    const sec = sortedSections.find((s) => s.section_slug === o.slug)
    children.push(
      new Paragraph({
        text: `${i + 1}. ${o.heading}`,
        heading: HeadingLevel.HEADING_1,
      })
    )
    if (sec?.body?.trim()) {
      children.push(...bodyToParagraphs(sec.body))
    }
  }

  const ref = input.referencesText?.trim()
  if (ref) {
    children.push(
      new Paragraph({
        text: 'References',
        heading: HeadingLevel.HEADING_1,
      })
    )
    for (const para of ref.split(/\n\n+/).filter(Boolean)) {
      children.push(new Paragraph({ text: para.trim() }))
    }
  }

  const doc = new Document({
    sections: [{ children }],
  })
  return Packer.toBuffer(doc)
}

function stripMarkdownish(s: string): string {
  return s.replace(/^#{1,6}\s+/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1')
}

export function buildPdfBuffer(input: ExportPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (c) => chunks.push(c as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(18).font('Helvetica-Bold').text(input.title, { align: 'center' })
    doc.moveDown(1.5)

    const outlineSorted = [...input.outline].sort((a, b) => a.sort_order - b.sort_order)
    const sortedSections = [...input.sections].sort((a, b) => a.sort_order - b.sort_order)

    for (let i = 0; i < outlineSorted.length; i++) {
      const o = outlineSorted[i]
      const sec = sortedSections.find((s) => s.section_slug === o.slug)
      doc.fontSize(14).font('Helvetica-Bold').text(`${i + 1}. ${o.heading}`)
      doc.moveDown(0.5)
      if (sec?.body?.trim()) {
        doc.fontSize(11).font('Helvetica').text(stripMarkdownish(sec.body), {
          align: 'left',
          paragraphGap: 6,
        })
      }
      doc.moveDown(1)
    }

    const ref = input.referencesText?.trim()
    if (ref) {
      doc.addPage()
      doc.fontSize(14).font('Helvetica-Bold').text('References')
      doc.moveDown(0.5)
      doc.fontSize(10).font('Helvetica').text(stripMarkdownish(ref), { paragraphGap: 6 })
    }

    doc.end()
  })
}
