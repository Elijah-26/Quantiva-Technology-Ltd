import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/server'

// Must use raw body for Stripe signature verification
export const runtime = 'nodejs'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

function buildPriceToPlan(): Record<string, 'starter' | 'professional' | 'enterprise'> {
  const map: Record<string, 'starter' | 'professional' | 'enterprise'> = {}
  const starter = process.env.STRIPE_PRICE_STARTER_MONTHLY
  const professional = process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY
  const enterprise = process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY
  if (starter) map[starter] = 'starter'
  if (professional) map[professional] = 'professional'
  if (enterprise) map[enterprise] = 'enterprise'
  return map
}

type SubscriptionPlan = 'starter' | 'professional' | 'enterprise'
type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

function stripeStatusToDb(status: Stripe.Subscription['status']): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
  }
  return (map[status] ?? 'incomplete') as SubscriptionStatus
}

async function upsertSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  customerEmail: string,
  plan: SubscriptionPlan,
  status: SubscriptionStatus,
  currentPeriodStart: Date | null,
  currentPeriodEnd: Date | null,
  cancelAtPeriodEnd: boolean
) {
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', customerEmail.toLowerCase())
    .single()

  const row = {
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    customer_email: customerEmail.toLowerCase(),
    user_id: existingUser?.id ?? null,
    plan,
    status,
    current_period_start: currentPeriodStart?.toISOString() ?? null,
    current_period_end: currentPeriodEnd?.toISOString() ?? null,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabaseAdmin.from('subscriptions').upsert(row, {
    onConflict: 'stripe_subscription_id',
  })

  if (error) throw error

  // Update user's plan for quick access
  if (existingUser?.id && (status === 'active' || status === 'trialing')) {
    await supabaseAdmin
      .from('users')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', existingUser.id)
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Stripe webhook signature verification failed:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.subscription || !session.customer_email) {
          break
        }

        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ['items.data.price'] }
        )

        const priceId = (subscription.items.data[0]?.price as Stripe.Price)?.id ?? ''
        const priceToPlan = buildPriceToPlan()
        const plan = (priceToPlan[priceId] ?? session.metadata?.plan ?? 'starter') as SubscriptionPlan
        const status = stripeStatusToDb(subscription.status)
        const subData = subscription as unknown as { current_period_start: number; current_period_end: number; cancel_at_period_end: boolean }

        await upsertSubscription(
          subscription.id,
          subscription.customer as string,
          session.customer_email,
          plan,
          status,
          new Date(subData.current_period_start * 1000),
          new Date(subData.current_period_end * 1000),
          subData.cancel_at_period_end ?? false
        )
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const stripe = getStripe()
        const customer = await stripe.customers.retrieve(customerId)
        const isDeleted = 'deleted' in customer && customer.deleted === true
        const customerEmail = !isDeleted && customer ? customer.email : null
        if (!customerEmail) {
          console.error('No email for customer', customerId)
          break
        }

        const price = sub.items.data[0]?.price
        const priceId = typeof price === 'string' ? price : (price as Stripe.Price)?.id ?? ''
        const priceToPlan = buildPriceToPlan()
        const plan = (priceToPlan[priceId] ?? sub.metadata?.plan ?? 'starter') as SubscriptionPlan
        const status = stripeStatusToDb(sub.status)
        const subAny = sub as { current_period_start?: number; current_period_end?: number }
        const periodStart = typeof subAny.current_period_start === 'number' ? subAny.current_period_start : null
        const periodEnd = typeof subAny.current_period_end === 'number' ? subAny.current_period_end : null

        await upsertSubscription(
          sub.id,
          customerId,
          customerEmail,
          plan,
          status,
          periodStart !== null ? new Date(periodStart * 1000) : null,
          periodEnd !== null ? new Date(periodEnd * 1000) : null,
          sub.cancel_at_period_end ?? false
        )
        break
      }

      default:
        // Unhandled event type
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
