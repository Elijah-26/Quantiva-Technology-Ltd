-- ============================================
-- MIGRATE WEBHOOKS TO SUPABASE
-- Move from localStorage to database for production
-- ============================================

-- Step 1: Create webhooks table
-- Webhooks are global (admin-managed), all users use the same endpoints
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('on-demand', 'recurring')),
  description TEXT,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(type) -- Only one webhook configuration per type
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_type ON public.webhooks(type);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks(active);

-- Step 3: Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies
-- All authenticated users can read webhooks (they need to know where to send requests)
DROP POLICY IF EXISTS "All users can read webhooks" ON public.webhooks;
CREATE POLICY "All users can read webhooks" 
ON public.webhooks FOR SELECT 
TO authenticated 
USING (true);

-- Only service role (backend API) can modify webhooks
-- Admins will use API routes that check admin status
DROP POLICY IF EXISTS "Service role can manage webhooks" ON public.webhooks;
CREATE POLICY "Service role can manage webhooks" 
ON public.webhooks FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Step 5: Insert default active webhooks for production
-- Replace URLs with your actual n8n webhook URLs
INSERT INTO public.webhooks (name, url, type, description, active)
VALUES 
  (
    'On-Demand Research Handler',
    'https://your-n8n-instance.app.n8n.cloud/webhook/on-demand',
    'on-demand',
    'Handles immediate market research requests',
    true
  ),
  (
    'Recurring Research Handler',
    'https://your-n8n-instance.app.n8n.cloud/webhook/recurring',
    'recurring',
    'Handles scheduled recurring research requests',
    true
  )
ON CONFLICT (type) DO UPDATE
SET 
  active = true,
  updated_at = NOW();

-- Step 6: Verify setup
SELECT 
  name, 
  type, 
  active,
  CASE 
    WHEN url LIKE '%your-n8n-instance%' THEN '⚠️  CONFIGURE URL IN SETTINGS'
    ELSE '✅ Configured'
  END as status
FROM public.webhooks
ORDER BY type;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. All webhooks are now ACTIVE by default
-- 2. Existing users will automatically use database webhooks
-- 3. Admins can manage webhooks in Settings page
-- 4. Update webhook URLs in Settings after running this script
-- ============================================

