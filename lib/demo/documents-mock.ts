export type DemoLibraryDocument = {
  id: number
  title: string
  description: string
  category: string
  jurisdiction: string
  accessLevel: string
  wordCount: number
  downloadCount: number
  rating: number
  isFavorite: boolean
  lastUpdated: string
  preview: string
  readMinutes: number
  complexity: 'Low' | 'Moderate' | 'High'
  versions: { version: string; date: string; note: string }[]
  relatedIds: number[]
}

export const DEMO_LIBRARY_DOCUMENTS: DemoLibraryDocument[] = [
  {
    id: 1,
    title: 'GDPR Privacy Policy Template',
    description: 'Comprehensive privacy policy compliant with GDPR regulations',
    category: 'privacy',
    jurisdiction: 'eu',
    accessLevel: 'free',
    wordCount: 2500,
    downloadCount: 12543,
    rating: 4.8,
    isFavorite: false,
    lastUpdated: '2024-03-15',
    preview:
      'This Privacy Policy describes how [Company Name] collects, uses, and protects personal data in accordance with the General Data Protection Regulation (GDPR). We are committed to ensuring the security and confidentiality of your information...',
    readMinutes: 12,
    complexity: 'Moderate',
    versions: [
      { version: '2.1', date: '2024-03-15', note: 'Cookie section updated' },
      { version: '2.0', date: '2024-01-10', note: 'DPA references' },
      { version: '1.0', date: '2023-06-01', note: 'Initial release' },
    ],
    relatedIds: [5, 2],
  },
  {
    id: 2,
    title: 'Employment Contract Template',
    description: 'Standard employment contract with customizable clauses',
    category: 'hr',
    jurisdiction: 'uk',
    accessLevel: 'pro',
    wordCount: 3200,
    downloadCount: 8932,
    rating: 4.7,
    isFavorite: true,
    lastUpdated: '2024-03-10',
    preview:
      'EMPLOYMENT AGREEMENT\n\nThis agreement is made between [Employer] and [Employee] on [Date]. The Employee agrees to perform duties as [Job Title] subject to the terms set out below...',
    readMinutes: 15,
    complexity: 'High',
    versions: [
      { version: '1.4', date: '2024-03-10', note: 'IR35 clause optional block' },
      { version: '1.3', date: '2023-11-20', note: 'Probation period update' },
    ],
    relatedIds: [3, 4],
  },
  {
    id: 3,
    title: 'Non-Disclosure Agreement',
    description: 'Mutual NDA template for business partnerships',
    category: 'contracts',
    jurisdiction: 'us',
    accessLevel: 'free',
    wordCount: 1800,
    downloadCount: 15678,
    rating: 4.9,
    isFavorite: false,
    lastUpdated: '2024-03-12',
    preview:
      'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThe parties wish to explore a business relationship and may disclose confidential information. Each party agrees to hold the other\'s confidential information in strict confidence...',
    readMinutes: 8,
    complexity: 'Low',
    versions: [{ version: '1.2', date: '2024-03-12', note: 'Mutual reciprocity clarified' }],
    relatedIds: [2, 6],
  },
  {
    id: 4,
    title: 'Terms of Service - SaaS',
    description: 'Terms of service specifically for SaaS businesses',
    category: 'corporate',
    jurisdiction: 'us',
    accessLevel: 'pro',
    wordCount: 4500,
    downloadCount: 7234,
    rating: 4.6,
    isFavorite: true,
    lastUpdated: '2024-03-08',
    preview:
      'TERMS OF SERVICE\n\nBy accessing or using our software-as-a-service platform, you agree to be bound by these Terms. We grant you a limited, non-exclusive license to use the Service during your subscription period...',
    readMinutes: 18,
    complexity: 'High',
    versions: [
      { version: '3.0', date: '2024-03-08', note: 'AI feature addendum' },
      { version: '2.5', date: '2023-09-01', note: 'SLA section' },
    ],
    relatedIds: [1, 5],
  },
  {
    id: 5,
    title: 'Cookie Policy Template',
    description: 'Cookie consent policy compliant with ePrivacy Directive',
    category: 'privacy',
    jurisdiction: 'eu',
    accessLevel: 'free',
    wordCount: 1200,
    downloadCount: 9876,
    rating: 4.5,
    isFavorite: false,
    lastUpdated: '2024-03-14',
    preview:
      'COOKIE POLICY\n\nWe use cookies and similar technologies to improve your experience, analyse traffic, and personalise content. You can manage preferences via our cookie banner or browser settings...',
    readMinutes: 6,
    complexity: 'Low',
    versions: [{ version: '1.1', date: '2024-03-14', note: 'CMP categories aligned' }],
    relatedIds: [1, 4],
  },
  {
    id: 6,
    title: 'Software License Agreement',
    description: 'End-user license agreement for software products',
    category: 'ip',
    jurisdiction: 'us',
    accessLevel: 'business',
    wordCount: 3800,
    downloadCount: 5432,
    rating: 4.7,
    isFavorite: false,
    lastUpdated: '2024-03-05',
    preview:
      'END USER LICENSE AGREEMENT (EULA)\n\nSubject to payment of applicable fees, Licensor grants Licensee a non-transferable license to use the Software in object code form, solely for internal business purposes...',
    readMinutes: 14,
    complexity: 'Moderate',
    versions: [
      { version: '2.2', date: '2024-03-05', note: 'SaaS vs on-prem variants' },
    ],
    relatedIds: [3, 4],
  },
]

export function getDemoLibraryDocumentById(
  id: string | number
): DemoLibraryDocument | undefined {
  const n = typeof id === 'string' ? parseInt(id, 10) : id
  if (Number.isNaN(n)) return undefined
  return DEMO_LIBRARY_DOCUMENTS.find((d) => d.id === n)
}
