-- ============================================
-- STRIPE SUBSCRIPTIONS TABLE SETUP
-- ============================================
-- Run this in Supabase SQL Editor
-- Stores subscription data from Stripe webhooks for plan-based access control

-- Create subscription plan enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
  END IF;
END $$;

-- Create subscription status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM (
      'active', 'trialing', 'past_due', 'canceled', 
      'unpaid', 'incomplete', 'incomplete_expired', 'paused'
    );
  END IF;
END $$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
  ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email 
  ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role can manage all (used by webhook)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own subscription
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM users WHERE email = customer_email
  ));

-- ============================================
-- Add plan column to users for quick access
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='plan') THEN
    ALTER TABLE users ADD COLUMN plan subscription_plan;
  END IF;
END $$;

-- Link existing subscriptions when user signs up
CREATE OR REPLACE FUNCTION public.link_subscription_on_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscriptions
  SET user_id = NEW.id, updated_at = NOW()
  WHERE customer_email = LOWER(NEW.email) AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_link_subscription ON auth.users;
-- Note: auth.users is in auth schema - we use users table trigger instead
DROP TRIGGER IF EXISTS on_public_user_created_link_subscription ON public.users;
CREATE TRIGGER on_public_user_created_link_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.link_subscription_on_user_signup();
