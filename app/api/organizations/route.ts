import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { recordAuditEvent } from '@/lib/audit'

/** List organizations the current user belongs to. */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: memberships, error: mErr } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)

    if (mErr) {
      return NextResponse.json({ error: mErr.message }, { status: 500 })
    }

    const orgIds = [...new Set((memberships || []).map((m) => m.organization_id))]
    if (orgIds.length === 0) {
      return NextResponse.json({ organizations: [] })
    }

    const { data: orgs, error: oErr } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .in('id', orgIds)

    if (oErr) {
      return NextResponse.json({ error: oErr.message }, { status: 500 })
    }

    const roleByOrg = new Map((memberships || []).map((m) => [m.organization_id, m.role]))
    const organizations = (orgs || []).map((o) => ({
      ...o,
      role: roleByOrg.get(o.id) || 'member',
    }))

    return NextResponse.json({ organizations })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Create an organization and add the current user as owner. */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 200) {
      return NextResponse.json({ error: 'Valid name required (max 200 chars)' }, { status: 400 })
    }

    const { data: org, error: oErr } = await supabaseAdmin
      .from('organizations')
      .insert({ name })
      .select('id, name, created_at')
      .single()

    if (oErr || !org) {
      return NextResponse.json({ error: oErr?.message || 'Create failed' }, { status: 500 })
    }

    const { error: memErr } = await supabaseAdmin.from('organization_members').insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memErr) {
      await supabaseAdmin.from('organizations').delete().eq('id', org.id)
      return NextResponse.json({ error: memErr.message }, { status: 500 })
    }

    await recordAuditEvent(supabaseAdmin, {
      actorUserId: user.id,
      organizationId: org.id,
      action: 'organization.created',
      entityType: 'organization',
      entityId: org.id,
      metadata: { name: org.name },
    })

    return NextResponse.json({ organization: { ...org, role: 'owner' as const } }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
