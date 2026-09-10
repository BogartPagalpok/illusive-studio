-- Restrict dashboard mutations to the two approved Google accounts.

DROP POLICY IF EXISTS "Authenticated users can insert site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can update site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can delete site content" ON site_content;

CREATE POLICY "Approved admins can insert site content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can delete site content"
  ON site_content FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

DROP POLICY IF EXISTS "Authenticated users can insert portfolio projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio projects" ON portfolio_projects;

CREATE POLICY "Approved admins can insert portfolio projects"
  ON portfolio_projects FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can update portfolio projects"
  ON portfolio_projects FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can delete portfolio projects"
  ON portfolio_projects FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

DROP POLICY IF EXISTS "Authenticated users can manage portfolio sections" ON portfolio_sections;

CREATE POLICY "Approved admins can manage portfolio sections"
  ON portfolio_sections FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
