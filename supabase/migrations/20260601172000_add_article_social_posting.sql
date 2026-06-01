/*
  # Add social posting tracking to articles

  These columns stop the same published article from being sent to Buffer
  more than once and keep the Buffer post ids for debugging.
*/

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS social_posted_at timestamptz,
ADD COLUMN IF NOT EXISTS social_post_ids jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_post_error text;
