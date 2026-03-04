# Stripe Subscription Setup

This guide walks you through configuring Stripe for Quantiva's pricing and subscription flow.

## Overview

- **Sign Up flow**: Users click "Sign Up" → land on `/pricing` → select a plan → Stripe Checkout → complete payment → redirect to `/signup` to create their account
- **Plans**: Starter, Pro, Enterprise (each with monthly and yearly billing)
- **14-day free trial** is included on all subscriptions

---

## 1. Stripe Dashboard Setup

### Create Products & Prices

In [Stripe Dashboard](https://dashboard.stripe.com/products):

1. **Starter**
   - Create product "Quantiva Starter"
   - Add price: $29/month (recurring)
   - Add price: $290/year (recurring) — copy both Price IDs

2. **Pro**
   - Create product "Quantiva Pro"
   - Add price: $79/month (recurring)
   - Add price: $790/year (recurring) — copy both Price IDs

3. **Enterprise**
   - Create product "Quantiva Enterprise"
   - Add price: $199/month (recurring)
   - Add price: $1,990/year (recurring) — copy both Price IDs

---

## 2. Environment Variables (Vercel)

Add these in **Vercel** → Project → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Secret key from Stripe Dashboard → Developers → API Keys | `sk_live_...` or `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (for future client-side Stripe usage) | `pk_live_...` or `pk_test_...` |
| `STRIPE_PRICE_STARTER_MONTHLY` | Price ID for Starter monthly | `price_xxx` |
| `STRIPE_PRICE_STARTER_YEARLY` | Price ID for Starter yearly | `price_xxx` |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for Pro monthly | `price_xxx` |
| `STRIPE_PRICE_PRO_YEARLY` | Price ID for Pro yearly | `price_xxx` |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Price ID for Enterprise monthly | `price_xxx` |
| `STRIPE_PRICE_ENTERPRISE_YEARLY` | Price ID for Enterprise yearly | `price_xxx` |
| `STRIPE_WEBHOOK_SECRET` | For Phase 2: webhook signing secret | `whsec_xxx` |

Use **Production** values for Production environment, and **Test** values for Preview/Development.

### Local Development

Create a `.env.local` file with the same variables (use test keys for local):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx
```

---

## 3. Optional: Webhook (Phase 2 – Plan Restriction)

When implementing plan-based access control:

1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET`

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

| Plan | Monthly | Yearly |
|------|---------|--------|
| Starter | $29 | $290 |
| Pro | $79 | $790 |
| Enterprise | $199 | $1,990 |

You can change these amounts in the Stripe Dashboard; the prices shown on `/pricing` are for display only. The actual billing is controlled by your Stripe Price IDs.
