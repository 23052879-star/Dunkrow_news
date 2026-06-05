/*
  # Queue published articles to Buffer automatically

  This replaces the manual dashboard webhook setup with a database trigger
  that calls the post-to-buffer Edge Function whenever an article is inserted
  or transitions into the published state.
*/

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.queue_article_buffer_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  buffer_function_url text := 'https://ylnqunxfvyqyujuddngs.supabase.co/functions/v1/post-to-buffer';
BEGIN
  IF NEW.published IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := buffer_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_queue_article_buffer_post ON public.articles;

DROP TRIGGER IF EXISTS trigger_queue_article_buffer_post_insert ON public.articles;
CREATE TRIGGER trigger_queue_article_buffer_post_insert
  AFTER INSERT ON public.articles
  FOR EACH ROW
  WHEN (NEW.published IS TRUE)
  EXECUTE FUNCTION public.queue_article_buffer_post();

DROP TRIGGER IF EXISTS trigger_queue_article_buffer_post_update ON public.articles;
CREATE TRIGGER trigger_queue_article_buffer_post_update
  AFTER UPDATE OF published, status ON public.articles
  FOR EACH ROW
  WHEN (NEW.published IS TRUE AND OLD.published IS DISTINCT FROM TRUE)
  EXECUTE FUNCTION public.queue_article_buffer_post();
