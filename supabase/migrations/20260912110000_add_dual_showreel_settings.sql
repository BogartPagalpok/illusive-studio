-- ==============================================================================
-- MIGRATION: Add Dual Showreel Configuration to portfolio_settings and sections
-- ==============================================================================

-- 1. Create or update portfolio_settings table
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id text PRIMARY KEY DEFAULT 'default',
  showreel_essay_is_coming_soon boolean NOT NULL DEFAULT false,
  showreel_essay_webm_url text DEFAULT '',
  showreel_essay_youtube_url text DEFAULT '',
  showreel_gaming_is_coming_soon boolean NOT NULL DEFAULT false,
  showreel_gaming_webm_url text DEFAULT '',
  showreel_gaming_youtube_url text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Ensure individual columns exist if table was already created
ALTER TABLE portfolio_settings
  ADD COLUMN IF NOT EXISTS showreel_essay_is_coming_soon boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS showreel_essay_webm_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS showreel_essay_youtube_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS showreel_gaming_is_coming_soon boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS showreel_gaming_webm_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS showreel_gaming_youtube_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Insert default row if not exists
INSERT INTO portfolio_settings (
  id,
  showreel_essay_is_coming_soon,
  showreel_essay_webm_url,
  showreel_essay_youtube_url,
  showreel_gaming_is_coming_soon,
  showreel_gaming_webm_url,
  showreel_gaming_youtube_url
)
VALUES (
  'default',
  false,
  '',
  '',
  false,
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS and Policies for portfolio_settings
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'portfolio_settings' 
    AND policyname = 'Public can read portfolio settings'
  ) THEN
    CREATE POLICY "Public can read portfolio settings" 
    ON portfolio_settings 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'portfolio_settings' 
    AND policyname = 'Authenticated users can manage portfolio settings'
  ) THEN
    CREATE POLICY "Authenticated users can manage portfolio settings" 
    ON portfolio_settings 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
  END IF;
END $$;

-- 4. Register Dual Showreel section in portfolio_sections
INSERT INTO portfolio_sections (key, label, visible)
VALUES ('dual-showreel', 'Dual Showreel', true)
ON CONFLICT (key) DO UPDATE 
SET label = 'Dual Showreel';
