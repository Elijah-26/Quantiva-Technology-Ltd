// lib/supabase/server.ts
// Server-side Supabase client with admin privileges

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-side Supabase client (bypasses RLS, use with caution!)
// Use this only in API routes and server-side code
// Note: Placeholder values are used during build time, actual values loaded at runtime
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

