-- ===================================================================
-- MIGRATION: Fix NULL user_id in reports table
-- ===================================================================
-- Purpose: Assign all reports with NULL user_id to a specific user
-- Run this ONCE in Supabase SQL Editor after identifying the user
-- ===================================================================

-- STEP 1: Find your user_id
-- Run this first to get your user ID:
SELECT 
  id as user_id, 
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Copy the user_id from the result above

-- ===================================================================

-- STEP 2: Update NULL user_ids (REPLACE 'YOUR-USER-ID-HERE' with actual ID)
-- This will assign all orphaned reports to the specified user

UPDATE public.reports
SET user_id = 'YOUR-USER-ID-HERE'  -- ← REPLACE THIS!
WHERE user_id IS NULL;

-- ===================================================================

-- STEP 3: Verify the update
-- Check how many reports now have a user_id

SELECT 
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as reports_with_user,
  COUNT(*) FILTER (WHERE user_id IS NULL) as reports_without_user,
  COUNT(*) as total_reports
FROM public.reports;

-- ===================================================================

-- STEP 4: (Optional) If you have multiple users and want to distribute reports
-- Only run this if you need more sophisticated logic

-- Example: Assign based on email in reports table
-- UPDATE public.reports r
-- SET user_id = (
--   SELECT id FROM auth.users u 
--   WHERE u.email = r.email 
--   LIMIT 1
-- )
-- WHERE r.user_id IS NULL AND r.email IS NOT NULL;

-- ===================================================================

-- STEP 5: View reports by user
-- See how reports are distributed across users

SELECT 
  COALESCE(user_id::text, 'NULL') as user_id,
  COUNT(*) as report_count,
  MAX(run_at) as latest_report
FROM public.reports
GROUP BY user_id
ORDER BY report_count DESC;

-- ===================================================================
-- NOTES:
-- - This script is safe to run multiple times
-- - It only updates rows where user_id is currently NULL
-- - After running, refresh your application to see all reports
-- ===================================================================

