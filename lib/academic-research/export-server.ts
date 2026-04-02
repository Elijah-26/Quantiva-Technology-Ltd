import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  TableOfContents,
} from 'docx'
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
  const children: (Paragraph | TableOfContents)[] = [
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: 'Table of contents',
      heading: HeadingLevel.HEADING_1,
    }),
    new TableOfContents('Table of contents', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({
      text: '',
      pageBreakBefore: true,
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
    features: { updateFields: true },
    sections: [{ children }],
  })
  return Packer.toBuffer(doc)
}

function stripMarkdownish(s: string): string {
  return s.replace(/^#{1,6}\s+/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1')
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 56

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      cur = next
    } else {
      if (cur) lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

function drawWrappedBlock(
  pdfDoc: PDFDocument,
  pageRef: { page: PDFPage; y: number },
  text: string,
  size: number,
  font: PDFFont,
  lineGap: number
) {
  const maxW = PAGE_W - 2 * MARGIN
  const paragraphs = stripMarkdownish(text).split(/\n\n+/)
  for (const para of paragraphs) {
    const flat = para.replace(/\n/g, ' ').trim()
    if (!flat) continue
    const lines = wrapLine(flat, font, size, maxW)
    for (const line of lines) {
      if (pageRef.y < MARGIN + size * 2) {
        pageRef.page = pdfDoc.addPage([PAGE_W, PAGE_H])
        pageRef.y = PAGE_H - MARGIN
      }
      pageRef.page.drawText(line, {
        x: MARGIN,
        y: pageRef.y - size,
        size,
        font,
        color: rgb(0, 0, 0),
      })
      pageRef.y -= lineGap
    }
    pageRef.y -= lineGap * 0.35
  }
}

export async function buildPdfBuffer(input: ExportPayload): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  const cursor = { page, y: PAGE_H - MARGIN }

  const titleLines = wrapLine(input.title, fontBold, 18, PAGE_W - 2 * MARGIN)
  for (const line of titleLines) {
    const w = fontBold.widthOfTextAtSize(line, 18)
    cursor.page.drawText(line, {
      x: (PAGE_W - w) / 2,
      y: cursor.y - 18,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    cursor.y -= 22
  }
  cursor.y -= 16

  const outlineSorted = [...input.outline].sort((a, b) => a.sort_order - b.sort_order)
  const sortedSections = [...input.sections].sort((a, b) => a.sort_order - b.sort_order)

  for (let i = 0; i < outlineSorted.length; i++) {
    const o = outlineSorted[i]
    const sec = sortedSections.find((s) => s.section_slug === o.slug)
    const heading = `${i + 1}. ${o.heading}`
    if (cursor.y < MARGIN + 40) {
      cursor.page = pdfDoc.addPage([PAGE_W, PAGE_H])
      cursor.y = PAGE_H - MARGIN
    }
    cursor.page.drawText(heading, {
      x: MARGIN,
      y: cursor.y - 14,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    cursor.y -= 22
    if (sec?.body?.trim()) {
      drawWrappedBlock(pdfDoc, cursor, sec.body, 11, font, 13)
    }
    cursor.y -= 10
  }

  const ref = input.referencesText?.trim()
  if (ref) {
    cursor.page = pdfDoc.addPage([PAGE_W, PAGE_H])
    cursor.y = PAGE_H - MARGIN
    cursor.page.drawText('References', {
      x: MARGIN,
      y: cursor.y - 14,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    cursor.y -= 24
    drawWrappedBlock(pdfDoc, cursor, ref, 10, font, 12)
  }

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
