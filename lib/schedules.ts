// Schedule management utilities for recurring research

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

// Calculate next run date based on frequency
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
    case 'monthly':
      return new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  }
}

// Save schedule to localStorage
export function saveSchedule(schedule: Schedule): void {
  const schedules = getSchedules()
  schedules.unshift(schedule) // Add to beginning
  localStorage.setItem('market_research_schedules', JSON.stringify(schedules))
}

// Get all schedules
export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('market_research_schedules')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

// Get single schedule by ID
export function getSchedule(id: string): Schedule | null {
  const schedules = getSchedules()
  return schedules.find(s => s.id === id) || null
}

// Update schedule
export function updateSchedule(id: string, updates: Partial<Schedule>): void {
  const schedules = getSchedules()
  const index = schedules.findIndex(s => s.id === id)
  
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates }
    localStorage.setItem('market_research_schedules', JSON.stringify(schedules))
  }
}

// Delete schedule
export function deleteSchedule(id: string): void {
  const schedules = getSchedules()
  const filtered = schedules.filter(s => s.id !== id)
  localStorage.setItem('market_research_schedules', JSON.stringify(filtered))
}

// Toggle schedule active status
export function toggleScheduleActive(id: string): void {
  const schedules = getSchedules()
  const schedule = schedules.find(s => s.id === id)
  
  if (schedule) {
    schedule.active = !schedule.active
    localStorage.setItem('market_research_schedules', JSON.stringify(schedules))
  }
}

// Get active schedules count
export function getActiveSchedulesCount(): number {
  return getSchedules().filter(s => s.active).length
}

// Get schedules that are due to run
export function getDueSchedules(): Schedule[] {
  const schedules = getSchedules()
  const now = new Date()
  
  return schedules.filter(schedule => {
    if (!schedule.active) return false
    
    const nextRun = new Date(schedule.nextRun)
    return nextRun <= now
  })
}

// Update schedule last run and calculate next run
export function updateScheduleLastRun(id: string): void {
  const schedule = getSchedule(id)
  
  if (schedule) {
    const now = new Date()
    const nextRun = calculateNextRun(now, schedule.frequency)
    
    updateSchedule(id, {
      lastRun: now.toISOString(),
      nextRun: nextRun.toISOString()
    })
  }
}

// Generate unique ID
export function generateScheduleId(): string {
  return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create schedule from form data
export function createScheduleFromForm(formData: any): Schedule {
  const now = new Date()
  const nextRun = calculateNextRun(now, formData.frequency)
  
  return {
    id: generateScheduleId(),
    title: `${formData.marketCategory} - ${formData.subNiche}`,
    marketCategory: formData.marketCategory,
    subNiche: formData.subNiche,
    geography: formData.geography || 'Global',
    email: formData.email,
    frequency: formData.frequency,
    notes: formData.notes || '',
    active: true,
    createdAt: now.toISOString(),
    lastRun: null,
    nextRun: nextRun.toISOString(),
    parameters: {
      marketCategory: formData.marketCategory,
      subNiche: formData.subNiche,
      geography: formData.geography || 'Global',
      email: formData.email,
      notes: formData.notes || ''
    }
  }
}

// Clear all schedules (useful for testing/reset)
export function clearAllSchedules(): void {
  localStorage.removeItem('market_research_schedules')
}

// Format frequency for display
export function formatFrequency(frequency: Schedule['frequency']): string {
  const map = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly'
  }
  return map[frequency] || frequency
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

