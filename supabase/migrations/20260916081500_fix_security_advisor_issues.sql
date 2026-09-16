-- ==============================================================================
-- MIGRATION: Resolve Supabase Security Advisor Alerts
-- 1. Fixes 4 ERRORS: Enables RLS on public.portfolio, public.services,
--    public.user_profiles, public.user_preferences
-- 2. Fixes WARNINGS: Locks down contact_messages to approved admins
-- 3. Fixes INFO: Adds appropriate policies for public.inquiries
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX ERRORS: Enable Row Level Security (RLS) on unshielded public tables
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- If user_profiles exists, ensure users can only read/manage their own row, or admins can view
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    
    CREATE POLICY "Users can view own profile"
      ON public.user_profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id OR (auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

    CREATE POLICY "Users can update own profile"
      ON public.user_profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id OR (auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
      WITH CHECK (auth.uid() = id OR (auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
  END IF;
END $$;

-- If user_preferences exists, restrict similarly
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;

    CREATE POLICY "Users can view own preferences"
      ON public.user_preferences FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

    CREATE POLICY "Users can update own preferences"
      ON public.user_preferences FOR ALL
      TO authenticated
      USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
  END IF;
END $$;

-- For legacy portfolio & services tables: public read, admin write
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'portfolio') THEN
    DROP POLICY IF EXISTS "Public can view portfolio" ON public.portfolio;
    DROP POLICY IF EXISTS "Admins can manage portfolio" ON public.portfolio;

    CREATE POLICY "Public can view portfolio"
      ON public.portfolio FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Admins can manage portfolio"
      ON public.portfolio FOR ALL
      TO authenticated
      USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
      WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services') THEN
    DROP POLICY IF EXISTS "Public can view services" ON public.services;
    DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

    CREATE POLICY "Public can view services"
      ON public.services FOR SELECT
      TO anon, authenticated
      USING (true);

    CREATE POLICY "Admins can manage services"
      ON public.services FOR ALL
      TO authenticated
      USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'))
      WITH CHECK ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. FIX WARNING: Lock down contact_messages so only approved admins can read/delete
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated users can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Approved admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Approved admins can delete contact messages" ON public.contact_messages;

CREATE POLICY "Approved admins can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

CREATE POLICY "Approved admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

-- ------------------------------------------------------------------------------
-- 3. FIX INFO: Add policies for public.inquiries (RLS was enabled with 0 policies)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
    ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
    DROP POLICY IF EXISTS "Approved admins can view inquiries" ON public.inquiries;
    DROP POLICY IF EXISTS "Approved admins can delete inquiries" ON public.inquiries;

    CREATE POLICY "Public can submit inquiries"
      ON public.inquiries FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);

    CREATE POLICY "Approved admins can view inquiries"
      ON public.inquiries FOR SELECT
      TO authenticated
      USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));

    CREATE POLICY "Approved admins can delete inquiries"
      ON public.inquiries FOR DELETE
      TO authenticated
      USING ((auth.jwt() ->> 'email') IN ('yhanlhester@gmail.com', 'illusivestudio.ph@gmail.com'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. FIX WARNINGS: Lock down any legacy tables (experience_items, pricing_items, media_items)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['experience_items', 'pricing_items', 'media_items'])
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Public can view %I" ON public.%I;', tbl, tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON public.%I;', tbl, tbl);
      EXECUTE format('CREATE POLICY "Public can view %I" ON public.%I FOR SELECT TO anon, authenticated USING (true);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Admins can manage %I" ON public.%I FOR ALL TO authenticated USING ((auth.jwt() ->> ''email'') IN (''yhanlhester@gmail.com'', ''illusivestudio.ph@gmail.com'')) WITH CHECK ((auth.jwt() ->> ''email'') IN (''yhanlhester@gmail.com'', ''illusivestudio.ph@gmail.com''));', tbl, tbl);
    END IF;
  END LOOP;
END $$;
