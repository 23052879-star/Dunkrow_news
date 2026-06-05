/*
  # Add Buffer retry backoff controls

  Track retry attempts separately from article updated_at so temporary Buffer
  rate limits do not cause aggressive repeated retries.
*/

ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS social_post_attempted_at timestamptz,
ADD COLUMN IF NOT EXISTS social_post_attempt_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_post_next_retry_at timestamptz;

SELECT cron.unschedule('retry-failed-buffer-posts')
WHERE EXISTS (
  SELECT 1
  FROM cron.job
  WHERE jobname = 'retry-failed-buffer-posts'
);

SELECT cron.schedule(
  'retry-failed-buffer-posts',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ylnqunxfvyqyujuddngs.supabase.co/functions/v1/post-to-buffer',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'type', 'RETRY',
      'schema', 'public',
      'table', 'articles',
      'record', jsonb_build_object('id', id),
      'old_record', NULL
    )
  )
  FROM public.articles
  WHERE published IS TRUE
    AND social_posted_at IS NULL
    AND social_post_error IS NOT NULL
    AND coalesce(social_post_next_retry_at, now()) <= now()
  ORDER BY coalesce(social_post_next_retry_at, created_at) ASC
  LIMIT 1;
  $$
);
