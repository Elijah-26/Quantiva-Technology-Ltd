import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** List audit events for the current user; platform admins can list all. ?format=csv for download. */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10) || 100))

    const admin = await isUserPlatformAdmin(user, supabaseAdmin)
    const client = admin ? supabaseAdmin : supabase

    let query = client
      .from('audit_events')
      .select('id, organization_id, actor_user_id, action, entity_type, entity_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!admin) {
      query = query.eq('actor_user_id', user.id)
    }

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = events || []

    if (format === 'csv') {
      const header = ['id', 'created_at', 'action', 'entity_type', 'entity_id', 'organization_id', 'metadata']
      const lines = [
        header.join(','),
        ...rows.map((r) =>
          [
            csvEscape(r.id),
            csvEscape(r.created_at),
            csvEscape(r.action),
            csvEscape(r.entity_type),
            csvEscape(r.entity_id || ''),
            csvEscape(r.organization_id || ''),
            csvEscape(JSON.stringify(r.metadata ?? {})),
          ].join(',')
        ),
      ]
      const csv = lines.join('\r\n')
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit-export.csv"',
        },
      })
    }

    return NextResponse.json({
      events: rows,
      scope: admin ? 'all' : 'own',
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
