// Report storage and management utilities

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

// Parse HTML content and intelligently section it
export function parseReportSections(htmlContent: string): Report['sections'] {
  const sections = {
    overview: '',
    trends: '',
    competitors: '',
    insights: ''
  }

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // Get all headings and content
  const allElements = Array.from(tempDiv.children)
  
  // Keywords for each section
  const overviewKeywords = ['market overview', 'market size', 'growth outlook', 'market segmentation', 'introduction']
  const trendsKeywords = ['trends', 'key trends', 'emerging', 'developments', 'shaping the market']
  const competitorsKeywords = ['competitive', 'competitors', 'competitive landscape', 'market leaders', 'key players']
  const insightsKeywords = ['insights', 'recommendations', 'strategic', 'opportunities', 'outlook', 'forward-looking']

  let currentSection = ''
  let currentContent: string[] = []

  allElements.forEach((element) => {
    const text = element.textContent?.toLowerCase() || ''
    
    // Check if this is a heading that indicates a new section
    if (element.tagName.match(/H[1-3]/)) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] += currentContent.join('')
      }
      
      // Determine new section based on heading text
      if (overviewKeywords.some(keyword => text.includes(keyword))) {
        currentSection = 'overview'
        currentContent = [element.outerHTML]
      } else if (trendsKeywords.some(keyword => text.includes(keyword))) {
        currentSection = 'trends'
        currentContent = [element.outerHTML]
      } else if (competitorsKeywords.some(keyword => text.includes(keyword))) {
        currentSection = 'competitors'
        currentContent = [element.outerHTML]
      } else if (insightsKeywords.some(keyword => text.includes(keyword))) {
        currentSection = 'insights'
        currentContent = [element.outerHTML]
      } else if (currentSection) {
        // Continue with current section
        currentContent.push(element.outerHTML)
      } else {
        // Default to overview if no section yet
        currentSection = 'overview'
        currentContent = [element.outerHTML]
      }
    } else if (currentSection) {
      // Add content to current section
      currentContent.push(element.outerHTML)
    } else {
      // Default to overview
      sections.overview += element.outerHTML
    }
  })

  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection as keyof typeof sections] += currentContent.join('')
  }

  // If any section is empty, add a message
  Object.keys(sections).forEach(key => {
    if (!sections[key as keyof typeof sections]) {
      sections[key as keyof typeof sections] = `<p class="text-gray-500 italic">No specific ${key} information available in this report.</p>`
    }
  })

  return sections
}

// Save report to localStorage
export function saveReport(report: Report): void {
  const reports = getReports()
  reports.unshift(report) // Add to beginning
  localStorage.setItem('market_research_reports', JSON.stringify(reports))
}

// Get all reports
export function getReports(): Report[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('market_research_reports')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

// Get single report by ID
export function getReport(id: string): Report | null {
  const reports = getReports()
  return reports.find(r => r.id === id) || null
}

// Delete report
export function deleteReport(id: string): void {
  const reports = getReports()
  const filtered = reports.filter(r => r.id !== id)
  localStorage.setItem('market_research_reports', JSON.stringify(filtered))
}

// Clear all reports (useful for testing/reset)
export function clearAllReports(): void {
  localStorage.removeItem('market_research_reports')
  localStorage.removeItem('latestWebhookReport') // Also clear old webhook data
}

// Get total count of reports
export function getReportsCount(): number {
  return getReports().length
}

// Get the most recent report
export function getLatestReport(): Report | null {
  const reports = getReports()
  if (reports.length === 0) return null
  
  return reports.reduce((latest, current) => {
    return new Date(current.dateGenerated) > new Date(latest.dateGenerated) 
      ? current 
      : latest
  })
}

// Generate unique ID
export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create report from webhook response and form data
export function createReportFromWebhook(
  webhookData: any,
  formData: any
): Report {
  const reportData = Array.isArray(webhookData) ? webhookData[0] : webhookData
  const webReport = reportData.webReport || ''
  const sections = parseReportSections(webReport)

  return {
    id: generateReportId(),
    title: `${formData.marketCategory} - ${formData.subNiche}`,
    category: formData.marketCategory,
    subNiche: formData.subNiche,
    geography: formData.geography || 'Global',
    email: formData.email,
    dateGenerated: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    type: formData.researchType === 'on-demand' ? 'On-demand' : 'Recurring',
    webReport,
    emailReport: reportData.emailReport || '',
    sections
  }
}

