'use client'

import { use, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Target,
  BarChart3
} from 'lucide-react'

interface Report {
  id: string
  scheduleId?: string
  title: string
  category: string
  subNiche: string
  geography: string
  email: string
  dateGenerated: string
  type: 'On-demand' | 'Recurring'
  webReport: string
  emailReport: string
  frequency?: string
  isFirstRun?: boolean
  runAt?: string
  createdAt?: string
}

export default function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [id])

  const loadReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }
      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error('Error loading report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading report...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Report not found</h2>
              <p className="text-gray-600">The report you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Branding Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Quantiva</h1>
          <p className="text-sm text-gray-600">AI-Powered Market Intelligence</p>
        </div>

        {/* Report Header */}
        <Card className="border-2 mb-6">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">{report.category}</Badge>
                <Badge variant={report.type === 'Recurring' ? 'default' : 'outline'}>
                  {report.type}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Generated {report.dateGenerated}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{report.geography}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>{report.subNiche}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <CardTitle>Market Intelligence Report</CardTitle>
            </div>
            <CardDescription>
              Comprehensive analysis of {report.category} - {report.subNiche}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-sm max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-ul:my-4 prose-ul:space-y-2
                prose-li:text-gray-700
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-table:w-full prose-table:border-collapse
                prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-th:text-left
                prose-td:border prose-td:border-gray-300 prose-td:p-2"
              dangerouslySetInnerHTML={{ __html: report.webReport }}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>This report was generated by Quantiva - AI-Powered Market Intelligence Platform</p>
          <p className="mt-2">© {new Date().getFullYear()} Quantiva. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

