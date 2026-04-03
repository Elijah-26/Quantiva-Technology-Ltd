'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Mail, Trash2, Play, Pause, Plus, RefreshCw, TrendingUp, Repeat, BarChart } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { withAuth } from '@/lib/auth/protected-route'

interface SupabaseSchedule {
  id: string
  schedule_id: string
  user_id: string
  title: string
  industry: string
  sub_niche: string
  geography: string
  email: string
  frequency: string
  notes: string
  active: boolean
  last_run: string | null
  next_run: string
  execution_count: number
  created_at: string
  updated_at: string
}

function SchedulesPage() {
  const [schedules, setSchedules] = useState<SupabaseSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; schedule: SupabaseSchedule | null }>({
    open: false,
    schedule: null
  })
  const [pauseDialog, setPauseDialog] = useState<{ open: boolean; schedule: SupabaseSchedule | null }>({
    open: false,
    schedule: null
  })

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/schedules/active')
      const data = await response.json()
      
      if (response.ok) {
        // Include both active and inactive schedules
        const allSchedulesResponse = await fetch('/api/schedules/all')
        const allData = await allSchedulesResponse.json()
        setSchedules(allData.schedules || [])
      } else {
        toast.error('Failed to load schedules')
      }
    } catch (error) {
      console.error('Error loading schedules:', error)
      toast.error('Failed to load schedules')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (schedule: SupabaseSchedule) => {
    try {
      const endpoint = schedule.active 
        ? `/api/schedules/${schedule.id}/pause` 
        : `/api/schedules/${schedule.id}/resume`
      
      const response = await fetch(endpoint, { method: 'POST' })
      
      if (response.ok) {
        await loadSchedules()
        toast.success(
          schedule.active ? 'Schedule paused' : 'Schedule resumed',
          {
            description: schedule.active 
              ? 'Reports will not be generated until resumed' 
              : 'Reports will be generated on schedule'
          }
        )
        setPauseDialog({ open: false, schedule: null })
      } else {
        throw new Error('Failed to update schedule')
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast.error('Failed to update schedule')
    }
  }

  const handleDelete = async (schedule: SupabaseSchedule) => {
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, { method: 'DELETE' })
      
      if (response.ok) {
        await loadSchedules()
        toast.success('Schedule deleted', {
          description: 'The schedule has been permanently removed'
        })
        setDeleteDialog({ open: false, schedule: null })
      } else {
        throw new Error('Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      toast.error('Failed to delete schedule')
    }
  }

  const activeSchedules = schedules.filter(s => s.active)
  const inactiveSchedules = schedules.filter(s => !s.active)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-white/55">
            <Spinner className="size-6 text-blue-400" />
            <span>Loading schedules...</span>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total executions
  const totalExecutions = schedules.reduce((sum, s) => sum + (s.execution_count || 0), 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 md:mb-8 gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Scheduled Research</h2>
          <p className="text-sm md:text-base text-white/60 mt-1">
            Manage your recurring market research schedules
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={loadSchedules}
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px] flex-shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            {isLoading ? (
              <Spinner className="size-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Link href="/dashboard/new-research" className="flex-1 sm:flex-initial">
            <Button className="gap-2 w-full min-h-[44px]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Schedule</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Schedules</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/20">
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl sm:text-2xl font-bold text-white/30 animate-pulse">...</div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-white">{schedules.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/10">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Active Schedules</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/20">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl sm:text-2xl font-bold text-white/30 animate-pulse">...</div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-emerald-400">{activeSchedules.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Paused Schedules</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl sm:text-2xl font-bold text-white/30 animate-pulse">...</div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-white/70">{inactiveSchedules.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-purple-400/30 bg-purple-500/10">
          <CardHeader className="pb-2 sm:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Executions</CardTitle>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/20">
                <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl sm:text-2xl font-bold text-white/30 animate-pulse">...</div>
            ) : (
              <div className="text-3xl sm:text-4xl font-bold text-purple-300">{totalExecutions}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {schedules.length === 0 && (
        <Card className="border-dashed border-white/20 bg-white/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-white/35 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Schedules Yet</h3>
            <p className="text-white/55 text-center mb-6 max-w-md">
              Create your first recurring research schedule to automatically monitor market trends and insights.
            </p>
            <Link href="/dashboard/new-research">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active Schedules */}
      {activeSchedules.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
            <span>Active Schedules ({activeSchedules.length})</span>
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {activeSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onPause={() => setPauseDialog({ open: true, schedule })}
                onDelete={() => setDeleteDialog({ open: true, schedule })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Schedules */}
      {inactiveSchedules.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 flex-shrink-0" />
            <span>Paused Schedules ({inactiveSchedules.length})</span>
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {inactiveSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onPause={() => setPauseDialog({ open: true, schedule })}
                onDelete={() => setDeleteDialog({ open: true, schedule })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, schedule: null })}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete "{deleteDialog.schedule?.title}"? This action cannot be undone.
              Past reports will remain accessible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, schedule: null })}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.schedule && handleDelete(deleteDialog.schedule)}
            >
              Delete Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause/Resume Confirmation Dialog */}
      <Dialog open={pauseDialog.open} onOpenChange={(open) => setPauseDialog({ open, schedule: null })}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {pauseDialog.schedule?.active ? 'Pause' : 'Resume'} Schedule
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {pauseDialog.schedule?.active ? (
                <>
                  Are you sure you want to pause "{pauseDialog.schedule?.title}"?
                  No reports will be generated until you resume it.
                </>
              ) : (
                <>
                  Resume "{pauseDialog.schedule?.title}"?
                  Reports will be generated according to the schedule.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPauseDialog({ open: false, schedule: null })}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => pauseDialog.schedule && handleToggleActive(pauseDialog.schedule)}
            >
              {pauseDialog.schedule?.active ? 'Pause' : 'Resume'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(SchedulesPage)

function ScheduleCard({ 
  schedule, 
  onPause, 
  onDelete 
}: { 
  schedule: SupabaseSchedule
  onPause: () => void
  onDelete: () => void
}) {
  // Calculate time until next run
  const getTimeUntilNextRun = () => {
    if (!schedule.next_run) return 'Not scheduled'
    const now = new Date()
    const nextRun = new Date(schedule.next_run)
    const diffMs = nextRun.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Overdue'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 1) return `in ${diffDays} days`
    if (diffHours > 1) return `in ${diffHours} hours`
    return 'Soon'
  }

  return (
    <Card
      className={`border transition-all hover:shadow-md ${
        schedule.active
          ? 'border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 to-emerald-950/20'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <CardHeader>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 flex-wrap">
              <CardTitle className="text-base sm:text-lg md:text-xl truncate text-white">{schedule.title}</CardTitle>
              <Badge
                variant={schedule.active ? 'default' : 'secondary'}
                className={`${
                  schedule.active ? 'bg-emerald-600 text-white border-0' : 'bg-white/10 text-white/80 border-white/15'
                } text-xs sm:text-sm flex-shrink-0`}
              >
                {schedule.active ? 'Active' : 'Paused'}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize text-xs sm:text-sm flex-shrink-0 border-white/20 bg-white/5 text-white/85"
              >
                {schedule.frequency}
              </Badge>
              {schedule.execution_count > 0 && (
                <Badge
                  variant="outline"
                  className="border-purple-400/40 bg-purple-500/15 text-purple-200 text-xs sm:text-sm flex-shrink-0"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {schedule.execution_count} runs
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap text-white/55">
              <span className="truncate">{schedule.industry}</span>
              <span className="text-white/35">•</span>
              <span className="truncate">{schedule.sub_niche}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full lg:w-auto flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className={`gap-1.5 sm:gap-2 min-h-[44px] flex-1 lg:flex-initial text-xs sm:text-sm border-white/15 bg-white/5 text-white hover:bg-white/10 ${
                schedule.active
                  ? 'hover:border-orange-400/50 hover:text-orange-200'
                  : 'hover:border-emerald-400/50 hover:text-emerald-200'
              }`}
            >
              {schedule.active ? (
                <>
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Resume</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:border-red-400/50 min-h-[44px] flex-1 lg:flex-initial text-xs sm:text-sm"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="lg:hidden">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/45 flex-shrink-0" />
              <span className="capitalize truncate">{schedule.geography}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/45 flex-shrink-0" />
              <span className="truncate">{schedule.email}</span>
            </div>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/45 flex-shrink-0" />
              <span className="truncate">
                Created{' '}
                {new Date(schedule.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            {schedule.last_run && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/65">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/45 flex-shrink-0" />
                <span className="truncate">
                  Last run {new Date(schedule.last_run).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium text-white">Next Run</div>
                <div className="text-white/65 truncate">
                  {new Date(schedule.next_run).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-xs text-blue-400 font-medium mt-0.5">{getTimeUntilNextRun()}</div>
              </div>
            </div>
          </div>
        </div>
        {schedule.notes && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
            <p className="text-xs sm:text-sm text-white/65">
              <span className="font-medium text-white/85">Notes:</span> {schedule.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
