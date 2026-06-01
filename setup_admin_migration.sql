-- SQL MIGRATION FOR DUNKROW CMS ADMIN PANEL
-- Run this script in the Supabase SQL Editor.

-- 1. UPGRADE PROFILES ROLE AND BANNED FIELD
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'reporter', 'contributor', 'user'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;

-- 2. CREATE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  icon text DEFAULT 'layers',
  color text DEFAULT '#EF4444',
  created_at timestamptz DEFAULT now()
);

-- Seed some default sections if they don't exist
INSERT INTO public.sections (name, slug, description, display_order, icon, color) VALUES
  ('Campus News', 'campus-news', 'News from around the campus', 1, 'school', '#3B82F6'),
  ('Sports', 'sports', 'Sports events and match updates', 2, 'trophy', '#10B981'),
  ('Technology', 'technology', 'Latest tech trends and student projects', 3, 'cpu', '#8B5CF6'),
  ('Weekend Whispers', 'weekend-whispers', 'Weekly rumors, gossip, and light content', 4, 'message-circle', '#F59E0B'),
  ('Jokes & Trivia', 'jokes-trivia', 'Lighthearted entertainment and facts', 5, 'smile', '#EC4899'),
  ('Startup Stories', 'startup-stories', 'Student entrepreneurship journeys', 6, 'rocket', '#EF4444'),
  ('Placement Diaries', 'placement-diaries', 'Career advice and interview experiences', 7, 'briefcase', '#14B8A6'),
  ('Faculty Corner', 'faculty-corner', 'Interviews and columns by professors', 8, 'award', '#6366F1'),
  ('Student Spotlight', 'student-spotlight', 'Celebrating exceptional student achievements', 9, 'star', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- 3. UPGRADE ARTICLES TABLE
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS og_image text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_save_content text;

-- Sync the published boolean with status column for backward compatibility
UPDATE public.articles SET status = 'published' WHERE published = true AND status = 'draft';
UPDATE public.articles SET status = 'draft' WHERE published = false AND status = 'draft';

-- Create a trigger or function to sync status and published
CREATE OR REPLACE FUNCTION sync_article_status_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    NEW.published := true;
  ELSE
    NEW.published := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_article_status ON public.articles;
CREATE TRIGGER trigger_sync_article_status
  BEFORE INSERT OR UPDATE OF status ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION sync_article_status_published();

-- 4. CREATE TAGS AND ARTICLE_TAGS TABLES
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Seed some default tags
INSERT INTO public.tags (name, slug) VALUES
  ('Campus', 'campus'),
  ('Placement', 'placement'),
  ('Coding', 'coding'),
  ('Sports', 'sports'),
  ('Interview', 'interview'),
  ('Tech', 'tech'),
  ('Alumni', 'alumni'),
  ('Exam', 'exam')
ON CONFLICT (slug) DO NOTHING;

-- 5. CREATE MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  folder text DEFAULT 'uploads',
  tags text[] DEFAULT '{}',
  alt_text text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. CREATE ADVERTISEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text CHECK (type IN ('banner', 'sidebar', 'in-article', 'sponsored')) NOT NULL,
  image_url text NOT NULL,
  target_url text NOT NULL,
  position text DEFAULT 'homepage-top',
  is_active boolean DEFAULT true,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 7. CREATE POLLS TABLE
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of {id, text, votes}
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- 8. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('comment', 'publish', 'health', 'alert')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 9. CREATE ARTICLE_ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.article_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  shares integer DEFAULT 0,
  avg_read_time float DEFAULT 0.0,
  date date DEFAULT current_date,
  UNIQUE (article_id, date)
);

-- 10. CREATE HOMEPAGE_CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  section_order jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of section slugs
  pinned_articles jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of article IDs
  featured_article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  breaking_news text,
  editors_picks jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of article IDs
  updated_at timestamptz DEFAULT now()
);

-- Seed a default homepage config
INSERT INTO public.homepage_config (id, section_order, pinned_articles, breaking_news)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, '["campus-news", "sports", "technology", "weekend-whispers"]'::jsonb, '[]'::jsonb, 'Welcome to the new Dunkrow News CMS!')
ON CONFLICT (id) DO NOTHING;

-- 11. ENABLE RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- 12. CREATE POLICIES

-- Helper functions for role checks
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'editor', 'reporter', 'contributor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sections policies
DROP POLICY IF EXISTS "Anyone can view sections" ON public.sections;
CREATE POLICY "Anyone can view sections" ON public.sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can write sections" ON public.sections;
CREATE POLICY "Only admin can write sections" ON public.sections FOR ALL TO authenticated 
USING (public.is_admin(auth.uid()));

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage tags" ON public.tags;
CREATE POLICY "Staff can manage tags" ON public.tags FOR ALL TO authenticated
USING (public.is_staff(auth.uid()));

-- Article Tags policies
DROP POLICY IF EXISTS "Anyone can view article tags" ON public.article_tags;
CREATE POLICY "Anyone can view article tags" ON public.article_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage article tags" ON public.article_tags;
CREATE POLICY "Staff can manage article tags" ON public.article_tags FOR ALL TO authenticated
USING (public.is_staff(auth.uid()));

-- Media policies
DROP POLICY IF EXISTS "Anyone can view media" ON public.media;
CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can upload and manage media" ON public.media;
CREATE POLICY "Staff can upload and manage media" ON public.media FOR ALL TO authenticated
USING (public.is_staff(auth.uid()));

-- Advertisements policies
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.advertisements;
CREATE POLICY "Anyone can view active ads" ON public.advertisements FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin and Editor can manage ads" ON public.advertisements;
CREATE POLICY "Admin and Editor can manage ads" ON public.advertisements FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Polls policies
DROP POLICY IF EXISTS "Anyone can view active polls" ON public.polls;
CREATE POLICY "Anyone can view active polls" ON public.polls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage polls" ON public.polls;
CREATE POLICY "Staff can manage polls" ON public.polls FOR ALL TO authenticated
USING (public.is_staff(auth.uid()));

-- Notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage notifications" ON public.notifications;
CREATE POLICY "Staff can manage notifications" ON public.notifications FOR ALL TO authenticated
USING (public.is_staff(auth.uid()));

-- Article Analytics policies
DROP POLICY IF EXISTS "Staff can read article analytics" ON public.article_analytics;
CREATE POLICY "Staff can read article analytics" ON public.article_analytics FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "System can write analytics" ON public.article_analytics;
CREATE POLICY "System can write analytics" ON public.article_analytics FOR ALL USING (true);

-- Homepage Config policies
DROP POLICY IF EXISTS "Anyone can read homepage config" ON public.homepage_config;
CREATE POLICY "Anyone can read homepage config" ON public.homepage_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin and Editor can manage homepage config" ON public.homepage_config;
CREATE POLICY "Admin and Editor can manage homepage config" ON public.homepage_config FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 13. SET ADMIN ROLE FOR DUNKROW EMAIL
-- The user role is set to admin when their profile is created or updated
-- Let's make a trigger on auth.users to automatically set role='admin' if email matches dunkrow21@gmail.com
CREATE OR REPLACE FUNCTION public.handle_admin_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'dunkrow21@gmail.com' THEN
    -- Update role in profiles
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_assign_admin_role ON auth.users;
CREATE TRIGGER trigger_assign_admin_role
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_role_assignment();

-- Manually run profile role update in case the user is already signed up
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'dunkrow21@gmail.com';
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, avatar_url, role)
    VALUES (v_user_id, 'deepraj', 'https://ui-avatars.com/api/?name=Deepraj&background=random', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$;
