// Schedule utilities (recurring research). Persistence is via POST /api/schedules and Supabase.

export interface Schedule {
  id: string
  title: string
  marketCategory: string
  subNiche: string
  geography: string
  email: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  notes: string
  active: boolean
  createdAt: string
  lastRun: string | null
  nextRun: string
  parameters: {
    marketCategory: string
    subNiche: string
    geography: string
    email: string
    notes: string
  }
}

export function calculateNextRun(lastRun: Date | null, frequency: Schedule['frequency']): Date {
  const now = new Date()
  const baseDate = lastRun || now

  switch (frequency) {
    case 'daily':
      return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
    case 'weekly':
      return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'biweekly':
      return new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000)
    case 'monthly': {
      const d = new Date(baseDate)
      d.setMonth(d.getMonth() + 1)
      return d
    }
    default:
      return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

export function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function formatFrequency(frequency: Schedule['frequency']): string {
  const map = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  }
  return map[frequency] || frequency
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
