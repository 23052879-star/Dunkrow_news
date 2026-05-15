-- Dunkrow Database Setup Script
-- This script sets up the entire schema and populates it with categories and Indian news data.
-- RUN THIS in the Supabase SQL Editor.

-- 1. CLEANUP (Optional - only use if starting fresh)
-- DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
-- DROP TABLE IF EXISTS jokes_trivia CASCADE;
-- DROP TABLE IF EXISTS whispers CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS articles CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  bio text,
  website text,
  location text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  featured_image text NOT NULL,
  category text NOT NULL,
  category_id uuid REFERENCES categories(id),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  published boolean DEFAULT false,
  slug text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  featured_image text NOT NULL,
  published boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS jokes_trivia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  type text CHECK (type IN ('joke', 'trivia')) NOT NULL,
  published boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- 3. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes_trivia ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- Profiles
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Categories
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);

-- Articles
CREATE POLICY "Anyone can read published articles" ON articles FOR SELECT USING (published = true);
CREATE POLICY "Authors can CRUD their own articles" ON articles FOR ALL TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can CRUD all articles" ON articles FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Comments
CREATE POLICY "Anyone can read approved comments" ON comments FOR SELECT USING (approved = true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own comments" ON comments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can CRUD all comments" ON comments FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Whispers
CREATE POLICY "Anyone can read published whispers" ON whispers FOR SELECT USING (published = true);
CREATE POLICY "Admins can CRUD all whispers" ON whispers FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Jokes/Trivia
CREATE POLICY "Anyone can read published jokes/trivia" ON jokes_trivia FOR SELECT USING (published = true);
CREATE POLICY "Admins can CRUD all jokes/trivia" ON jokes_trivia FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view all newsletter subscriptions" ON newsletter_subscriptions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Auto-profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- 1. Try to get username from metadata (common for email signup)
  base_username := NEW.raw_user_meta_data->>'username';
  
  -- 2. If missing, try full_name or name (common for Google/GitHub)
  IF base_username IS NULL THEN
    base_username := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  END IF;
  
  -- 3. If still missing, use email prefix
  IF base_username IS NULL THEN
    base_username := split_part(NEW.email, '@', 1);
  END IF;
  
  -- 4. Final fallback
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user';
  END IF;

  -- 5. SANITIZE: Lowercase and remove/replace invalid characters (keep a-z0-9 and _)
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '_', 'g'));
  -- Remove multiple underscores and trim
  base_username := regexp_replace(base_username, '_+', '_', 'g');
  base_username := trim(both '_' from base_username);
  
  IF base_username = '' THEN
    base_username := 'user';
  END IF;
  
  final_username := base_username;
  
  -- 6. HANDLE CONFLICTS
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  -- 7. INSERT with ON CONFLICT for extra safety
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      'https://ui-avatars.com/api/?name=' || final_username || '&background=random'
    ),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger (drop first to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 6. SEED DATA
-- Insert Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Politics', 'politics', 'Latest political news and updates'),
  ('Technology', 'technology', 'Tech news and innovations'),
  ('Business', 'business', 'Business and economic updates'),
  ('Sports', 'sports', 'Sports news and coverage'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news'),
  ('Science', 'science', 'Scientific discoveries and research'),
  ('Health', 'health', 'Health and wellness news')
ON CONFLICT (name) DO NOTHING;

-- Insert Indian Trending News (Linked to Categories)
INSERT INTO articles (title, slug, excerpt, content, category, published, featured_image) VALUES
  ('Indias Tech Sector Sees 15% Growth Driven by AI Adoption', 'india-tech-growth-ai', 'The Indian IT industry experiences a significant surge in growth as major firms rapidly adopt and export artificial intelligence solutions globally.', 'The Indian technology sector has recorded a robust 15% growth in the last quarter, primarily driven by the rapid adoption and integration of Artificial Intelligence (AI). Industry leaders attribute this surge to increased global demand for AI-driven analytics, automation, and machine learning models developed by Indian tech hubs in Bengaluru, Hyderabad, and Pune. Major IT conglomerates have announced massive upskilling programs to train over 500,000 employees in generative AI technologies by the end of the year.', 'Technology', true, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('ISRO Announces Next Generation Lunar Mission Chandrayaan-4', 'isro-chandrayaan-4-mission', 'Following the historic success of Chandrayaan-3, ISRO reveals plans for an ambitious lunar sample-return mission slated for 2028.', 'The Indian Space Research Organisation (ISRO) has officially unveiled the conceptual framework for Chandrayaan-4, its most ambitious lunar mission to date. Scheduled for launch in 2028, the primary objective of this mission is to collect lunar soil and rock samples from the Moons South Pole and bring them back to Earth for comprehensive scientific analysis. This complex mission will involve multiple launches and orbital docking procedures.', 'Science', true, 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('Sensex Hits Record High Amid Strong Quarterly Corporate Earnings', 'sensex-record-high-india', 'Indian stock markets rally to unprecedented levels as major banks and FMCG companies report better-than-expected quarterly profits.', 'The BSE Sensex and NSE Nifty reached new lifetime highs today, fueled by a wave of exceptional quarterly earnings reports from leading Indian corporations. The banking sector led the rally, with major private and public sector banks reporting significant margin improvements and reduced non-performing assets.', 'Business', true, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('India Secures Historic Series Victory Against Australia in Perth', 'india-victory-perth-cricket', 'A brilliant century by the Indian captain leads the national cricket team to a dramatic final-day victory, securing the Border-Gavaskar Trophy.', 'In what is being hailed as one of the greatest overseas test matches in cricket history, India secured a thrilling 4-wicket victory against Australia at the challenging Perth stadium. Chasing a formidable target of 328 on the final day, the Indian captain delivered a masterclass innings, scoring an unbeaten 115 under immense pressure.', 'Sports', true, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('New Electric Vehicle Subsidy Policy Announced for Tier-2 Cities', 'india-ev-subsidy-tier2', 'The central government rolls out the FAME-III scheme with a massive focus on accelerating electric vehicle adoption in emerging Indian cities.', 'In a major push towards green mobility, the Ministry of Heavy Industries has announced the FAME-III (Faster Adoption and Manufacturing of Electric Vehicles) policy. Unlike previous iterations, this massive ₹10,000 crore subsidy scheme specifically targets Tier-2 and Tier-3 cities.', 'Politics', true, 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('Indian Cinema Sweeps Major Awards at Cannes Film Festival', 'indian-cinema-cannes-success', 'Two independent Indian films win prestigious awards at Cannes, highlighting the global rise of regional Indian storytelling.', 'It was a historic night for Indian cinema at the 77th Cannes Film Festival, as two independent features secured top honors. A gritty Malayalam drama exploring social hierarchies won the Grand Prix, while a visually stunning Assamese short film took home the Palme d Or for Short Films.', 'Entertainment', true, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('New National Health Initiative Targets Eradication of TB by 2027', 'india-tb-eradication-2027', 'The Ministry of Health launches an aggressive, tech-enabled tracking and treatment program to eliminate TB three years ahead of the global target.', 'The Government of India has launched the TB Mukt Bharat (TB-Free India) 2.0 initiative, an aggressive nationwide campaign aiming to eradicate Tuberculosis by 2027—three years ahead of the World Health Organizations global target.', 'Health', true, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (slug) DO NOTHING;
