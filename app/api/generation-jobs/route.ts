import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isPlatformAdmin } from '@/lib/auth/admin'

async function synthesizeDocument(body: {
  documentType: string
  industry: string
  jurisdiction: string
  companyName: string
  website: string
  description: string
  additionalRequirements: string
}): Promise<{ text: string; error?: string }> {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return {
      text: `[Draft — add OPENAI_API_KEY for live AI generation]\n\n${body.companyName}\n${body.website}\n\n${body.description}\n\n${body.additionalRequirements || ''}\n\nDocument type: ${body.documentType} · Industry: ${body.industry} · Jurisdiction: ${body.jurisdiction}`,
    }
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You draft professional legal/compliance-oriented document sections. Use clear headings and bullet points where helpful.',
          },
          {
            role: 'user',
            content: `Produce a structured draft for a ${body.documentType} document.\nCompany: ${body.companyName}\nWebsite: ${body.website}\nIndustry: ${body.industry}\nJurisdiction: ${body.jurisdiction}\nRequirements: ${body.description}\nAdditional: ${body.additionalRequirements || 'None'}`,
          },
        ],
        max_tokens: 2500,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      return { text: '', error: json?.error?.message || 'OpenAI request failed' }
    }
    const text = json?.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: '', error: 'Empty model response' }
    return { text }
  } catch (e) {
    return { text: '', error: e instanceof Error ? e.message : 'Generation failed' }
  }
}

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('generation_jobs')
      .select('id, status, document_type, company_name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs: data || [] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const documentType = String(body.documentType || '')
    const industry = String(body.industry || '')
    const jurisdiction = String(body.jurisdiction || '')
    const companyName = String(body.companyName || '')
    const website = String(body.website || '')
    const description = String(body.description || '')
    const additionalRequirements = String(body.additionalRequirements || '')

    if (!documentType || !industry || !jurisdiction || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isPlatformAdmin(user)) {
      const { limits } = await getUserPlanAndLimits(user.id)
      if (limits.reportsPerMonth !== Infinity) {
        const now = new Date()
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
        const { count, error: cErr } = await supabaseAdmin
          .from('generation_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth)
        if (cErr) {
          return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
        }
        if ((count ?? 0) >= limits.reportsPerMonth) {
          return NextResponse.json(
            { error: 'Plan limit reached for generations this month', code: 'GEN_LIMIT' },
            { status: 403 }
          )
        }
      }
    }

    const { data: job, error: insErr } = await supabase
      .from('generation_jobs')
      .insert({
        user_id: user.id,
        status: 'processing',
        document_type: documentType,
        industry,
        jurisdiction,
        company_name: companyName,
        website,
        description,
        additional_requirements: additionalRequirements,
      })
      .select()
      .single()

    if (insErr || !job) {
      return NextResponse.json({ error: insErr?.message || 'Insert failed' }, { status: 500 })
    }

    const result = await synthesizeDocument({
      documentType,
      industry,
      jurisdiction,
      companyName,
      website,
      description,
      additionalRequirements,
    })

    const now = new Date().toISOString()
    if (result.error) {
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: result.error,
          updated_at: now,
        })
        .eq('id', job.id)

      return NextResponse.json(
        { job: { ...job, status: 'failed', error_message: result.error } },
        { status: 200 }
      )
    }

    await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_text: result.text,
        updated_at: now,
      })
      .eq('id', job.id)

    return NextResponse.json({
      job: {
        ...job,
        status: 'completed',
        result_text: result.text,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
