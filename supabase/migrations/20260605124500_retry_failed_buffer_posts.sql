/*
  # Retry failed Buffer posts

  Buffer can temporarily reject queue requests with a per-client rate limit.
  This cron retries failed, unpublished-to-social articles after the rate limit
  window has had time to cool down.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('retry-failed-buffer-posts')
WHERE EXISTS (
  SELECT 1
  FROM cron.job
  WHERE jobname = 'retry-failed-buffer-posts'
);

SELECT cron.schedule(
  'retry-failed-buffer-posts',
  '*/15 * * * *',
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
    AND updated_at < now() - interval '15 minutes'
  ORDER BY updated_at ASC
  LIMIT 3;
  $$
);
