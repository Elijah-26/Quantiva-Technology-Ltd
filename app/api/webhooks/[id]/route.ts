// app/api/webhooks/[id]/route.ts
// API routes for individual webhook management

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

// PUT - Update webhook (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
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
    const { name, url, type, description, active } = body

    // Build update object with only provided fields
    const updates: any = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (url !== undefined) updates.url = url
    if (type !== undefined) updates.type = type
    if (description !== undefined) updates.description = description
    if (active !== undefined) updates.active = active

    // Update webhook using service role
    const { data: webhook, error: updateError } = await supabaseAdmin
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ webhook })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete webhook (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
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

    // Delete webhook using service role
    const { error: deleteError } = await supabaseAdmin
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

