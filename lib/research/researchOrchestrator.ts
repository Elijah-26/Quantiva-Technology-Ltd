import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Citation, DocumentType, GatherResearchOptions, Paper, ResearchResult } from './types'
import { capForDocumentType } from './documentTypeMap'
import { searchPapers as openAlexSearch } from './openalexClient'
import { searchPapers as s2Search } from './semanticScholarClient'
import { formatCitation } from './citationFormatter'

const CACHE_TABLE = 'research_query_cache'
const LOGS_TABLE = 'research_logs'

export function researchCacheHash(
  topic: string,
  documentType: DocumentType,
  yearFrom?: number
): string {
  return createHash('sha256')
    .update(`${documentType}|${topic.trim().toLowerCase()}|${yearFrom ?? ''}`)
    .digest('hex')
}

function normalizeDoi(d?: string): string | undefined {
  if (!d) return undefined
  const x = d.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
  return x || undefined
}

function dedupeKey(p: Paper): string {
  const d = normalizeDoi(p.doi)
  if (d) return `doi:${d}`
  return `${p.source}:${p.id}`
}

function mergePapers(oa: Paper[], s2: Paper[]): Paper[] {
  const map = new Map<string, Paper>()
  for (const p of oa) {
    map.set(dedupeKey(p), { ...p })
  }
  for (const p of s2) {
    const k = dedupeKey(p)
    const ex = map.get(k)
    if (ex) {
      if (p.tldr && !ex.tldr) ex.tldr = p.tldr
      if (p.citationCount > ex.citationCount) ex.citationCount = p.citationCount
      if (!ex.openAccessUrl && p.openAccessUrl) ex.openAccessUrl = p.openAccessUrl
      if (p.source === 'semantic_scholar' && ex.source === 'openalex') {
        /* keep openalex as primary */
      }
    } else {
      map.set(k, { ...p })
    }
  }
  return [...map.values()]
}

function scorePaper(p: Paper, maxCites: number): number {
  const mc = Math.max(maxCites, 1)
  let s = (p.citationCount / mc) * 0.4
  if (p.abstract?.trim()) s += 0.1
  if (p.doi) s += 0.2
  if (p.openAccessUrl) s += 0.1
  const y = p.year
  const now = new Date().getFullYear()
  if (y >= now - 5) s += 0.15
  return s
}

export async function logResearchEvent(
  supabase: SupabaseClient | undefined,
  userId: string | undefined,
  query: string,
  sourceApi: 'openalex' | 'semantic_scholar' | 'firecrawl' | 'orchestrator',
  papersReturned: number,
  error?: string
) {
  if (!supabase || !userId) return
  try {
    await supabase.from(LOGS_TABLE).insert({
      user_id: userId,
      query: query.slice(0, 2000),
      source_api: sourceApi,
      papers_returned: papersReturned,
      error: error?.slice(0, 2000) ?? null,
    })
  } catch {
    /* non-fatal */
  }
}

type CachedPayload = {
  papers: Paper[]
  citations: Record<string, { inText: string; fullReference: string; doi?: string }>
}

async function readCache(
  supabase: SupabaseClient,
  userId: string,
  hash: string
): Promise<ResearchResult | null> {
  try {
    const { data, error } = await supabase
      .from(CACHE_TABLE)
      .select('response_jsonb, expires_at')
      .eq('user_id', userId)
      .eq('query_hash', hash)
      .maybeSingle()
    if (error || !data) return null
    const exp = new Date(data.expires_at as string).getTime()
    if (exp < Date.now()) return null
    const payload = data.response_jsonb as CachedPayload
    if (!payload?.papers) return null
    const citations = new Map<string, Citation>()
    for (const [k, v] of Object.entries(payload.citations || {})) {
      citations.set(k, v)
    }
    return { papers: payload.papers, citations }
  } catch {
    return null
  }
}

async function writeCache(
  supabase: SupabaseClient,
  userId: string,
  hash: string,
  result: ResearchResult
) {
  const citations: CachedPayload['citations'] = {}
  for (const [k, v] of result.citations) {
    citations[k] = { inText: v.inText, fullReference: v.fullReference, doi: v.doi }
  }
  const payload: CachedPayload = { papers: result.papers, citations }
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  try {
    await supabase.from(CACHE_TABLE).upsert(
      {
        user_id: userId,
        query_hash: hash,
        response_jsonb: payload,
        expires_at: expires,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,query_hash' }
    )
  } catch {
    /* non-fatal */
  }
}

export async function gatherScholarlyResearch(
  topic: string,
  documentType: DocumentType,
  options: GatherResearchOptions,
  ctx?: { supabase: SupabaseClient; userId: string }
): Promise<ResearchResult> {
  const citationStyle = options.citationStyle
  const yearFrom = options.yearFrom
  const hash = researchCacheHash(topic, documentType, yearFrom)

  if (ctx?.supabase && ctx.userId) {
    const hit = await readCache(ctx.supabase, ctx.userId, hash)
    if (hit) return hit
  }

  const [oa, s2] = await Promise.all([
    openAlexSearch(topic, {
      yearFrom,
      limit: 20,
      requireAbstract: true,
    }),
    s2Search(topic, { limit: 15 }),
  ])

  if (ctx?.supabase && ctx.userId) {
    await logResearchEvent(ctx.supabase, ctx.userId, topic, 'openalex', oa.length)
    await logResearchEvent(ctx.supabase, ctx.userId, topic, 'semantic_scholar', s2.length)
  }

  const merged = mergePapers(oa, s2).filter((p) => p.abstract.trim().length > 0)
  const maxC = Math.max(...merged.map((p) => p.citationCount), 1)
  const scored = merged
    .map((p) => ({ p, s: scorePaper(p, maxC) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p)

  const cap = capForDocumentType(documentType)
  const top = scored.slice(0, cap)

  const citations = new Map<string, Citation>()
  top.forEach((p, i) => {
    const c = formatCitation(p, citationStyle, citationStyle === 'IEEE' ? i + 1 : undefined)
    citations.set(p.id, c)
  })

  const result: ResearchResult = { papers: top, citations }

  if (ctx?.supabase && ctx.userId && top.length > 0) {
    await writeCache(ctx.supabase, ctx.userId, hash, result)
  }

  if (ctx?.supabase && ctx.userId) {
    await logResearchEvent(ctx.supabase, ctx.userId, topic, 'orchestrator', top.length)
  }

  return result
}
