export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'

export type ModerationItem = {
  id: string
  title: string
  submittedBy: string
  status: ModerationStatus
  submittedAt: string
  snippet: string
  category: string
}

export const DEMO_MODERATION_SEED: ModerationItem[] = [
  {
    id: 'mod-101',
    title: 'Client suitability statement — draft',
    submittedBy: 'jane@example.com',
    status: 'pending',
    submittedAt: '2026-03-27T09:00:00Z',
    snippet:
      'We believe this product is suitable for all retail investors seeking growth...',
    category: 'Compliance',
  },
  {
    id: 'mod-102',
    title: 'LinkedIn post — Q1 outlook',
    submittedBy: 'marketing@example.com',
    status: 'pending',
    submittedAt: '2026-03-26T15:30:00Z',
    snippet: 'Guaranteed upside in volatile markets — act now...',
    category: 'Marketing',
  },
  {
    id: 'mod-103',
    title: 'Newsletter — tax wrapper promo',
    submittedBy: 'newsletter@example.com',
    status: 'pending',
    submittedAt: '2026-03-25T11:12:00Z',
    snippet: 'HMRC-approved structure with zero risk to capital...',
    category: 'Communications',
  },
]

const STORAGE_KEY = 'demo-moderation-queue-v1'

export function loadModerationQueue(): ModerationItem[] {
  if (typeof window === 'undefined') return DEMO_MODERATION_SEED
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEMO_MODERATION_SEED]
    const parsed = JSON.parse(raw) as ModerationItem[]
    return Array.isArray(parsed) ? parsed : [...DEMO_MODERATION_SEED]
  } catch {
    return [...DEMO_MODERATION_SEED]
  }
}

export function saveModerationQueue(items: ModerationItem[]) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getModerationById(id: string): ModerationItem | undefined {
  return loadModerationQueue().find((i) => i.id === id)
}

export function updateModerationItem(
  id: string,
  patch: Partial<Pick<ModerationItem, 'status'>>
) {
  const q = loadModerationQueue()
  const next = q.map((i) => (i.id === id ? { ...i, ...patch } : i))
  saveModerationQueue(next)
}
