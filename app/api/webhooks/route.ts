// app/api/webhooks/route.ts
// API routes for webhook management

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

// GET all webhooks (all authenticated users can read)
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
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all webhooks
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .order('type', { ascending: true })

    if (webhooksError) {
      return NextResponse.json(
        { error: webhooksError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new webhook (admin only)
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
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.role === 'admin' ||
                    user.app_metadata?.role === 'admin' ||
                    user.email === 'admin@quantitva.com' ||
                    user.email === 'pat2echo@gmail.com'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, url, type, description } = body

    // Validate required fields
    if (!name || !url || !type) {
      return NextResponse.json(
        { error: 'Name, URL, and type are required' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['on-demand', 'recurring'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "on-demand" or "recurring"' },
        { status: 400 }
      )
    }

    // Create webhook using service role (bypasses RLS)
    const { data: webhook, error: createError } = await supabaseAdmin
      .from('webhooks')
      .insert({
        name,
        url,
        type,
        description,
        active: true, // Always active by default
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

