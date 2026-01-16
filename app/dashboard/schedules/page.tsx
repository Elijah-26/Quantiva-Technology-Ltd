'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Mail, Trash2, Play, Pause, Plus } from 'lucide-react'
import { 
  getSchedules, 
  deleteSchedule, 
  toggleScheduleActive,
  formatFrequency,
  formatDate,
  type Schedule 
} from '@/lib/schedules'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = () => {
    setIsLoading(true)
    const loadedSchedules = getSchedules()
    setSchedules(loadedSchedules)
    setIsLoading(false)
  }

  const handleToggleActive = (id: string) => {
    toggleScheduleActive(id)
    loadSchedules()
    toast.success('Schedule updated', {
      description: 'Schedule status changed successfully.',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(id)
      loadSchedules()
      toast.success('Schedule deleted', {
        description: 'The schedule has been removed.',
      })
    }
  }

  const activeSchedules = schedules.filter(s => s.active)
  const inactiveSchedules = schedules.filter(s => !s.active)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading schedules...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Research</h2>
          <p className="text-gray-600 mt-1">
            Manage your recurring market research schedules
          </p>
        </div>
        <Link href="/dashboard/new-research">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Schedule
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {activeSchedules.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paused Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">
              {inactiveSchedules.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {schedules.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Schedules Yet
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Schedules ({activeSchedules.length})
          </h3>
          <div className="space-y-4">
            {activeSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Schedules */}
      {inactiveSchedules.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Paused Schedules ({inactiveSchedules.length})
          </h3>
          <div className="space-y-4">
            {inactiveSchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleCard({ 
  schedule, 
  onToggleActive, 
  onDelete 
}: { 
  schedule: Schedule
  onToggleActive: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card className={schedule.active ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{schedule.title}</CardTitle>
              <Badge variant={schedule.active ? 'default' : 'secondary'}>
                {schedule.active ? 'Active' : 'Paused'}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {formatFrequency(schedule.frequency)}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              {schedule.subNiche}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(schedule.id)}
              className="gap-2"
            >
              {schedule.active ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(schedule.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{schedule.geography}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{schedule.email}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(schedule.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                Next run: {new Date(schedule.nextRun).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        {schedule.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {schedule.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
