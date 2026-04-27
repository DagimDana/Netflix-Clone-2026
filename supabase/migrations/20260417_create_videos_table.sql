/*
  # Create videos table for Video Management

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `synopsis` (text)
      - `release_year` (integer)
      - `duration_mins` (integer)
      - `status` (text: 'draft', 'published', 'archived')
      - `age_rating` (text: 'G', 'PG', 'PG-13', 'R', 'NC-17')
      - `cover_url` (text)
      - `views` (integer, default 0)
      - `is_featured` (boolean, default false)
      - `is_trending` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `videos` table
    - Allow authenticated users to read, insert, update videos
    - Allow authenticated users to delete videos

  3. Sample Data
    - Insert sample video entries
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  synopsis text DEFAULT '',
  release_year integer DEFAULT 2024,
  duration_mins integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  age_rating text DEFAULT 'PG-13' CHECK (age_rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17')),
  cover_url text DEFAULT '',
  views integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anon users can read videos"
  ON videos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert videos"
  ON videos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update videos"
  ON videos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete videos"
  ON videos FOR DELETE
  TO anon
  USING (true);

INSERT INTO videos (title, synopsis, release_year, duration_mins, status, age_rating, cover_url, views, is_featured, is_trending) VALUES
  ('Nature Calls: The Documentary', 'An breathtaking nature documentary series exploring the world''s most remote ecosystems and wildlife.', 2024, 180, 'published', 'G', 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?w=200', 4, true, true),
  ('The Perfect Heist', 'A clever caper film about a group of skilled thieves planning the most elaborate robbery in history.', 2023, 132, 'published', 'PG-13', 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?w=200', 7, true, true),
  ('Cosmic Voyager', 'A visually stunning space opera following humanity''s first intergalactic mission to a distant star system.', 2024, 145, 'published', 'PG', 'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?w=200', 3, false, true),
  ('Shadow Protocol', 'A pulse-pounding thriller about a rogue intelligence agent uncovering a global conspiracy.', 2023, 118, 'draft', 'R', 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?w=200', 0, false, false),
  ('The Last Garden', 'A heartwarming story about a botanist who discovers a secret garden with extraordinary properties.', 2024, 105, 'published', 'G', 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?w=200', 5, true, false),
  ('Neon Nights', 'A neo-noir detective story set in a rain-soaked cyberpunk city of the future.', 2023, 122, 'archived', 'R', 'https://images.pexels.com/photos/1480690/pexels-photo-1480690.jpeg?w=200', 2, false, false),
  ('Ocean Deep', 'Explore the mysterious depths of Earth''s oceans in this breathtaking underwater documentary.', 2024, 95, 'published', 'G', 'https://images.pexels.com/photos/932538/pexels-photo-932538.jpeg?w=200', 1, true, true),
  ('The Iron Dynasty', 'An epic historical drama spanning three generations of a powerful medieval empire.', 2023, 210, 'draft', 'PG-13', 'https://images.pexels.com/photos/2363608/pexels-photo-2363608.jpeg?w=200', 0, false, false);
