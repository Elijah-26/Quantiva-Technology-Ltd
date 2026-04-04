export interface User {
  id: string
  email: string
  emailVerified: boolean
  role: "user" | "admin" | "super_admin"
  status: "active" | "suspended" | "deleted"
  onboardingCompleted: boolean
  onboardingStep: number
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  displayName?: string
  phone?: string
  avatarUrl?: string
  jobTitle?: string
  department?: string
  timezone: string
  language: string
}

export interface BusinessProfile {
  id: string
  userId: string
  companyName?: string
  companySize?: string
  businessStage?: string
  employeeCount?: number
  companyWebsite?: string
  companyDescription?: string
  primaryIndustryId?: string
  primarySubindustryId?: string
  nicheSpecialization?: string
  primaryJurisdictionId?: string
  additionalJurisdictions: string[]
  businessGoals: string[]
  complianceFocusAreas: string[]
  templatePreferences: string[]
  researchInterest: boolean
}

export interface Industry {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
  sortOrder: number
  isActive: boolean
  documentCount: number
  subindustries: Subindustry[]
}

export interface Subindustry {
  id: string
  industryId: string
  slug: string
  name: string
  description?: string
  sortOrder: number
  isActive: boolean
  documentCount: number
  niches: Niche[]
}

export interface Niche {
  id: string
  subindustryId: string
  name: string
  description?: string
  isActive: boolean
}

export interface Jurisdiction {
  id: string
  code: string
  name: string
  countryCode?: string
  region?: string
  description?: string
  regulatoryBodies: string[]
  isActive: boolean
  documentCount: number
}

export interface Document {
  id: string
  slug: string
  title: string
  description?: string
  shortDescription?: string
  content?: string
  documentType: string
  category?: string
  accessLevel: "free" | "pro" | "business" | "premium"
  isPublished: boolean
  publishedAt?: Date
  version: number
  wordCount?: number
  estimatedReadTime?: number
  complexityLevel?: string
  viewCount: number
  downloadCount: number
  generationCount: number
  favoriteCount: number
  reviewStatus: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
  industries: DocumentIndustry[]
  subindustries: DocumentSubindustry[]
  jurisdictions: DocumentJurisdiction[]
  tags: DocumentTag[]
}

export interface DocumentIndustry {
  id: string
  documentId: string
  industryId: string
  isPrimary: boolean
  industry: Industry
}

export interface DocumentSubindustry {
  id: string
  documentId: string
  subindustryId: string
  subindustry: Subindustry
}

export interface DocumentJurisdiction {
  id: string
  documentId: string
  jurisdictionId: string
  isPrimary: boolean
  jurisdiction: Jurisdiction
}

export interface Tag {
  id: string
  slug: string
  name: string
  description?: string
  category?: string
  color?: string
  documentCount: number
}

export interface DocumentTag {
  id: string
  documentId: string
  tagId: string
  confidenceScore?: number
  tag: Tag
}

export interface GeneratedDocument {
  id: string
  userId: string
  templateDocumentId: string
  generationJobId?: string
  title?: string
  content: string
  generationParameters?: Record<string, unknown>
  status: "draft" | "saved" | "deleted"
  editCount: number
  downloadCount: number
  createdAt: Date
  updatedAt: Date
  lastEditedAt?: Date
  templateDocument: Document
}

export interface SavedDocument {
  id: string
  userId: string
  generatedDocumentId: string
  folderId?: string
  customTitle?: string
  customTags: string[]
  notes?: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  generatedDocument: GeneratedDocument
}

export interface WorkspaceFolder {
  id: string
  userId: string
  parentId?: string
  name: string
  description?: string
  color?: string
  icon?: string
  sortOrder: number
  documentCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Plan {
  id: string
  slug: string
  name: string
  description?: string
  priceMonthly: number
  priceAnnual: number
  currency: string
  features: PlanFeatures
  downloadsPerMonth?: number
  aiGenerationsPerMonth?: number
  documentsAccessLevel: string
  storageLimitMb?: number
  isActive: boolean
  isPublic: boolean
  sortOrder: number
}

export interface PlanFeatures {
  description: string
  features: string[]
  highlighted?: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "cancelled" | "past_due"
  billingCycle: "monthly" | "annual"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart?: Date
  trialEnd?: Date
  cancelledAt?: Date
  cancellationReason?: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  downloadsUsedThisPeriod: number
  aiGenerationsUsedThisPeriod: number
  plan: Plan
}

export interface GenerationJob {
  id: string
  jobType: string
  status: "queued" | "processing" | "completed" | "failed"
  templateDocumentId?: string
  userId?: string
  parameters: Record<string, unknown>
  outputDocumentId?: string
  outputContent?: string
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  errorMessage?: string
  retryCount: number
  modelUsed?: string
  tokensUsed?: number
  costEstimate?: number
  qualityScore?: number
  confidenceScore?: number
  createdAt: Date
  updatedAt: Date
}

export interface ResearchTemplate {
  id: string
  documentId?: string
  name: string
  description?: string
  templateType: string
  applicableLevels: string[]
  applicableFields: string[]
  structure: ResearchTemplateStructure
  accessLevel: string
}

export interface ResearchTemplateStructure {
  sections: ResearchTemplateSection[]
}

export interface ResearchTemplateSection {
  id: string
  title: string
  description?: string
  required: boolean
  order: number
}

export interface ResearchPaper {
  id: string
  userId: string
  templateId?: string
  title?: string
  abstract?: string
  fieldId?: string
  educationLevel?: string
  institution?: string
  content?: string
  outline?: Record<string, unknown>
  status: "draft" | "in_progress" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message?: string
  actionUrl?: string
  actionText?: string
  isRead: boolean
  readAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface SearchFilters {
  industries?: string[]
  subindustries?: string[]
  jurisdictions?: string[]
  documentTypes?: string[]
  accessLevels?: string[]
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface SearchResult {
  documents: Document[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}
