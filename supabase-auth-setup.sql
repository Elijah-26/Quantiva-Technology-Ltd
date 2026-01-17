-- ============================================
-- ENABLE SUPABASE AUTH
-- ============================================

-- This SQL enables Supabase authentication for your project
-- Run this in Supabase SQL Editor

-- Create a function to handle new user signups
-- This automatically creates a profile entry when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATE USERS TABLE
-- ============================================

-- Add auth_id column if not exists (maps to auth.users.id)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='id' 
                 AND data_type='uuid') THEN
    -- If id column exists but is not UUID, we need to recreate
    ALTER TABLE users DROP COLUMN IF EXISTS id;
    ALTER TABLE users ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Update users table to match auth requirements
ALTER TABLE users
  ALTER COLUMN email SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- UPDATE ROW LEVEL SECURITY POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new policies that work with Supabase Auth
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all users
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Supabase Auth configuration complete!' as message;

