import { openaiChat } from '@/lib/academic-research/generate'
import type { AcademicTemplateType } from '@/lib/academic-research/types'

const SYSTEM = `You produce professional markdown documents that blend business/legal drafting with academic structure where asked.
Use ## and ### headings. This is a draft template only—not legal advice. Length roughly 1000–1800 words.`

export async function synthesizeHybridScheduled(input: {
  onDemandLabel: string
  academicTemplate: AcademicTemplateType
  industry: string
  jurisdictionLabel: string
  seedSnippet?: string
}): Promise<{ text: string; error?: string }> {
  const seed = input.seedSnippet?.trim()
    ? `\nIncorporate themes from this brief where natural:\n${input.seedSnippet.trim().slice(0, 2500)}\n`
    : ''

  const user = `Create a single hybrid document that:
1) Addresses the practical document style: "${input.onDemandLabel}" for an organization in industry "${input.industry}" and jurisdiction "${input.jurisdictionLabel}".
2) Borrows structural inspiration from an academic "${input.academicTemplate}" (e.g. clear problem framing, literature-style subsectioning where helpful) without claiming fake empirical results or citations.
${seed}
Output coherent markdown only.`

  return openaiChat(SYSTEM, user, 4000)
}
