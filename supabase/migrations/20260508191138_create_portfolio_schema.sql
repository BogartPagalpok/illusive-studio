/*
  # Create Portfolio Schema

  1. New Tables
    - `site_content`
      - `id` (uuid, primary key)
      - `section` (text) - which section the content belongs to (hero, services, about, contact)
      - `key` (text) - the content key/label
      - `value` (text) - the content value
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `portfolio_projects`
      - `id` (uuid, primary key)
      - `title` (text) - project title
      - `category` (text) - project category (Brand Identity, Photography, etc.)
      - `description` (text) - project description
      - `process` (text) - creative process details
      - `tools` (text array) - tools used
      - `results` (text) - results achieved
      - `image_url` (text) - image URL (Supabase storage or external)
      - `featured` (boolean) - whether to show on homepage
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admin users to perform all operations
    - Add policies for public read access on both tables

  3. Important Notes
    - The `tools` column uses text[] array type for storing multiple tool names
    - `featured` defaults to true so new projects appear on the site by default
    - Public SELECT allows the frontend to read data without authentication
    - Only authenticated users can INSERT/UPDATE/DELETE (for admin panel)
*/

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert site content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site content"
  ON site_content FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  process text NOT NULL DEFAULT '',
  tools text[] NOT NULL DEFAULT '{}',
  results text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read portfolio projects"
  ON portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert portfolio projects"
  ON portfolio_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update portfolio projects"
  ON portfolio_projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete portfolio projects"
  ON portfolio_projects FOR DELETE
  TO authenticated
  USING (true);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category ON portfolio_projects(category);
