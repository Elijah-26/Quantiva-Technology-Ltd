'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Loader2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { withAuth } from '@/lib/auth/protected-route'
import { getCurrentUserProfile, updateUser, type UserProfile } from '@/lib/auth/user-service'

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await getCurrentUserProfile()
      if (cancelled) return
      if (error || !data) {
        toast.error('Could not load your profile')
        setLoading(false)
        return
      }
      setProfile(data)
      setFullName(data.full_name || '')
      setCompanyName(data.company_name || '')
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await updateUser(profile.id, {
        full_name: fullName.trim(),
        company_name: companyName.trim(),
      })
      if (error) {
        toast.error(typeof error === 'string' ? error : 'Failed to save')
        return
      }
      toast.success('Profile updated')
      const { data } = await getCurrentUserProfile()
      if (data) setProfile(data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-24 text-white/60 gap-2">
        <Loader2 className="size-6 animate-spin" />
        Loading profile…
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-white/60 text-sm mt-1">Update your name and company. Email is managed by your sign-in provider.</p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-5 text-indigo-400" />
            <CardTitle className="text-white">Basic information</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            This name appears in the app header and on reports where applicable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80">Email</Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-white/5 border-white/10 text-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/80">
                Company
              </Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Company or organization"
              />
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-indigo-400" />
            <CardTitle className="text-white">More</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Link
            href="/dashboard/settings/enterprise"
            className="block text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline"
          >
            Enterprise &amp; security
          </Link>
          <p className="text-white/45">
            Platform admins manage all users under <span className="text-white/70">Admin → Users</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(ProfilePage)
