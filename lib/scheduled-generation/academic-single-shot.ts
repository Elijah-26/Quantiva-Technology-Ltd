import type { AcademicTemplateType } from '@/lib/academic-research/types'
import { openaiChat } from '@/lib/academic-research/generate'

const DISCIPLINES = [
  'Environmental policy',
  'Digital health informatics',
  'Financial technology regulation',
  'Human–computer interaction',
  'Sustainable supply chains',
  'Public administration',
  'Educational psychology',
  'Renewable energy systems',
]

const TOPICS = [
  'trust and transparency in automated decision systems',
  'barriers to cross-border data flows for SMEs',
  'equity in access to telehealth services',
  'governance of foundation models in regulated industries',
  'longitudinal outcomes of hybrid learning programs',
  'lifecycle assessment gaps in battery recycling policy',
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

const SYSTEM = `You are an academic writing assistant. Produce a single coherent markdown document (use ## and ### headings, no YAML front matter).
Do not claim empirical data you do not have; use careful scholarly language ("may", "suggests", "further research").
Length: roughly 900–1800 words. No meta-commentary about being an AI.`

export async function synthesizeAcademicSingleShot(input: {
  templateType: AcademicTemplateType
  seedSnippet?: string
}): Promise<{ text: string; error?: string }> {
  const discipline = pick(DISCIPLINES)
  const topic = pick(TOPICS)
  const title = `${discipline}: perspectives on ${topic}`

  const seedLine = input.seedSnippet?.trim()
    ? `\nAdditional thematic brief (incorporate where relevant):\n${input.seedSnippet.trim().slice(0, 2000)}\n`
    : ''

  const user = `Document type: ${input.templateType}
Working title: ${title}
Discipline framing: ${discipline}
Core theme: ${topic}
${seedLine}
Write one standalone document appropriate to the type:
- dissertation_thesis: chapter-style sections (introduction, literature synthesis, methods outline, discussion).
- literature_review: thematic synthesis with clear subsections.
- case_study: context, actors, analysis, lessons.
- research_proposal: background, aims, methods, significance, limitations.
- research_paper: IMRaD-style sections (abstract as first heading, then introduction, methods, results discussion placeholder, conclusion).

Use markdown headings starting with ##.`

  return openaiChat(SYSTEM, user, 4500)
}
