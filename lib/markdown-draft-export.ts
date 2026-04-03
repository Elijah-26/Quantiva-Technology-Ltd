/**
 * Shared markdown → DOCX/PDF for browser (Blob) and Node (Buffer).
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

function stripMarkdownish(s: string): string {
  return s
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
}

export function paragraphsFromMarkdown(markdownBody: string): Paragraph[] {
  const trimmed = markdownBody.trim()
  if (!trimmed) {
    return [new Paragraph({ children: [new TextRun('')] })]
  }
  const blocks = trimmed.split(/\n\n+/)
  const out: Paragraph[] = []
  for (const raw of blocks) {
    const block = raw.trim()
    if (!block) continue
    const lines = block.split('\n')
    const first = lines[0]
    const hm = first.match(/^(#{1,6})\s+(.+)$/)
    if (hm) {
      const level = hm[1].length
      const rest = lines.slice(1).join('\n').trim()
      const hl =
        level <= 1
          ? HeadingLevel.HEADING_1
          : level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3
      out.push(
        new Paragraph({
          text: stripMarkdownish(hm[2]),
          heading: hl,
        })
      )
      if (rest) {
        out.push(
          new Paragraph({
            children: [new TextRun(stripMarkdownish(rest).replace(/\n/g, ' '))],
          })
        )
      }
    } else {
      out.push(
        new Paragraph({
          children: [new TextRun(stripMarkdownish(block).replace(/\n/g, ' '))],
        })
      )
    }
  }
  return out.length ? out : [new Paragraph({ children: [new TextRun('')] })]
}

export async function buildMarkdownDraftDocxBuffer(title: string, markdownBody: string): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
    ...paragraphsFromMarkdown(markdownBody),
  ]
  const doc = new Document({
    sections: [{ children }],
  })
  return Packer.toBuffer(doc)
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

export async function buildMarkdownDraftPdfBuffer(title: string, markdownBody: string): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  const cursor = { page, y: PAGE_H - MARGIN }

  const titleLines = wrapLine(stripMarkdownish(title), fontBold, 18, PAGE_W - 2 * MARGIN)
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

  drawWrappedBlock(pdfDoc, cursor, markdownBody, 11, font, 13)

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
