'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  MapPin, 
  Target,
  BarChart3,
  Share2,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { withAuth } from '@/lib/auth/protected-route'

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

function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!report) return
    
    // Create public report URL (not requiring authentication)
    const baseUrl = window.location.origin
    const publicReportUrl = `${baseUrl}/report/${report.id}`
    
    // Try native share API first (mobile/tablets)
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: `Check out this market research report: ${report.title}`,
          url: publicReportUrl
        })
        toast.success('Shared successfully!')
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
          // Fallback to clipboard
          await copyToClipboard(publicReportUrl)
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await copyToClipboard(publicReportUrl)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!', {
        description: 'Anyone with this link can view the report without logging in.'
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-white/55">
              <Spinner className="size-6 text-blue-400" />
              <span>Loading report...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard/reports">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
          </Link>
          <Card className="border-white/10 bg-white/5">
            <CardContent className="py-16 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Report not found</h2>
              <p className="text-white/60 mb-6">The report you're looking for doesn't exist.</p>
              <Link href="/dashboard/reports">
                <Button>Go to Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard/reports">
          <Button variant="ghost" className="gap-2 mb-4 sm:mb-6 min-h-[44px]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Reports</span>
          </Button>
        </Link>

        {/* Header */}
        <Card className="border border-white/10 bg-white/5 mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <div className="flex flex-col gap-4">
              {/* Title and Icon */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/20">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white break-words mb-3">
                    {report.title}
                  </h1>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">{report.category}</Badge>
                    <Badge variant={report.type === 'Recurring' ? 'default' : 'outline'} className="text-xs sm:text-sm">
                      {report.type}
                    </Badge>
                    <Badge className="bg-green-600 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Sent to </span>
                      <span className="truncate max-w-[120px] sm:max-w-none">{report.email}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/65 pl-0 sm:pl-15">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Generated {report.dateGenerated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">{report.geography}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{report.subNiche}</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="pt-3 border-t border-white/10">
                <Button 
                  variant="default" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[48px]" 
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Share Report</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <CardTitle className="text-base sm:text-lg text-white">Market Intelligence Report</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-white/60">
              Comprehensive analysis of {report.category} - {report.subNiche}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div 
              className="max-w-none break-words text-sm sm:text-base text-white/90
                [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                [&_h2]:text-lg sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-6 sm:[&_h2]:mt-8 [&_h2]:mb-3 sm:[&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-white/15
                [&_h3]:text-base sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 sm:[&_h3]:mt-6 [&_h3]:mb-2 sm:[&_h3]:mb-3
                [&_p]:text-white/85 [&_p]:leading-relaxed [&_p]:mb-3 sm:[&_p]:mb-4
                [&_a]:text-blue-400 [&_a]:underline-offset-2 hover:[&_a]:underline [&_a]:break-words
                [&_ul]:my-3 sm:[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 sm:[&_ul]:space-y-2
                [&_ol]:my-3 sm:[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5
                [&_li]:text-white/85 [&_li]:text-sm sm:[&_li]:text-base [&_li]:marker:text-white/50
                [&_strong]:text-white [&_strong]:font-semibold
                [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs sm:[&_table]:text-sm
                [&_th]:border [&_th]:border-white/20 [&_th]:bg-white/10 [&_th]:p-2 [&_th]:text-left [&_th]:text-white
                [&_td]:border [&_td]:border-white/15 [&_td]:p-2 [&_td]:text-white/85
                [&_blockquote]:border-l-2 [&_blockquote]:border-white/25 [&_blockquote]:pl-4 [&_blockquote]:text-white/75 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: report.webReport }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ReportDetailPage)
