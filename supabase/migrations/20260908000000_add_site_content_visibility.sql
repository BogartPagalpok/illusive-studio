ALTER TABLE site_content
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;

INSERT INTO site_content (section, key, value)
SELECT seed.section, seed.key, seed.value
FROM (VALUES
  ('about', 'skills_heading', 'Skills & Proficiency'),
  ('about', 'skill_1_name', 'Frontend Dev (React / Tailwind)'),
  ('about', 'skill_1_level', '90'),
  ('about', 'skill_2_name', 'Advanced Compositing (Ps)'),
  ('about', 'skill_2_level', '95'),
  ('about', 'skill_3_name', 'Motion Graphics & VFX'),
  ('about', 'skill_3_level', '85'),
  ('about', 'skill_4_name', 'Editorial Photography'),
  ('about', 'skill_4_level', '92'),
  ('about', 'skill_5_name', 'UI/UX Prototyping'),
  ('about', 'skill_5_level', '88'),
  ('about', 'skill_6_name', 'Agile Pipelines (Canva Pro)'),
  ('about', 'skill_6_level', '95'),
  ('about', 'skill_7_name', 'Digital Illustration'),
  ('about', 'skill_7_level', '90'),
  ('about', 'skill_8_name', 'Typography & Grid Systems'),
  ('about', 'skill_8_level', '87')
) AS seed(section, key, value)
WHERE NOT EXISTS (
  SELECT 1 FROM site_content existing
  WHERE existing.section = seed.section AND existing.key = seed.key
);