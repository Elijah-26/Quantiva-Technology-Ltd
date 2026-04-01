// Report types and HTML parsing helpers. Persistence is via /api/reports (Supabase).

export interface Report {
  id: string
  title: string
  category: string
  subNiche: string
  geography: string
  email: string
  dateGenerated: string
  type: 'On-demand' | 'Recurring'
  webReport: string
  emailReport: string
  sections: {
    overview: string
    trends: string
    competitors: string
    insights: string
  }
}

export function parseReportSections(htmlContent: string): Report['sections'] {
  const sections = {
    overview: '',
    trends: '',
    competitors: '',
    insights: '',
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  const allElements = Array.from(tempDiv.children)

  const overviewKeywords = [
    'market overview',
    'market size',
    'growth outlook',
    'market segmentation',
    'introduction',
  ]
  const trendsKeywords = ['trends', 'key trends', 'emerging', 'developments', 'shaping the market']
  const competitorsKeywords = [
    'competitive',
    'competitors',
    'competitive landscape',
    'market leaders',
    'key players',
  ]
  const insightsKeywords = [
    'insights',
    'recommendations',
    'strategic',
    'opportunities',
    'outlook',
    'forward-looking',
  ]

  let currentSection = ''
  let currentContent: string[] = []

  allElements.forEach((element) => {
    const text = element.textContent?.toLowerCase() || ''

    if (element.tagName.match(/H[1-3]/)) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] += currentContent.join('')
      }

      if (overviewKeywords.some((keyword) => text.includes(keyword))) {
        currentSection = 'overview'
        currentContent = [element.outerHTML]
      } else if (trendsKeywords.some((keyword) => text.includes(keyword))) {
        currentSection = 'trends'
        currentContent = [element.outerHTML]
      } else if (competitorsKeywords.some((keyword) => text.includes(keyword))) {
        currentSection = 'competitors'
        currentContent = [element.outerHTML]
      } else if (insightsKeywords.some((keyword) => text.includes(keyword))) {
        currentSection = 'insights'
        currentContent = [element.outerHTML]
      } else if (currentSection) {
        currentContent.push(element.outerHTML)
      } else {
        currentSection = 'overview'
        currentContent = [element.outerHTML]
      }
    } else if (currentSection) {
      currentContent.push(element.outerHTML)
    }
  })

  if (currentSection && currentContent.length > 0) {
    sections[currentSection as keyof typeof sections] += currentContent.join('')
  }

  Object.keys(sections).forEach((key) => {
    if (!sections[key as keyof typeof sections]) {
      sections[key as keyof typeof sections] =
        `<p class="text-gray-500 italic">No specific ${key} information available in this report.</p>`
    }
  })

  return sections
}

export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function createReportFromWebhook(webhookData: unknown, formData: Record<string, unknown>): Report {
  const reportData = Array.isArray(webhookData) ? webhookData[0] : webhookData
  const rd = reportData as Record<string, string>
  const webReport = rd.webReport || ''
  const sections = parseReportSections(webReport)
  const fd = formData as {
    marketCategory?: string
    subNiche?: string
    geography?: string
    email?: string
    researchType?: string
  }

  return {
    id: generateReportId(),
    title: `${fd.marketCategory ?? ''} - ${fd.subNiche ?? ''}`,
    category: fd.marketCategory ?? '',
    subNiche: fd.subNiche ?? '',
    geography: fd.geography || 'Global',
    email: fd.email ?? '',
    dateGenerated: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    type: fd.researchType === 'on-demand' ? 'On-demand' : 'Recurring',
    webReport,
    emailReport: rd.emailReport || '',
    sections,
  }
}
