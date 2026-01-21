// DELETE /api/schedules/[id] - Delete a schedule

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Create Supabase client with user authentication
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in' },
        { status: 401 }
      )
    }
    
    console.log(`🗑️  Deleting schedule ${id} for user ${user.id}`)
    
    // Delete schedule (RLS will ensure user can only delete their own schedules)
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this schedule
    
    if (deleteError) {
      console.error(`❌ Error deleting schedule:`, deleteError)
      return NextResponse.json(
        { error: 'Failed to delete schedule', details: deleteError.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ Schedule ${id} deleted successfully`)
    
    return NextResponse.json({
      success: true,
      scheduleId: id,
      message: 'Schedule deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Error in delete endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

