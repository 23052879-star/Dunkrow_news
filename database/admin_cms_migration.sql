-- =============================================================
-- DUNKROW CMS - ADMIN PANEL FULL MIGRATION
-- Run this in your Supabase SQL Editor to create all CMS tables
-- =============================================================

-- ---------------------------------------------------------------
-- 1. EXTEND PROFILES TABLE (add missing columns)
-- ---------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add role column only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
      CHECK (role IN ('admin', 'editor', 'reporter', 'contributor', 'user'));
  END IF;
END $$;

-- ---------------------------------------------------------------
-- 2. ARTICLES TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  read_time INTEGER DEFAULT 3,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist in case the table already existed
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 3;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- ---------------------------------------------------------------
-- 3. WEEKEND WHISPERS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekend_whispers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled'));
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.weekend_whispers ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- ---------------------------------------------------------------
-- 4. JOKES & TRIVIA TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jokes_trivia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'joke' CHECK (type IN ('joke', 'trivia')),
  content TEXT NOT NULL,
  punchline TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (especially is_active, which was missing in original schema)
ALTER TABLE public.jokes_trivia ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.jokes_trivia ADD COLUMN IF NOT EXISTS punchline TEXT;
ALTER TABLE public.jokes_trivia ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE public.jokes_trivia ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.jokes_trivia ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- ---------------------------------------------------------------
-- 5. POLLS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------------
-- 6. SECTIONS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  icon TEXT DEFAULT 'Layers',
  color TEXT DEFAULT '#EF4444',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------------
-- 7. ADVERTISEMENTS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'banner'
    CHECK (type IN ('banner', 'sidebar', 'in-article', 'sponsored')),
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  position TEXT DEFAULT 'homepage-top',
  is_active BOOLEAN DEFAULT TRUE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.advertisements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------------
-- 8. MEDIA LIBRARY TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  folder TEXT DEFAULT 'uploads',
  tags TEXT[] DEFAULT '{}',
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 9. NEWSLETTER SUBSCRIPTIONS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website'
);

ALTER TABLE public.newsletter_subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ---------------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'publish', 'health', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 11. ARTICLE ANALYTICS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.article_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_read_time INTEGER DEFAULT 0,
  UNIQUE(article_id, date)
);

-- ---------------------------------------------------------------
-- 12. COMMENTS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- ---------------------------------------------------------------
-- 13. SEO SETTINGS TABLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  og_image TEXT,
  keywords TEXT[],
  no_index BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 14. SEED DEFAULT SECTIONS
-- ---------------------------------------------------------------
INSERT INTO public.sections (name, slug, description, display_order, is_active, icon, color)
VALUES
  ('Top Stories',     'top-stories',     'Breaking news and featured headlines',          1, true, 'Flame',         '#EF4444'),
  ('Politics',        'politics',        'National and international political affairs',   2, true, 'Landmark',      '#3B82F6'),
  ('Business',        'business',        'Finance, economy and market analysis',           3, true, 'TrendingUp',    '#10B981'),
  ('Technology',      'technology',      'Tech news, AI, gadgets and digital trends',      4, true, 'Cpu',           '#8B5CF6'),
  ('Sports',          'sports',          'Cricket, football, and all sporting events',     5, true, 'Trophy',        '#F59E0B'),
  ('Entertainment',   'entertainment',   'Movies, music, celebrities and culture',         6, true, 'Clapperboard',  '#EC4899'),
  ('Weekend Whispers','weekend-whispers','Weekend editorial and opinion columns',           7, true, 'MessageSquare', '#06B6D4'),
  ('Jokes & Trivia',  'jokes-trivia',    'Humor, fun facts and trivia',                    8, true, 'Smile',         '#84CC16')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------
-- 15. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------
ALTER TABLE public.articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekend_whispers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jokes_trivia          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analytics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings          ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- 16. RLS POLICIES  (drop first to avoid duplicate errors)
-- ---------------------------------------------------------------

-- articles
DROP POLICY IF EXISTS "articles_public_read"  ON public.articles;
DROP POLICY IF EXISTS "admin_all_articles"     ON public.articles;
CREATE POLICY "articles_public_read" ON public.articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_articles" ON public.articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- weekend_whispers
DROP POLICY IF EXISTS "whispers_public_read" ON public.weekend_whispers;
DROP POLICY IF EXISTS "admin_all_whispers"   ON public.weekend_whispers;
CREATE POLICY "whispers_public_read" ON public.weekend_whispers
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_whispers" ON public.weekend_whispers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- jokes_trivia
DROP POLICY IF EXISTS "jokes_public_read" ON public.jokes_trivia;
DROP POLICY IF EXISTS "admin_all_jokes"   ON public.jokes_trivia;
CREATE POLICY "jokes_public_read" ON public.jokes_trivia
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_jokes" ON public.jokes_trivia
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- polls
DROP POLICY IF EXISTS "polls_public_read" ON public.polls;
DROP POLICY IF EXISTS "admin_all_polls"   ON public.polls;
CREATE POLICY "polls_public_read" ON public.polls
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_polls" ON public.polls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- sections
DROP POLICY IF EXISTS "sections_public_read" ON public.sections;
DROP POLICY IF EXISTS "admin_all_sections"   ON public.sections;
CREATE POLICY "sections_public_read" ON public.sections
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_sections" ON public.sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- advertisements
DROP POLICY IF EXISTS "ads_public_read"  ON public.advertisements;
DROP POLICY IF EXISTS "admin_all_ads"    ON public.advertisements;
CREATE POLICY "ads_public_read" ON public.advertisements
  FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_ads" ON public.advertisements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- media
DROP POLICY IF EXISTS "media_public_read" ON public.media;
DROP POLICY IF EXISTS "admin_all_media"   ON public.media;
CREATE POLICY "media_public_read" ON public.media
  FOR SELECT USING (true);
CREATE POLICY "admin_all_media" ON public.media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- newsletter_subscriptions
DROP POLICY IF EXISTS "admin_all_newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "admin_all_newsletter" ON public.newsletter_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- notifications
DROP POLICY IF EXISTS "admin_all_notifications" ON public.notifications;
DROP POLICY IF EXISTS "own_notifications"        ON public.notifications;
CREATE POLICY "admin_all_notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "own_notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- article_analytics
DROP POLICY IF EXISTS "admin_all_analytics" ON public.article_analytics;
CREATE POLICY "admin_all_analytics" ON public.article_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- comments
DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
DROP POLICY IF EXISTS "admin_all_comments"   ON public.comments;
DROP POLICY IF EXISTS "own_comment_insert"   ON public.comments;
CREATE POLICY "comments_public_read" ON public.comments
  FOR SELECT USING (status = 'approved');
CREATE POLICY "admin_all_comments" ON public.comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "own_comment_insert" ON public.comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- seo_settings
DROP POLICY IF EXISTS "admin_all_seo" ON public.seo_settings;
CREATE POLICY "admin_all_seo" ON public.seo_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---------------------------------------------------------------
-- 17. SET ADMIN ROLE for dunkrow21@gmail.com
-- ---------------------------------------------------------------
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'dunkrow21@gmail.com'
);

-- ---------------------------------------------------------------
-- 18. HELPER FUNCTION: increment article views
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id UUID, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.article_analytics (article_id, date, views)
  VALUES (p_article_id, p_date, 1)
  ON CONFLICT (article_id, date)
  DO UPDATE SET views = public.article_analytics.views + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- Done! All Dunkrow CMS tables are ready.
-- ---------------------------------------------------------------
