/*
  # Add categories and sample content

  1. Changes
    - Add categories table
    - Add sample whispers
    - Add sample jokes and trivia
    - Add category references to articles

  2. Security
    - Enable RLS on categories table
    - Add policies for reading categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add category_id to articles
ALTER TABLE articles ADD COLUMN category_id uuid REFERENCES categories(id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Politics', 'politics', 'Latest political news and updates'),
  ('Technology', 'technology', 'Tech news and innovations'),
  ('Business', 'business', 'Business and economic updates'),
  ('Sports', 'sports', 'Sports news and coverage'),
  ('Entertainment', 'entertainment', 'Entertainment and celebrity news'),
  ('Science', 'science', 'Scientific discoveries and research'),
  ('Health', 'health', 'Health and wellness news');

-- Insert sample whispers
INSERT INTO whispers (title, content, featured_image, published) VALUES
  (
    'Tech Giant''s Secret Project Revealed',
    'Sources close to Silicon Valley''s biggest tech company reveal a groundbreaking AR project that could revolutionize how we interact with digital content. The project, codenamed "Phoenix", has been in development for over three years and is expected to be announced next quarter.',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    true
  ),
  (
    'Hollywood''s Next Power Couple',
    'Industry insiders are buzzing about an unexpected romance blooming between two A-list stars on the set of an upcoming blockbuster. The pair have been spotted together at various private events, though their representatives maintain they''re "just good friends."',
    'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    true
  );

-- Insert sample jokes and trivia
INSERT INTO jokes_trivia (content, type, published) VALUES
  (
    'Why don''t programmers like nature? It has too many bugs!',
    'joke',
    true
  ),
  (
    'What did the grape say when it got stepped on? Nothing, it just let out a little wine!',
    'joke',
    true
  ),
  (
    'The first computer mouse was made of wood and invented by Doug Engelbart in the 1960s.',
    'trivia',
    true
  ),
  (
    'The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.',
    'trivia',
    true
  );