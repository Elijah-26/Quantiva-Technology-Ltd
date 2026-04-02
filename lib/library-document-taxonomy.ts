/** Document types allowed per market_category (reference_options.value). */

export type DocTypeOption = { id: string; label: string }

const DEFAULT_TYPES: DocTypeOption[] = [
  { id: 'privacy_policy', label: 'Privacy Policy' },
  { id: 'terms_of_service', label: 'Terms of Service' },
  { id: 'dpa', label: 'Data Processing Agreement' },
  { id: 'cookie_policy', label: 'Cookie Policy' },
  { id: 'acceptable_use', label: 'Acceptable Use Policy' },
]

const BY_CATEGORY: Record<string, DocTypeOption[]> = {
  'technology-software': [
    { id: 'privacy_policy', label: 'Privacy Policy' },
    { id: 'saas_terms', label: 'SaaS Terms of Service' },
    { id: 'dpa', label: 'Data Processing Agreement' },
    { id: 'sla', label: 'Service Level Agreement (outline)' },
  ],
  'healthcare-pharma': [
    { id: 'privacy_policy', label: 'Privacy Policy' },
    { id: 'hipaa_notice', label: 'HIPAA Privacy Notice (draft)' },
    { id: 'baa', label: 'Business Associate Agreement (outline)' },
  ],
  'financial-services': [
    { id: 'privacy_policy', label: 'Privacy Policy' },
    { id: 'risk_disclosure', label: 'Risk Disclosure Statement' },
    { id: 'terms_of_service', label: 'Terms of Service' },
  ],
  'ecommerce-retail': [
    { id: 'privacy_policy', label: 'Privacy Policy' },
    { id: 'terms_of_service', label: 'Terms of Sale / Terms of Service' },
    { id: 'returns_policy', label: 'Returns & Refunds Policy' },
  ],
  manufacturing: [
    { id: 'health_safety', label: 'Workplace Health & Safety Policy (outline)' },
    { id: 'supplier_code', label: 'Supplier Code of Conduct (outline)' },
  ],
  education: [
    { id: 'privacy_policy', label: 'Privacy Policy (students / LMS)' },
    { id: 'acceptable_use', label: 'Acceptable Use (IT)' },
  ],
}

export function documentTypesForMarketCategory(marketCategoryValue: string): DocTypeOption[] {
  return BY_CATEGORY[marketCategoryValue] ?? DEFAULT_TYPES
}

export function isDocTypeAllowedForCategory(marketCategoryValue: string, documentTypeId: string): boolean {
  return documentTypesForMarketCategory(marketCategoryValue).some((t) => t.id === documentTypeId)
}

export function docTypeLabel(marketCategoryValue: string, documentTypeId: string): string {
  const t = documentTypesForMarketCategory(marketCategoryValue).find((x) => x.id === documentTypeId)
  return t?.label ?? documentTypeId
}
