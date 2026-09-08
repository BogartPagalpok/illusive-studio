ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_visible ON portfolio_projects(visible);

CREATE TABLE IF NOT EXISTS portfolio_sections (
  key text PRIMARY KEY,
  label text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_sections' AND policyname = 'Public can read portfolio sections') THEN
    CREATE POLICY "Public can read portfolio sections" ON portfolio_sections FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_sections' AND policyname = 'Authenticated users can manage portfolio sections') THEN
    CREATE POLICY "Authenticated users can manage portfolio sections" ON portfolio_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

INSERT INTO portfolio_sections (key, label)
VALUES
  ('about', 'About & Skills'),
  ('services', 'Services'),
  ('works', 'Portfolio Works'),
  ('contact', 'Contact')
ON CONFLICT (key) DO NOTHING;
