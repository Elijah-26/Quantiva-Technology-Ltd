import type { OutlineItem } from './types'

export type SectionRow = {
  section_slug: string
  heading: string
  sort_order: number
  body: string
}

/** Plain-text / markdown assembly for preview, copy, and export input. */
export function buildAssembledDocument(input: {
  title: string
  outline: OutlineItem[]
  sections: SectionRow[]
  referencesText: string
}): string {
  const lines: string[] = [`# ${input.title}`, '']
  const sorted = [...input.sections].sort((a, b) => a.sort_order - b.sort_order)
  const outlineSorted = [...input.outline].sort((a, b) => a.sort_order - b.sort_order)

  for (let i = 0; i < outlineSorted.length; i++) {
    const o = outlineSorted[i]
    const sec = sorted.find((s) => s.section_slug === o.slug)
    const num = i + 1
    lines.push(`## ${num}. ${o.heading}`)
    lines.push('')
    if (sec?.body?.trim()) {
      lines.push(sec.body.trim())
      lines.push('')
    }
  }

  const ref = input.referencesText?.trim()
  if (ref) {
    lines.push('## References')
    lines.push('')
    lines.push(ref)
    lines.push('')
  }

  return lines.join('\n').trim()
}
