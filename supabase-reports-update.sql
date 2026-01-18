-- ============================================
-- UPDATE REPORTS TABLE FOR ON-DEMAND SUPPORT
-- ============================================
-- Run this in Supabase SQL Editor to add missing columns

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add email column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reports' AND column_name='email') THEN
    ALTER TABLE reports ADD COLUMN email TEXT;
  END IF;

  -- Add geography column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reports' AND column_name='geography') THEN
    ALTER TABLE reports ADD COLUMN geography TEXT DEFAULT 'Global';
  END IF;

  -- Add notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reports' AND column_name='notes') THEN
    ALTER TABLE reports ADD COLUMN notes TEXT;
  END IF;

  -- Add email_report column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reports' AND column_name='email_report') THEN
    ALTER TABLE reports ADD COLUMN email_report TEXT;
  END IF;

  -- Add status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='reports' AND column_name='status') THEN
    ALTER TABLE reports ADD COLUMN status TEXT DEFAULT 'success';
  END IF;
END $$;

-- Make schedule_id nullable for on-demand reports
ALTER TABLE reports ALTER COLUMN schedule_id DROP NOT NULL;

-- Update existing reports to set default values
UPDATE reports 
SET geography = 'Global' 
WHERE geography IS NULL;

UPDATE reports 
SET status = 'success' 
WHERE status IS NULL;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_email ON reports(email);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Reports table updated successfully for on-demand reports!' as message;

