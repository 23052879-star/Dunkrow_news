/*
  # Initial database schema for Dunkrow News Website

  1. New Tables
    - `profiles` - User profiles with roles (admin/user)
    - `articles` - News articles with metadata
    - `comments` - User comments on articles (requires approval)
    - `whispers` - Weekend whispers content
    - `jokes_trivia` - Daily jokes and trivia content

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
    - Set up authentication rules
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  featured_image text NOT NULL,
  category text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  published boolean DEFAULT false,
  slug text UNIQUE NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false
);

-- Create whispers table
CREATE TABLE IF NOT EXISTS whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  content text NOT NULL,
  featured_image text NOT NULL,
  published boolean DEFAULT false
);

-- Create jokes_trivia table
CREATE TABLE IF NOT EXISTS jokes_trivia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  content text NOT NULL,
  type text CHECK (type IN ('joke', 'trivia')) NOT NULL,
  published boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes_trivia ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Articles policies
CREATE POLICY "Anyone can read published articles"
  ON articles FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can CRUD their own articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can CRUD all articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comments policies
CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  USING (approved = true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own comments"
  ON comments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Whispers policies
CREATE POLICY "Anyone can read published whispers"
  ON whispers FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can CRUD all whispers"
  ON whispers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Jokes/Trivia policies
CREATE POLICY "Anyone can read published jokes/trivia"
  ON jokes_trivia FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can CRUD all jokes/trivia"
  ON jokes_trivia
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- Function to handle new user signup and create a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || split_part(NEW.email, '@', 1) || '&background=random'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();