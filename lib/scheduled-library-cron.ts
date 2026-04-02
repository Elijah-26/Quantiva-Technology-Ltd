import type { SupabaseClient } from '@supabase/supabase-js'
import { documentTypesForMarketCategory } from '@/lib/library-document-taxonomy'
import {
  synthesizeLibraryDocument,
  buildLibraryDocumentTitle,
  insertGeneratedLibraryRow,
  previewFromBody,
} from '@/lib/library-document-generation'
import { recordAuditEvent } from '@/lib/audit'

const CONFIG_KEY = 'scheduled_library'

export type DocumentsPerDaySource = 'database' | 'environment' | 'default'

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === '') return fallback
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}

/** Hard cap per cron invocation (avoid serverless timeouts). Override via env. */
export function scheduledLibraryMaxPerRun(): number {
  return Math.max(1, Math.min(50, parsePositiveInt(process.env.SCHEDULED_LIBRARY_DOCUMENTS_MAX_PER_DAY, 10)))
}

export async function getScheduledLibraryDocumentsPerDay(
  admin: SupabaseClient
): Promise<{ count: number; source: DocumentsPerDaySource; maxCap: number }> {
  const maxCap = scheduledLibraryMaxPerRun()
  const defaultCount = 1

  const { data: row, error: cfgErr } = await admin
    .from('app_config')
    .select('value')
    .eq('key', CONFIG_KEY)
    .maybeSingle()

  if (cfgErr) {
    console.warn('[scheduled-library] app_config read failed (using env/default):', cfgErr.message)
  }

  const fromDb =
    !cfgErr &&
    row?.value &&
    typeof (row.value as { documents_per_day?: unknown }).documents_per_day === 'number'
      ? Math.floor((row.value as { documents_per_day: number }).documents_per_day)
      : null

  const fromEnv = parsePositiveInt(process.env.SCHEDULED_LIBRARY_DOCUMENTS_PER_DAY, NaN)

  let source: DocumentsPerDaySource = 'default'
  let n = defaultCount

  if (fromDb != null && !Number.isNaN(fromDb)) {
    n = fromDb
    source = 'database'
  } else if (!Number.isNaN(fromEnv)) {
    n = fromEnv
    source = 'environment'
  }

  n = Math.min(Math.max(1, n), maxCap)
  return { count: n, source, maxCap }
}

export async function upsertScheduledLibraryDocumentsPerDay(
  admin: SupabaseClient,
  documentsPerDay: number
): Promise<{ error?: string }> {
  const maxCap = scheduledLibraryMaxPerRun()
  const n = Math.min(Math.max(1, Math.floor(documentsPerDay)), maxCap)
  const { error } = await admin.from('app_config').upsert(
    {
      key: CONFIG_KEY,
      value: { documents_per_day: n },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )
  if (error) return { error: error.message }
  return {}
}

export async function runScheduledLibraryHealthChecks(admin: SupabaseClient): Promise<{
  openaiApiKeyConfigured: boolean
  cronSecretConfigured: boolean
  cronAuditUserConfigured: boolean
  referenceMarketCategories: number
  referenceGeographies: number
  readyForScheduledRun: boolean
}> {
  const openaiApiKeyConfigured = !!process.env.OPENAI_API_KEY?.trim()
  const cronSecretConfigured = !!process.env.CRON_SECRET?.trim()
  const cronAuditUserConfigured = !!process.env.CRON_AUDIT_USER_ID?.trim()

  const { data: refRows, error } = await admin
    .from('reference_options')
    .select('kind')
    .in('kind', ['market_category', 'geography'])

  const list = refRows || []
  const referenceMarketCategories = list.filter((r) => r.kind === 'market_category').length
  const referenceGeographies = list.filter((r) => r.kind === 'geography').length

  const readyForScheduledRun =
    !error &&
    openaiApiKeyConfigured &&
    cronSecretConfigured &&
    referenceMarketCategories > 0 &&
    referenceGeographies > 0

  return {
    openaiApiKeyConfigured,
    cronSecretConfigured,
    cronAuditUserConfigured,
    referenceMarketCategories,
    referenceGeographies,
    readyForScheduledRun,
  }
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

export type OneScheduledResult =
  | { ok: true; id: string; title: string; marketCategory: string; documentType: string; geography: string }
  | { ok: false; error: string }

/** Generate and insert one scheduled library document (random category / type / geography). */
export async function runOneScheduledLibraryDocument(
  admin: SupabaseClient,
  dateSuffix: string
): Promise<OneScheduledResult> {
  const { data: refRows, error: refErr } = await admin
    .from('reference_options')
    .select('kind, value, label')
    .in('kind', ['market_category', 'geography'])

  if (refErr) {
    return { ok: false, error: refErr.message }
  }

  const categories = (refRows || []).filter((r) => r.kind === 'market_category')
  const geos = (refRows || []).filter((r) => r.kind === 'geography')
  const cat = pickRandom(categories)
  const geo = pickRandom(geos)
  if (!cat || !geo) {
    return { ok: false, error: 'Missing reference_options for market_category or geography' }
  }

  const types = documentTypesForMarketCategory(cat.value)
  const docType = pickRandom(types)
  if (!docType) {
    return { ok: false, error: 'No document types for category' }
  }

  const genInput = {
    marketCategoryValue: cat.value,
    marketCategoryLabel: cat.label,
    documentTypeId: docType.id,
    geographyValue: geo.value,
    geographyLabel: geo.label,
  }

  const { text, error: synErr } = await synthesizeLibraryDocument(genInput)
  if (synErr || !text) {
    return { ok: false, error: synErr || 'Generation failed' }
  }

  const title = buildLibraryDocumentTitle(genInput, dateSuffix)
  const preview = previewFromBody(text)

  const inserted = await insertGeneratedLibraryRow(admin, {
    title,
    fullContent: text,
    preview,
    marketCategoryValue: cat.value,
    geographyValue: geo.value,
    source: 'scheduled',
    createdByUserId: null,
  })

  if ('error' in inserted) {
    return { ok: false, error: inserted.error }
  }

  const auditActor = process.env.CRON_AUDIT_USER_ID
  if (auditActor) {
    await recordAuditEvent(admin, {
      actorUserId: auditActor,
      action: 'library.document_generated_scheduled',
      entityType: 'library_document',
      entityId: inserted.id,
      metadata: {
        marketCategory: cat.value,
        documentType: docType.id,
        geography: geo.value,
      },
    })
  }

  return {
    ok: true,
    id: inserted.id,
    title,
    marketCategory: cat.value,
    documentType: docType.id,
    geography: geo.value,
  }
}
