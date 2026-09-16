-- ==============================================================================
-- MIGRATION: Enable Row Level Security (RLS) on site_config
-- Resolves Supabase Security Advisor alert: rls_disabled_in_public
-- ==============================================================================

-- 1. Enable RLS on site_config
ALTER TABLE IF EXISTS site_config ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public can read site config" ON site_config;
DROP POLICY IF EXISTS "Approved admins can update site config" ON site_config;
DROP POLICY IF EXISTS "Approved admins can insert site config" ON site_config;
DROP POLICY IF EXISTS "Authenticated users can update site config" ON site_config;

-- 3. Public read policy: Anyone (visitors) can fetch active theme
CREATE POLICY "Public can read site config"
  ON site_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Admin update/insert policy: Only approved admins can update or insert site config
CREATE POLICY "Approved admins can update site config"
  ON site_config FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can insert site config"
  ON site_config FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
