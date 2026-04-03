-- Grant platform admin in public.users (matches app isUserPlatformAdmin / RLS expectations).
-- Safe if row missing: updates 0 rows; JWT allowlist in code still applies for that email.

UPDATE public.users
SET
  role = 'admin',
  updated_at = now()
WHERE lower(trim(email)) = lower(trim('kaytoba49@gmail.com'));
