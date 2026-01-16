'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Calendar, Clock, Plus, TrendingUp, BarChart3 } from 'lucide-react'
import { getReports } from '@/lib/reports'
import { getActiveSchedulesCount } from '@/lib/schedules'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    activeSchedules: 0,
    lastRunDate: 'No reports yet',
    lastRunTime: ''
  })

  useEffect(() => {
    // Load dynamic data from reports and schedules
    const reports = getReports()
    const totalReports = reports.length
    const activeSchedules = getActiveSchedulesCount()
    
    let lastRunDate = 'No reports yet'
    let lastRunTime = ''
    
    if (reports.length > 0) {
      // Get the latest report (reports are sorted by date, newest first)
      const latestReport = reports[0]
      const date = new Date(latestReport.dateGenerated)
      lastRunDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
      lastRunTime = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
    
    setStats({
      totalReports,
      activeSchedules,
      lastRunDate,
      lastRunTime
    })
  }, [])

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, John! 👋
        </h2>
        <p className="text-gray-600 text-lg">
          Here's an overview of your market intelligence activity
        </p>
      </div>

      {/* Create New Research Button */}
      <div className="mb-8">
        <Link href="/dashboard/new-research">
          <Button size="lg" className="gap-2 h-12 px-6">
            <Plus className="w-5 h-5" />
            Create New Market Research
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Reports Card */}
        <Card className="border-2 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Reports
              </CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalReports}
            </div>
            <p className="text-sm text-gray-600">
              Research reports generated
            </p>
          </CardContent>
        </Card>

        {/* Active Schedules Card */}
        <Card className="border-2 hover:border-green-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Schedules
              </CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400 mb-1">
              {stats.activeSchedules}
            </div>
            <p className="text-sm text-gray-500">
              Coming soon
            </p>
          </CardContent>
        </Card>

        {/* Last Research Run Card */}
        <Card className="border-2 hover:border-purple-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Research Run
              </CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.totalReports > 0 ? (
              <>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.lastRunDate}
                </div>
                <p className="text-sm text-gray-600">
                  at {stats.lastRunTime}
                </p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-400 mb-1">
                  No reports yet
                </div>
                <p className="text-sm text-gray-500">
                  Create your first research
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/new-research">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">Create New Research</span>
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">View All Reports</span>
              </Button>
            </Link>
            <Link href="/dashboard/schedules">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">Manage Schedules</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Tips to maximize your market intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Set up your first research</p>
                <p className="text-sm text-gray-600">Define your market category and parameters</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule recurring reports</p>
                <p className="text-sm text-gray-600">Automate your market monitoring</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Review insights</p>
                <p className="text-sm text-gray-600">Make data-driven decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

