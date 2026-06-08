-- Recreate the queue_article_buffer_post function to be fully fault-tolerant.
-- It now uses a TRY-CATCH block (EXCEPTION WHEN OTHERS) and checks for the 
-- existence of the pg_net schema dynamically via EXECUTE. This prevents any 
-- failure in Buffer integration, pg_net, or edge function calls from blocking 
-- the publishing or editing of articles in Dunkrow.

CREATE OR REPLACE FUNCTION public.queue_article_buffer_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  buffer_function_url text := 'https://ylnqunxfvyqyujuddngs.supabase.co/functions/v1/post-to-buffer';
  has_net_schema boolean;
BEGIN
  IF NEW.published IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- 1. Dynamically check if the pg_net extension (net schema) is installed
  SELECT EXISTS (
    SELECT 1 FROM pg_namespace WHERE nspname = 'net'
  ) INTO has_net_schema;

  IF NOT has_net_schema THEN
    RAISE WARNING 'pg_net extension (schema "net") is not installed. Skipping Buffer post queueing.';
    RETURN NEW;
  END IF;

  -- 2. Call the edge function asynchronously inside a safe try-catch block
  BEGIN
    EXECUTE 'SELECT net.http_post(
      url := $1,
      headers := $2,
      body := $3
    )' USING 
      buffer_function_url,
      jsonb_build_object('Content-Type', 'application/json'),
      jsonb_build_object(
        'type', TG_OP,
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'record', to_jsonb(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
      );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error as a PG warning but DO NOT fail the main transaction
    RAISE WARNING 'Failed to queue article to Buffer: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;
