-- ============================================
-- FIX: Change default user role from 'admin' to 'user'
-- ============================================
-- Run this in Supabase SQL Editor
-- This ensures new signups default to 'user' role for security

-- STEP 1: Change the default value for the role column
ALTER TABLE public.users 
ALTER COLUMN role SET DEFAULT 'user';

-- STEP 2: Update the trigger function to explicitly set role as 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, company_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    'user', -- Explicitly set as 'user' role for security
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Verify the change
SELECT column_name, column_default, data_type
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'role';

-- STEP 4: Test by checking what role a new user would get
SELECT 
  'New users will default to role:' as info,
  column_default as default_role
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';

-- ============================================
-- NOTES:
-- ✅ Existing users keep their current roles
-- ✅ New signups will automatically be 'user'
-- ✅ Admins can still promote users to admin via Settings
-- ✅ Super admin (pat2echo@gmail.com) keeps admin role
-- ============================================

