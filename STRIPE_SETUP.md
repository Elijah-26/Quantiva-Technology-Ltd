# Stripe Subscription Setup

This guide walks you through configuring Stripe for Quantiva's pricing and subscription flow.

## Overview

- **Sign Up flow**: Users click "Sign Up" → land on `/pricing` → select a plan → Stripe Checkout → complete payment → redirect to `/signup` to create their account
- **Plans**: Starter (£49), Professional (£149), Enterprise (£499) — monthly billing only
- **14-day free trial** is included on all subscriptions

---

## 1. Stripe Dashboard Setup

### Create Products & Prices

In [Stripe Dashboard](https://dashboard.stripe.com/products):

1. **Starter**
   - Create product "Quantiva Starter"
   - Add price: £49/month (recurring) — copy the Price ID

2. **Professional**
   - Create product "Quantiva Professional"
   - Add price: £149/month (recurring) — copy the Price ID

3. **Enterprise**
   - Create product "Quantiva Enterprise"
   - Add price: £499/month (recurring) — copy the Price ID

---

## 2. Environment Variables (Vercel)

Add these in **Vercel** → Project → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Secret key from Stripe Dashboard → Developers → API Keys | `sk_live_...` or `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (for future client-side Stripe usage) | `pk_live_...` or `pk_test_...` |
| `STRIPE_PRICE_STARTER_MONTHLY` | Price ID for Starter | `price_xxx` |
| `STRIPE_PRICE_PROFESSIONAL_MONTHLY` | Price ID for Professional | `price_xxx` |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Price ID for Enterprise | `price_xxx` |
| `STRIPE_WEBHOOK_SECRET` | For Phase 2: webhook signing secret | `whsec_xxx` |

Use **Production** values for Production environment, and **Test** values for Preview/Development.

### Local Development

Create a `.env.local` file with the same variables (use test keys for local):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
```

---

## 3. Webhook Setup (Required for plan restriction)

1. **Run the subscriptions SQL in Supabase:**
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `supabase-subscriptions-setup.sql`
   - Run the script

2. **Add webhook endpoint in Stripe Dashboard:**
   - Developers → Webhooks → Add endpoint
   - URL: `https://quantiva.world/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

3. **Redeploy** so the webhook route and env vars are live.

For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 4. Testing

1. Use **test mode** keys (sk_test_, pk_test_) in development
2. Use Stripe test card: `4242 4242 4242 4242`
3. Flow: Home → Pricing → Select plan → Checkout → Sign up
4. Verify redirect to `/signup?checkout=success` after payment

---

## Pricing Tier Mapping

| Plan | Monthly |
|------|---------|
| Starter | £49 |
| Professional | £149 |
| Enterprise | £499 |

You can change these amounts in the Stripe Dashboard; the prices shown on `/pricing` are for display only. The actual billing is controlled by your Stripe Price IDs.
