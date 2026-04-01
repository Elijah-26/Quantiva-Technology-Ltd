/** JSON shape for GET /api/dashboard/summary — shared by route and dashboard UI */

export type DashboardActivityKind = 'workspace' | 'report' | 'generation'

export interface DashboardActivityItem {
  id: string
  kind: DashboardActivityKind
  title: string
  subtitle: string
  status: string
  at: string
  /** Present when kind === 'report'; use for /dashboard/reports/[executionId] */
  reportExecutionId?: string
}

export interface DashboardSummaryResponse {
  greetingName: string
  planLabel: string
  stats: {
    libraryTemplates: number
    workspaceItems: number
    aiGenerationsCompleted: number
    researchReports: number
  }
  recentActivity: DashboardActivityItem[]
  recommendedTemplates: {
    id: string
    title: string
    category: string
    rating: number
  }[]
  usage: {
    reportsUsedThisMonth: number
    reportsLimit: number
    generationsUsedThisMonth: number
    generationsLimit: number
  }
}
