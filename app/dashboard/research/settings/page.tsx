'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ResearchSettingsHubPage() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!user?.id) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
      if (!cancelled) setIsAdmin(data?.role === 'admin')
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Research settings</h1>
        <p className="text-white/60 mt-1">
          Personal details and platform configuration are split so everyone sees the right tools.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="size-5 text-indigo-400" />
            Your profile
          </CardTitle>
          <CardDescription className="text-white/50">
            Name and company used across the dashboard and market research flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="glass">
            <Link href="/dashboard/profile">Open profile</Link>
          </Button>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="size-5 text-indigo-400" />
              Platform configuration
            </CardTitle>
            <CardDescription className="text-white/50">
              Scheduled library generation, webhooks, and related admin controls.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/dashboard/admin/settings">
                <Shield className="size-4 mr-2 inline" />
                Admin settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
