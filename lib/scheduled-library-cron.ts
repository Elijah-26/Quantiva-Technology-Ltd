import type { SupabaseClient } from '@supabase/supabase-js'
import { documentTypesForMarketCategory } from '@/lib/library-document-taxonomy'
import {
  synthesizeLibraryDocument,
  buildLibraryDocumentTitle,
  insertGeneratedLibraryRow,
  previewFromBody,
} from '@/lib/library-document-generation'
import { recordAuditEvent } from '@/lib/audit'
import {
  buildLegacyApiFields,
  INDUSTRY_OPTIONS,
  JURISDICTION_OPTIONS,
  type OnDemandDocId,
} from '@/lib/on-demand-generation/wizard-flows'
import { synthesizeOnDemandDocument, WIZARD_DOC_LABELS } from '@/lib/on-demand-generation/synthesize-server'
import { buildSyntheticWizardContext, pickRandomOnDemandType } from '@/lib/scheduled-generation/synthetic-context'
import { synthesizeAcademicSingleShot } from '@/lib/scheduled-generation/academic-single-shot'
import { synthesizeHybridScheduled } from '@/lib/scheduled-generation/hybrid-shot'
import { fetchRandomCustomSeed } from '@/lib/custom-generation-seeds'
import { ACADEMIC_TEMPLATE_TYPES, type AcademicTemplateType } from '@/lib/academic-research/types'

const CONFIG_KEY = 'scheduled_library'

export type DocumentsPerDaySource = 'database' | 'environment' | 'default'

export type ScheduledPipeline =
  | 'library_taxonomy'
  | 'on_demand_synthetic'
  | 'academic_single_shot'
  | 'hybrid'

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

function pickRandom<T>(arr: readonly T[]): T | undefined {
  if (!arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickPipeline(): ScheduledPipeline {
  const r = Math.random() * 100
  if (r < 35) return 'library_taxonomy'
  if (r < 75) return 'on_demand_synthetic'
  if (r < 93) return 'academic_single_shot'
  return 'hybrid'
}

function industryLabel(value: string): string {
  return INDUSTRY_OPTIONS.find((o) => o.value === value)?.label || value
}

function jurisdictionLabel(value: string): string {
  return JURISDICTION_OPTIONS.find((o) => o.value === value)?.label || value
}

function baseMetadata(
  pipeline: ScheduledPipeline,
  dateSuffix: string,
  indexInBatch: number
): Record<string, unknown> {
  return {
    pipeline,
    runBatchDate: dateSuffix,
    indexInBatch,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  }
}

export type OneScheduledResult =
  | { ok: true; id: string; title: string; marketCategory: string; documentType: string; geography: string }
  | { ok: false; error: string }

/** Generate and insert one scheduled library document using a weighted mix of pipelines. */
export async function runOneScheduledLibraryDocument(
  admin: SupabaseClient,
  dateSuffix: string,
  indexInBatch = 0
): Promise<OneScheduledResult> {
  const pipeline = pickPipeline()

  if (pipeline === 'library_taxonomy') {
    return runLibraryTaxonomyPipeline(admin, dateSuffix, indexInBatch)
  }
  if (pipeline === 'on_demand_synthetic') {
    return runOnDemandSyntheticPipeline(admin, dateSuffix, indexInBatch)
  }
  if (pipeline === 'academic_single_shot') {
    return runAcademicSingleShotPipeline(admin, dateSuffix, indexInBatch)
  }
  return runHybridPipeline(admin, dateSuffix, indexInBatch)
}

async function runLibraryTaxonomyPipeline(
  admin: SupabaseClient,
  dateSuffix: string,
  indexInBatch: number
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
  const generationMetadata = {
    ...baseMetadata('library_taxonomy', dateSuffix, indexInBatch),
    libraryCategory: cat.value,
    libraryCategoryLabel: cat.label,
    libraryDocType: docType.id,
    geography: geo.value,
    geographyLabel: geo.label,
  }

  const inserted = await insertGeneratedLibraryRow(admin, {
    title,
    fullContent: text,
    preview,
    marketCategoryValue: cat.value,
    geographyValue: geo.value,
    source: 'scheduled',
    createdByUserId: null,
    generationMetadata,
  })

  if ('error' in inserted) {
    return { ok: false, error: inserted.error }
  }

  await auditScheduled(admin, inserted.id, {
    marketCategory: cat.value,
    documentType: docType.id,
    geography: geo.value,
    pipeline: 'library_taxonomy',
  })

  return {
    ok: true,
    id: inserted.id,
    title,
    marketCategory: cat.value,
    documentType: docType.id,
    geography: geo.value,
  }
}

async function runOnDemandSyntheticPipeline(
  admin: SupabaseClient,
  dateSuffix: string,
  indexInBatch: number
): Promise<OneScheduledResult> {
  const useSeed = Math.random() < 0.45
  const seedRow = useSeed ? await fetchRandomCustomSeed(admin) : null
  const seed = seedRow?.wizard_context || null

  let docId: OnDemandDocId = pickRandomOnDemandType()
  if (docId === 'custom' && !seed) {
    docId = 'privacy'
  }

  const wizardContext = buildSyntheticWizardContext(docId, { seed })
  const legacy = buildLegacyApiFields(docId, wizardContext)

  const result = await synthesizeOnDemandDocument(
    { documentType: docId, wizardContext, legacy },
    { skipWebResearch: true }
  )

  if (result.error || !result.text) {
    return { ok: false, error: result.error || 'On-demand synthetic generation failed' }
  }

  const docLabel = WIZARD_DOC_LABELS[docId] || docId
  const title = `${docLabel} — ${legacy.companyName} (${dateSuffix})`
  const preview = previewFromBody(result.text)
  const generationMetadata = {
    ...baseMetadata('on_demand_synthetic', dateSuffix, indexInBatch),
    onDemandType: docId,
    wizardContext,
    legacyCompanyName: legacy.companyName,
    customSeedId: seedRow?.id ?? null,
  }

  const inserted = await insertGeneratedLibraryRow(admin, {
    title,
    fullContent: result.text,
    preview,
    marketCategoryValue: docId,
    geographyValue: legacy.jurisdiction,
    source: 'scheduled',
    createdByUserId: null,
    description: `Scheduled synthetic on-demand–style draft (${docId}).`,
    generationMetadata,
  })

  if ('error' in inserted) {
    return { ok: false, error: inserted.error }
  }

  await auditScheduled(admin, inserted.id, {
    documentType: docId,
    geography: legacy.jurisdiction,
    pipeline: 'on_demand_synthetic',
    seedId: seedRow?.id,
  })

  return {
    ok: true,
    id: inserted.id,
    title,
    marketCategory: docId,
    documentType: docId,
    geography: legacy.jurisdiction,
  }
}

async function runAcademicSingleShotPipeline(
  admin: SupabaseClient,
  dateSuffix: string,
  indexInBatch: number
): Promise<OneScheduledResult> {
  const templateType = pickRandom([...ACADEMIC_TEMPLATE_TYPES]) as AcademicTemplateType
  const seedRow = Math.random() < 0.35 ? await fetchRandomCustomSeed(admin) : null
  const seedSnippet = seedRow ? JSON.stringify(seedRow.wizard_context, null, 2).slice(0, 1500) : undefined

  const result = await synthesizeAcademicSingleShot({ templateType, seedSnippet })
  if (result.error || !result.text) {
    return { ok: false, error: result.error || 'Academic single-shot failed' }
  }

  const title = `Academic-style ${templateType.replace(/_/g, ' ')} — ${dateSuffix}`
  const preview = previewFromBody(result.text)
  const generationMetadata = {
    ...baseMetadata('academic_single_shot', dateSuffix, indexInBatch),
    academicTemplate: templateType,
    customSeedId: seedRow?.id ?? null,
  }

  const inserted = await insertGeneratedLibraryRow(admin, {
    title,
    fullContent: result.text,
    preview,
    marketCategoryValue: `academic:${templateType}`,
    geographyValue: 'global',
    source: 'scheduled',
    createdByUserId: null,
    description: `Scheduled single-shot academic-style draft (${templateType}).`,
    generationMetadata,
  })

  if ('error' in inserted) {
    return { ok: false, error: inserted.error }
  }

  await auditScheduled(admin, inserted.id, {
    documentType: templateType,
    geography: 'global',
    pipeline: 'academic_single_shot',
    seedId: seedRow?.id,
  })

  return {
    ok: true,
    id: inserted.id,
    title,
    marketCategory: `academic:${templateType}`,
    documentType: templateType,
    geography: 'global',
  }
}

async function runHybridPipeline(
  admin: SupabaseClient,
  dateSuffix: string,
  indexInBatch: number
): Promise<OneScheduledResult> {
  const onDemandLabel = pickRandom([
    WIZARD_DOC_LABELS.privacy,
    WIZARD_DOC_LABELS.terms,
    WIZARD_DOC_LABELS.hr,
    WIZARD_DOC_LABELS.compliance,
    WIZARD_DOC_LABELS.custom,
  ])!
  const templateType = pickRandom([...ACADEMIC_TEMPLATE_TYPES]) as AcademicTemplateType
  const industry = pickRandom(INDUSTRY_OPTIONS)!.value
  const jurisdiction = pickRandom(JURISDICTION_OPTIONS)!.value
  const seedRow = Math.random() < 0.4 ? await fetchRandomCustomSeed(admin) : null
  const seedSnippet = seedRow ? JSON.stringify(seedRow.wizard_context, null, 2).slice(0, 2000) : undefined

  const result = await synthesizeHybridScheduled({
    onDemandLabel,
    academicTemplate: templateType,
    industry: industryLabel(industry),
    jurisdictionLabel: jurisdictionLabel(jurisdiction),
    seedSnippet,
  })

  if (result.error || !result.text) {
    return { ok: false, error: result.error || 'Hybrid generation failed' }
  }

  const title = `Hybrid ${onDemandLabel.slice(0, 40)} / ${templateType} — ${dateSuffix}`
  const preview = previewFromBody(result.text)
  const generationMetadata = {
    ...baseMetadata('hybrid', dateSuffix, indexInBatch),
    hybridOnDemandLabel: onDemandLabel,
    academicTemplate: templateType,
    industry,
    jurisdiction,
    customSeedId: seedRow?.id ?? null,
  }

  const inserted = await insertGeneratedLibraryRow(admin, {
    title,
    fullContent: result.text,
    preview,
    marketCategoryValue: 'hybrid',
    geographyValue: jurisdiction,
    source: 'scheduled',
    createdByUserId: null,
    description: `Scheduled hybrid draft combining ${onDemandLabel} themes with ${templateType} structure.`,
    generationMetadata,
  })

  if ('error' in inserted) {
    return { ok: false, error: inserted.error }
  }

  await auditScheduled(admin, inserted.id, {
    documentType: 'hybrid',
    geography: jurisdiction,
    pipeline: 'hybrid',
    seedId: seedRow?.id,
  })

  return {
    ok: true,
    id: inserted.id,
    title,
    marketCategory: 'hybrid',
    documentType: 'hybrid',
    geography: jurisdiction,
  }
}

async function auditScheduled(
  admin: SupabaseClient,
  entityId: string,
  metadata: Record<string, unknown>
) {
  const auditActor = process.env.CRON_AUDIT_USER_ID
  if (!auditActor) return
  await recordAuditEvent(admin, {
    actorUserId: auditActor,
    action: 'library.document_generated_scheduled',
    entityType: 'library_document',
    entityId,
    metadata,
  })
}
