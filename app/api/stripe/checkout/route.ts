import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

const PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
  professional: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const body = await req.json()
    const { plan, successUrl, cancelUrl } = body

    const priceId = plan ? PRICE_MAP[plan] : body.priceId

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or price not configured' },
        { status: 400 }
      )
    }

    const origin =
      req.headers.get('origin') ||
      req.headers.get('referer')?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://quantiva.world'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${origin}/signup?checkout=success`,
      cancel_url: cancelUrl || `${origin}/pricing`,
      allow_promotion_codes: true,
      metadata: plan ? { plan } : undefined,
      subscription_data: {
        trial_period_days: 14,
        ...(plan && { metadata: { plan } }),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
