'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { withAuth } from '@/lib/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Building2, Shield } from 'lucide-react'
import { toast } from 'sonner'

type OrgRow = { id: string; name: string; created_at: string; role: string }

function EnterpriseSettingsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadOrgs() {
    const res = await fetch('/api/organizations', { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (res.ok) setOrgs(data.organizations || [])
  }

  useEffect(() => {
    loadOrgs()
  }, [])

  async function createOrg(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    setLoading(true)
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Organization created')
      setName('')
      await loadOrgs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-white/70">
        <Link href="/dashboard/settings">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to settings
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-indigo-400" />
          Enterprise &amp; security
        </h1>
        <p className="text-white/60 text-sm mt-2">
          SSO (SAML), SCIM provisioning, custom data retention, and dedicated support are available on
          Enterprise engagements. Configure SAML in the Supabase dashboard for your project when your
          plan includes it.
        </p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Single sign-on (SSO)</CardTitle>
          <CardDescription className="text-white/50">
            Connect your identity provider (Okta, Azure AD, Google Workspace, etc.) via Supabase Auth
            SAML. Coordinate with your Quantiva account team for production rollout and testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/20 text-white" asChild>
            <Link href="/dashboard/billing">View billing &amp; plans</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organizations (teams)
          </CardTitle>
          <CardDescription className="text-white/50">
            Create a workspace for shared folders. Members see items placed in org-linked folders;
            invite flows can be added next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={createOrg} className="space-y-3">
            <Label htmlFor="orgName" className="text-white/80">
              New organization name
            </Label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Compliance"
                className="bg-white/5 border-white/10 text-white"
              />
              <Button type="submit" disabled={loading || !name.trim()}>
                Create
              </Button>
            </div>
          </form>
          {orgs.length > 0 && (
            <ul className="space-y-2 border-t border-white/10 pt-4">
              {orgs.map((o) => (
                <li
                  key={o.id}
                  className="flex justify-between items-center text-sm text-white/80 py-2 border-b border-white/5"
                >
                  <span>{o.name}</span>
                  <span className="text-white/40 capitalize">{o.role}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Data retention</CardTitle>
          <CardDescription className="text-white/50">
            Enterprise contracts can define report history windows, export schedules, and deletion
            policies. Defaults follow your subscription tier in the product.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default withAuth(EnterpriseSettingsPage)
