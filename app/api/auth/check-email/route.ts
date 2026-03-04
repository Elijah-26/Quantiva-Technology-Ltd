// POST /api/auth/check-email - Check if an email exists (for forgot password flow)
// Used to avoid sending reset links to non-existent accounts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (error) {
      console.error('Check email error:', error)
      return NextResponse.json(
        { error: 'Unable to verify email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
