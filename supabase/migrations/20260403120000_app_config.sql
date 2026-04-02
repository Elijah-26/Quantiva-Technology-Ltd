-- Platform key-value config (service role / admin API only; no user RLS policies)

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_config IS 'Platform settings; updated via admin API using service role';
COMMENT ON COLUMN public.app_config.key IS 'e.g. scheduled_library for cron document batch size';

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
